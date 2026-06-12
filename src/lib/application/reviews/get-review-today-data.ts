import type { UberPrepDatabase } from "@/lib/db/schema";
import type { CalendarDate } from "@/lib/domain/schedule";
import { addCalendarDays, parseCalendarDate } from "@/lib/domain/schedule";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import type { ReviewRecord, LearningJournalRecord, WeeklyReflectionRecord } from "@/types/database";
import { buildReviewQueue } from "@/lib/domain/reviews";
import type { ReviewQueueItem, NextStudyPreview } from "@/lib/domain/reviews";
import { groupScheduleByCalendarWeek } from "@/lib/domain/schedule";

export type ReviewTodayData = {
  today: CalendarDate;
  summary: {
    dueToday: number;
    overdue: number;
    completedToday: number;
    upcoming: number;
    estimatedMinutes: number;
  };
  queue: ReviewQueueItem[];
  nextStudy: NextStudyPreview | null;
  journal: LearningJournalRecord | null;
  weeklyReflection: WeeklyReflectionRecord | null;
  currentWeekNumber: number;
  totalWeeks: number;
};

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return parseCalendarDate(`${y}-${m}-${d}`);
}

function buildNextStudyPreview(
  effectiveSchedule: EffectiveScheduledDay[],
  today: CalendarDate,
): NextStudyPreview | null {
  const tomorrow = addCalendarDays(today, 1);

  const nextDay = effectiveSchedule.find(
    (d) => !d.isRestDay && d.date > today && d.items.length > 0,
  );

  if (!nextDay) return null;

  const pendingItems = nextDay.items.filter(
    (i) => i.executionStatus !== "completed" && i.executionStatus !== "skipped",
  );

  if (pendingItems.length === 0) return null;

  return {
    date: nextDay.date,
    dateLabel: nextDay.date,
    weekdayLabel: nextDay.weekday,
    isTomorrow: nextDay.date === tomorrow,
    isToday: false,
    items: pendingItems.map((i) => ({
      blockId: i.blockId,
      title: i.title,
      category: i.category,
      type: i.type,
      estimatedMinutes: i.estimatedMinutes,
      executionStatus: i.executionStatus,
    })),
    estimatedMinutes: pendingItems.reduce((s, i) => s + i.estimatedMinutes, 0),
  };
}

export type GetReviewTodayDataResult =
  | { kind: "ready"; data: ReviewTodayData }
  | { kind: "no_start_date" };

export async function getReviewTodayData(
  db: UberPrepDatabase,
  effectiveSchedule: EffectiveScheduledDay[],
  baseSchedule: Parameters<typeof groupScheduleByCalendarWeek>[0],
): Promise<ReviewTodayData> {
  const today = getTodayCalendarDate();

  const allReviews: ReviewRecord[] = await db.reviews.toArray();
  const activeReviews = allReviews.filter((r) => r.status === "scheduled" || r.status === "due");

  const dueReviews = activeReviews.filter((r) => (r.scheduledFor as CalendarDate) <= today);
  const overdueReviews = dueReviews.filter((r) => (r.scheduledFor as CalendarDate) < today);
  const dueTodayReviews = dueReviews.filter((r) => (r.scheduledFor as CalendarDate) === today);
  const upcomingReviews = activeReviews.filter((r) => (r.scheduledFor as CalendarDate) > today);
  const completedToday = allReviews.filter(
    (r) => r.status === "completed" && r.doneAt?.startsWith(today),
  );

  // Load flashcard front texts for title resolution in the review queue
  const flashcards = await db.flashcards.toArray();
  const flashcardTitles = new Map(flashcards.map((c) => [c.id, c.front]));

  const queue = buildReviewQueue({ reviews: dueReviews, effectiveSchedule, today, flashcardTitles });

  const estimatedMinutes = queue.reduce((s, q) => s + (q.estimatedMinutes ?? 15), 0);

  const nextStudy = buildNextStudyPreview(effectiveSchedule, today);

  const journal = (await db.learningJournal.where("date").equals(today).first()) ?? null;

  // Calculate current week number from base schedule
  const weeks = groupScheduleByCalendarWeek(baseSchedule);
  const currentWeekIdx = weeks.findIndex((w) => w.weekStart <= today && today <= w.weekEnd);
  const currentWeekNumber = currentWeekIdx === -1 ? 1 : currentWeekIdx + 1;
  const totalWeeks = weeks.length;

  const weeklyReflection =
    (await db.weeklyReflections.where("weekNumber").equals(currentWeekNumber).first()) ?? null;

  return {
    today,
    summary: {
      dueToday: dueTodayReviews.length,
      overdue: overdueReviews.length,
      completedToday: completedToday.length,
      upcoming: upcomingReviews.length,
      estimatedMinutes,
    },
    queue,
    nextStudy,
    journal,
    weeklyReflection,
    currentWeekNumber,
    totalWeeks,
  };
}
