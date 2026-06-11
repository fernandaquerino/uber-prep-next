import type { CalendarDate } from "@/lib/domain/schedule";
import {
  buildStudySchedule,
  parseCalendarDate,
  DEFAULT_WEEKDAY_AVAILABILITY,
} from "@/lib/domain/schedule";
import {
  getCurrentStudyState,
  getPlanCompletionSummary,
  getCompletedPlanItems,
  getOverduePlanItems,
} from "@/lib/domain/progress";
import { getEffectiveSchedule } from "@/lib/application/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import type { DashboardData, ActivityDay, DashboardStreak } from "@/lib/presentation/dashboard/dashboard-view-model";
import { getDashboardRecommendations } from "./get-dashboard-recommendations";

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return parseCalendarDate(`${y}-${m}-${d}`);
}

function buildActivityDays(
  effectiveSchedule: Awaited<ReturnType<typeof getEffectiveSchedule>>,
): ActivityDay[] {
  const completedItems = getCompletedPlanItems(effectiveSchedule);

  const countByDate = new Map<CalendarDate, number>();
  for (const item of completedItems) {
    if (!item.completedAt) continue;
    const date = item.completedAt.slice(0, 10) as CalendarDate;
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }

  const restDates = new Set<CalendarDate>(
    effectiveSchedule.filter((d) => d.isRestDay).map((d) => d.date),
  );

  // Include all dates that appear in the schedule
  const allDates = new Set<CalendarDate>([
    ...effectiveSchedule.map((d) => d.date),
    ...countByDate.keys(),
  ]);

  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      completedCount: countByDate.get(date) ?? 0,
      isRestDay: restDates.has(date),
    }));
}

function computeStreak(activityDays: ActivityDay[], today: CalendarDate): DashboardStreak {
  // Streak: consecutive study days (non-rest) with ≥1 completed block, going backwards from today.
  // Rest days do not break the streak.
  const sortedDays = [...activityDays].sort((a, b) => b.date.localeCompare(a.date));

  let current = 0;
  let longestEver = 0;
  let runLength = 0;
  let counting = true;

  for (const day of sortedDays) {
    if (day.date > today) continue;
    if (day.isRestDay) continue; // rest days are transparent

    if (day.completedCount > 0) {
      runLength++;
      if (counting) current++;
    } else {
      // Study day with no activity — ends both current and this run
      if (counting) counting = false;
      longestEver = Math.max(longestEver, runLength);
      runLength = 0;
    }
  }

  longestEver = Math.max(longestEver, runLength);
  return { current, longestEver };
}

export type GetDashboardDataResult =
  | { kind: "ready"; data: DashboardData }
  | { kind: "no_start_date" };

export async function getDashboardData(): Promise<GetDashboardDataResult> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { SETTINGS_ID } = await import("@/lib/db/constants");

  const db = getDb();
  await runSeeds(db);

  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings?.startDate) {
    return { kind: "no_start_date" };
  }

  const startDate = parseCalendarDate(settings.startDate);
  const today = getTodayCalendarDate();
  const availability = DEFAULT_WEEKDAY_AVAILABILITY;

  const baseSchedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: settings.timezone ?? "America/Sao_Paulo",
    weekdayAvailability: availability,
  });

  const effectiveSchedule = await getEffectiveSchedule({
    db,
    baseSchedule,
    today,
    availability,
  });

  const currentStudyState = getCurrentStudyState(effectiveSchedule);
  const completionSummary = getPlanCompletionSummary(effectiveSchedule);
  const overdueItems = getOverduePlanItems(effectiveSchedule);

  const activityDays = buildActivityDays(effectiveSchedule);
  const streak = computeStreak(activityDays, today);

  const todayDay = effectiveSchedule.find((d) => d.date === today) ?? null;

  const todayItems = todayDay?.items ?? [];
  const todayProgress = {
    completedCount: todayItems.filter((i) => i.executionStatus === "completed").length,
    totalCount: todayItems.length,
    completedMinutes: todayItems
      .filter((i) => i.executionStatus === "completed")
      .reduce((sum, i) => sum + (i.actualMinutes ?? i.estimatedMinutes), 0),
    estimatedMinutes: todayItems.reduce((sum, i) => sum + i.estimatedMinutes, 0),
    isRestDay: todayDay?.isRestDay ?? false,
  };

  // Upcoming: next 3 non-rest, future items not already in the current study state
  const upcomingItems = effectiveSchedule
    .filter((d) => d.date > today && !d.isRestDay)
    .flatMap((d) => d.items)
    .filter(
      (item) =>
        item.executionStatus === "pending" &&
        item.blockId !== currentStudyState.currentItem?.blockId,
    )
    .slice(0, 3);

  const recommendations = getDashboardRecommendations({ currentStudyState, completionSummary });

  return {
    kind: "ready",
    data: {
      today,
      startDate,
      currentStudyState,
      completionSummary,
      todayProgress,
      activityDays,
      streak,
      overdueItems,
      upcomingItems,
      recommendations,
      todayDay,
    },
  };
}
