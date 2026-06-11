import {
  getCalendarWeekStart,
  getCalendarWeekEnd,
  addCalendarDays,
  compareCalendarDates,
  getWeekday,
  parseCalendarDate,
} from "@/lib/domain/schedule";
import type { CalendarDate, Weekday } from "@/lib/domain/schedule";
import type { EffectiveScheduledBlock, EffectiveScheduledDay } from "./progress.types";

// ─── Category progress ────────────────────────────────────────────────────────

export type CategoryProgress = {
  category: string;
  total: number;
  completed: number;
  inProgress: number;
  stuck: number;
  skipped: number;
};

export function getPlanProgressByCategory(schedule: EffectiveScheduledDay[]): CategoryProgress[] {
  const map = new Map<string, CategoryProgress>();

  for (const day of schedule) {
    for (const item of day.items) {
      const key = item.category ?? "general";
      const existing = map.get(key);
      if (existing) {
        existing.total++;
        if (item.executionStatus === "completed") existing.completed++;
        else if (item.executionStatus === "in_progress") existing.inProgress++;
        else if (item.executionStatus === "stuck") existing.stuck++;
        else if (item.executionStatus === "skipped") existing.skipped++;
      } else {
        map.set(key, {
          category: key,
          total: 1,
          completed: item.executionStatus === "completed" ? 1 : 0,
          inProgress: item.executionStatus === "in_progress" ? 1 : 0,
          stuck: item.executionStatus === "stuck" ? 1 : 0,
          skipped: item.executionStatus === "skipped" ? 1 : 0,
        });
      }
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

// ─── Current week days ────────────────────────────────────────────────────────

export type WeekDayStatus =
  | "completed"
  | "partial"
  | "pending"
  | "overdue"
  | "today"
  | "future"
  | "rest";

export type WeekDayInfo = {
  date: CalendarDate;
  weekday: Weekday;
  isToday: boolean;
  isRestDay: boolean;
  completed: number;
  total: number;
  overdue: number;
  status: WeekDayStatus;
};

export function getCurrentWeekDays(
  schedule: EffectiveScheduledDay[],
  today: CalendarDate,
): WeekDayInfo[] {
  const weekStart = getCalendarWeekStart(today);
  const weekEnd = getCalendarWeekEnd(today);

  const dayMap = new Map<CalendarDate, EffectiveScheduledDay>(schedule.map((d) => [d.date, d]));

  const result: WeekDayInfo[] = [];

  for (let i = 0; i <= 6; i++) {
    const date = addCalendarDays(weekStart, i) as CalendarDate;
    if (compareCalendarDates(date, weekEnd) > 0) break;

    const effectiveDay = dayMap.get(date);
    const weekday = getWeekday(date);
    const isToday = date === today;
    const isRestDay = effectiveDay?.isRestDay ?? !effectiveDay;
    const items = effectiveDay?.items ?? [];

    const completed = items.filter((i) => i.executionStatus === "completed").length;
    const total = items.length;
    const overdue = items.filter((i) => i.isOverdue).length;

    let status: WeekDayStatus;
    if (isRestDay) {
      status = "rest";
    } else if (isToday) {
      status = "today";
    } else if (compareCalendarDates(date, today) > 0) {
      status = "future";
    } else if (overdue > 0 && completed < total) {
      status = "overdue";
    } else if (total > 0 && completed === total) {
      status = "completed";
    } else if (completed > 0) {
      status = "partial";
    } else {
      status = "pending";
    }

    result.push({ date, weekday, isToday, isRestDay, completed, total, overdue, status });
  }

  return result;
}

// ─── Week item summary ────────────────────────────────────────────────────────

export type WeekItemSummary = {
  completed: number;
  total: number;
  inProgress: number;
  stuck: number;
  overdue: number;
};

export function getWeekItemSummary(
  weekDays: WeekDayInfo[],
  schedule: EffectiveScheduledDay[],
): WeekItemSummary {
  const weekDates = new Set(weekDays.map((d) => d.date));
  let completed = 0;
  let total = 0;
  let inProgress = 0;
  let stuck = 0;
  let overdue = 0;

  for (const day of schedule) {
    if (!weekDates.has(day.date)) continue;
    for (const item of day.items) {
      total++;
      if (item.executionStatus === "completed") completed++;
      else if (item.executionStatus === "in_progress") inProgress++;
      else if (item.executionStatus === "stuck") stuck++;
      if (item.isOverdue) overdue++;
    }
  }

  return { completed, total, inProgress, stuck, overdue };
}

// ─── Upcoming items ───────────────────────────────────────────────────────────

export function getUpcomingStudyItems(
  schedule: EffectiveScheduledDay[],
  currentBlockId: string | null,
  count = 5,
): EffectiveScheduledBlock[] {
  const upcoming: EffectiveScheduledBlock[] = [];

  for (const day of schedule) {
    if (day.isRestDay) continue;
    for (const item of day.items) {
      if (item.blockId === currentBlockId) continue;
      if (item.executionStatus === "completed" || item.executionStatus === "skipped") continue;
      if (item.timingStatus === "past" && !item.isOverdue) continue;
      upcoming.push(item);
      if (upcoming.length >= count) return upcoming;
    }
  }

  return upcoming;
}

// ─── Activity grouped ─────────────────────────────────────────────────────────

export type ActivityWeekRow = {
  weekStart: CalendarDate;
  days: ActivityDayInfo[];
};

export type ActivityDayInfo = {
  date: CalendarDate;
  completedCount: number;
  isRestDay: boolean;
  isToday: boolean;
  intensity: 0 | 1 | 2 | 3;
};

export function getActivityWeeks(
  schedule: EffectiveScheduledDay[],
  today: CalendarDate,
  maxWeeks = 12,
): ActivityWeekRow[] {
  // Build count map from completed items' completedAt date
  const countByDate = new Map<CalendarDate, number>();
  for (const day of schedule) {
    for (const item of day.items) {
      if (item.executionStatus !== "completed" || !item.completedAt) continue;
      const date = parseCalendarDate(item.completedAt.slice(0, 10));
      countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
    }
  }

  const restDates = new Set<CalendarDate>(schedule.filter((d) => d.isRestDay).map((d) => d.date));

  // Determine date range: plan start to today (at most maxWeeks)
  const planStart = schedule[0]?.date ?? today;
  const rangeStart = addCalendarDays(getCalendarWeekStart(planStart), 0) as CalendarDate;
  const weekStart = getCalendarWeekStart(today);

  // Weeks from rangeStart to weekStart
  const allWeekStarts: CalendarDate[] = [];
  let ws = rangeStart;
  while (compareCalendarDates(ws, weekStart) <= 0) {
    allWeekStarts.push(ws as CalendarDate);
    ws = addCalendarDays(ws, 7) as CalendarDate;
  }

  const sliced = allWeekStarts.slice(-maxWeeks);

  return sliced.map((weekStartDate) => {
    const days: ActivityDayInfo[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addCalendarDays(weekStartDate, i) as CalendarDate;
      const count = countByDate.get(date) ?? 0;
      const isRest = restDates.has(date);
      days.push({
        date,
        completedCount: count,
        isRestDay: isRest,
        isToday: date === today,
        intensity: isRest ? 0 : count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3,
      });
    }
    return { weekStart: weekStartDate, days };
  });
}
