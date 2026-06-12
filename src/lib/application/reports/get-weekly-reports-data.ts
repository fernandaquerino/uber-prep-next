import { STUDY_PLAN } from "@/lib/data/study-plan";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { getSettings } from "@/lib/application/settings/settings-use-cases";
import {
  buildStudySchedule,
  groupScheduleByCalendarWeek,
  parseCalendarDate,
} from "@/lib/domain/schedule";
import { getEffectiveSchedule } from "@/lib/application/progress";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import { getDashboardAnalytics } from "@/lib/application/dashboard/get-dashboard-analytics";
import { buildWeeklyReport, type WeeklyReport, type WeeklyReportWeek } from "@/lib/domain/reports";
import type { WeeklyReportSnapshotRecord } from "@/types/database";

export type WeeklyReportsData = {
  weeks: WeeklyReportWeek[];
  selectedWeekNumber: number;
  liveReport: WeeklyReport;
  snapshot: WeeklyReport | null;
};

export type GetWeeklyReportsDataResult =
  | { kind: "ready"; data: WeeklyReportsData }
  | { kind: "no_start_date" };

function parseSnapshot(record: WeeklyReportSnapshotRecord | undefined): WeeklyReport | null {
  if (!record) return null;
  try {
    return JSON.parse(record.reportJson) as WeeklyReport;
  } catch {
    return null;
  }
}

function getTodayCalendarDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export async function getWeeklyReportsData(
  db: UberPrepDatabase,
  selectedWeekNumber?: number,
  todayValue?: string,
): Promise<GetWeeklyReportsDataResult> {
  const settings = await getSettings(db);
  if (!settings.startDate) return { kind: "no_start_date" };

  const today = parseCalendarDate(todayValue ?? getTodayCalendarDate());
  const startDate = parseCalendarDate(settings.startDate);
  const availability = settings.weekdayAvailability;
  const baseSchedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: settings.timezone,
    weekdayAvailability: availability,
  });
  const [effectiveSchedule, analytics, reflections, snapshots] = await Promise.all([
    getEffectiveSchedule({ db, baseSchedule, today, availability }),
    getDashboardAnalytics(db, today),
    db.weeklyReflections.toArray(),
    db.weeklyReportSnapshots.toArray(),
  ]);
  const weeks: WeeklyReportWeek[] = groupScheduleByCalendarWeek(baseSchedule).map(
    (baseWeek, index) => ({
      weekNumber: index + 1,
      weekStart: baseWeek.weekStart,
      weekEnd: baseWeek.weekEnd,
      status: today < baseWeek.weekStart ? "future" : today > baseWeek.weekEnd ? "past" : "current",
      days: effectiveSchedule.filter(
        (day) => baseWeek.weekStart <= day.date && day.date <= baseWeek.weekEnd,
      ) as EffectiveScheduledDay[],
    }),
  );
  const currentIndex = weeks.findIndex((week) => week.status === "current");
  const fallbackWeek =
    currentIndex >= 0 ? currentIndex + 1 : today < weeks[0]!.weekStart ? 1 : weeks.length;
  const weekNumber = Math.min(Math.max(selectedWeekNumber ?? fallbackWeek, 1), weeks.length);
  const reports: WeeklyReport[] = [];
  for (const week of weeks.slice(0, weekNumber)) {
    reports.push(
      buildWeeklyReport({
        week,
        today,
        allEvidence: analytics.evidence,
        plannedTopicIds: analytics.plannedTopicIds,
        reflection: reflections.find((item) => item.weekNumber === week.weekNumber),
        previous: reports.at(-1) ?? null,
      }),
    );
  }
  const liveReport = reports.at(-1)!;
  const snapshotRecord = snapshots.find((item) => item.weekNumber === weekNumber);
  return {
    kind: "ready",
    data: {
      weeks,
      selectedWeekNumber: weekNumber,
      liveReport,
      snapshot: parseSnapshot(snapshotRecord),
    },
  };
}
