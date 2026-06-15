import type { CalendarDate } from "@/lib/domain/schedule";
import {
  addCalendarDays,
  buildStudySchedule,
  groupScheduleByCalendarWeek,
  parseCalendarDate,
} from "@/lib/domain/schedule";
import {
  getCurrentStudyState,
  getPlanCompletionSummary,
  getCompletedPlanItems,
} from "@/lib/domain/progress";
import { getEffectiveSchedule } from "@/lib/application/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import type { DashboardViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";
import { buildDashboardViewModel } from "./build-dashboard-view-model";
import { getDashboardAnalytics } from "./get-dashboard-analytics";

// ─── Exported supporting types ────────────────────────────────────────────────

export type ActivityDay = {
  date: CalendarDate;
  completedCount: number;
  isRestDay: boolean;
};

export type DashboardStreak = {
  current: number;
  longestEver: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const sortedDays = [...activityDays].sort((a, b) => b.date.localeCompare(a.date));
  let current = 0;
  let longestEver = 0;
  let runLength = 0;
  let counting = true;

  for (const day of sortedDays) {
    if (day.date > today) continue;
    if (day.isRestDay) continue;

    if (day.completedCount > 0) {
      runLength++;
      if (counting) current++;
    } else {
      if (counting) counting = false;
      longestEver = Math.max(longestEver, runLength);
      runLength = 0;
    }
  }

  longestEver = Math.max(longestEver, runLength);
  return { current, longestEver };
}

// ─── Main use case ────────────────────────────────────────────────────────────

export type GetDashboardDataResult =
  | { kind: "ready"; viewModel: DashboardViewModel }
  | { kind: "no_start_date" };

export async function getDashboardData(): Promise<GetDashboardDataResult> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { getSettings } = await import("@/lib/application/settings");

  const db = getDb();
  await runSeeds(db);

  const settings = await getSettings(db);
  if (!settings.startDate) {
    return { kind: "no_start_date" };
  }

  const startDate = parseCalendarDate(settings.startDate);
  const today = getTodayCalendarDate();
  const availability = settings.weekdayAvailability;

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

  const weeks = groupScheduleByCalendarWeek(
    baseSchedule as Parameters<typeof groupScheduleByCalendarWeek>[0],
  );

  const activityDays = buildActivityDays(effectiveSchedule);
  const streak = computeStreak(activityDays, today);

  // Count due reviews for dashboard priorities
  let dueReviewCount = 0;
  try {
    const { buildReviewQueue } = await import("@/lib/domain/reviews/review-queue");
    const allReviews = await db.reviews.toArray();
    const queue = buildReviewQueue({ reviews: allReviews, effectiveSchedule, today });
    dueReviewCount = queue.length;
  } catch {
    // Non-fatal: if reviews module fails, dashboard still loads
  }

  const [timerResult, todayActivity, analytics] = await Promise.all([
    (async () => {
      try {
        const [{ getTimerDailySummary, getTimerWeeklySummary }, { getWeekRange }] =
          await Promise.all([import("@/lib/domain/timer"), import("@/lib/application/timer")]);
        const [sessions, activeTimer] = await Promise.all([
          db.timerSessions.toArray(),
          db.activeTimer.toCollection().first(),
        ]);
        const weekRange = getWeekRange(today);
        const todaySummary = getTimerDailySummary(sessions, today);
        const weekSummary = getTimerWeeklySummary(sessions, weekRange.start, weekRange.end);

        // Minutes studied per weekday in the current week (for the week chart).
        const weekDailyMinutes: Record<string, number> = {};
        let cursor = parseCalendarDate(weekRange.start);
        const end = parseCalendarDate(weekRange.end);
        while (cursor <= end) {
          weekDailyMinutes[cursor] = Math.round(getTimerDailySummary(sessions, cursor).totalSeconds / 60);
          cursor = addCalendarDays(cursor, 1);
        }

        return {
          timer: {
            activeTitle: activeTimer?.title ?? null,
            activeStatus: activeTimer?.status ?? null,
            activeCategory: activeTimer?.category ?? null,
            todaySeconds: todaySummary.totalSeconds,
            todaySessionCount: todaySummary.sessionCount,
            weekSeconds: weekSummary.totalSeconds,
            weekSessionCount: weekSummary.sessionCount,
          },
          weekDailyMinutes,
        };
      } catch {
        return {
          timer: {
            activeTitle: null,
            activeStatus: null,
            activeCategory: null,
            todaySeconds: 0,
            todaySessionCount: 0,
            weekSeconds: 0,
            weekSessionCount: 0,
          },
          weekDailyMinutes: {} as Record<string, number>,
        };
      }
    })(),
    (async () => {
      try {
        const [attempts, flashcards] = await Promise.all([
          db.quizAttempts.toArray(),
          db.flashcards.toArray(),
        ]);
        const questionsAnswered = attempts
          .filter((a) => a.finishedAt?.slice(0, 10) === today)
          .reduce((sum, a) => sum + a.totalQuestions, 0);
        const flashcardsReviewed = flashcards.reduce(
          (sum, card) => sum + card.reviews.filter((r) => r.date.slice(0, 10) === today).length,
          0,
        );
        return { questionsAnswered, flashcardsReviewed };
      } catch {
        return { questionsAnswered: 0, flashcardsReviewed: 0 };
      }
    })(),
    getDashboardAnalytics(db, today),
  ]);

  const { timer, weekDailyMinutes } = timerResult;

  const viewModel = buildDashboardViewModel({
    today,
    startDate,
    effectiveSchedule,
    currentStudyState,
    completionSummary,
    weeks,
    activityDays,
    streak,
    dueReviewCount,
    timer,
    analytics,
    weekDailyMinutes,
    todayQuestionsAnswered: todayActivity.questionsAnswered,
    todayFlashcardsReviewed: todayActivity.flashcardsReviewed,
  });

  return { kind: "ready", viewModel };
}
