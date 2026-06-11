import {
  addCalendarDays,
  compareCalendarDates,
  getAvailabilityForDate,
  getWeekday,
  isBeforeCalendarDate,
  isSameCalendarDate,
  type CalendarDate,
  type ScheduledStudyBlock,
  type ScheduledStudyDay,
} from "@/lib/domain/schedule";
import type {
  EffectiveScheduledBlock,
  EffectiveScheduledDay,
  EffectiveScheduleOptions,
  PlanBlockExecutionStatus,
  PlanBlockProgress,
  ScheduleOverride,
} from "./progress.types";
import { getProgressByBlockId } from "./progress-selectors";

export function buildEffectiveSchedule(
  baseSchedule: ScheduledStudyDay[],
  progress: PlanBlockProgress[],
  overrides: ScheduleOverride[] = [],
  options?: EffectiveScheduleOptions,
): EffectiveScheduledDay[] {
  const blockDates = new Map<string, CalendarDate>();

  for (const override of overrides) {
    blockDates.set(override.blockId, override.toDate);
  }

  for (const record of progress) {
    blockDates.set(record.blockId, record.scheduledDate);
  }

  const baseItems = baseSchedule.flatMap((day) =>
    day.items.map((item) => createEffectiveItem(item, day.date, progress, blockDates, options)),
  );

  const dateSet = new Set<string>(baseSchedule.map((day) => day.date));

  for (const item of baseItems) {
    dateSet.add(item.scheduledDate);
  }

  if (dateSet.size === 0) {
    return [];
  }

  const sortedDates = [...dateSet].sort() as CalendarDate[];
  const firstDate = sortedDates[0];
  const lastDate = sortedDates.at(-1) ?? firstDate;
  const days: EffectiveScheduledDay[] = [];
  let cursor = firstDate;

  while (compareCalendarDates(cursor, lastDate) <= 0) {
    const baseDay = baseSchedule.find((day) => isSameCalendarDate(day.date, cursor));
    const items = baseItems
      .filter((item) => isSameCalendarDate(item.scheduledDate, cursor))
      .sort((a, b) => a.planDaySequence - b.planDaySequence || a.blockId.localeCompare(b.blockId));
    const availability = baseDay
      ? {
          enabled: !baseDay.isRestDay,
          availableMinutes: baseDay.availableMinutes,
        }
      : options?.availability
        ? getAvailabilityForDate(cursor, options.availability)
        : { enabled: items.length > 0, availableMinutes: 0 };
    const totalEstimatedMinutes = items.reduce((total, item) => total + item.estimatedMinutes, 0);
    const isRestDay = !availability.enabled;

    days.push({
      date: cursor,
      weekday: baseDay?.weekday ?? getWeekday(cursor),
      availableMinutes: isRestDay ? 0 : availability.availableMinutes,
      isRestDay,
      items,
      totalEstimatedMinutes,
      remainingMinutes: isRestDay ? 0 : availability.availableMinutes - totalEstimatedMinutes,
      capacityStatus: isRestDay
        ? "rest"
        : totalEstimatedMinutes > availability.availableMinutes
          ? "over_capacity"
          : totalEstimatedMinutes === availability.availableMinutes
            ? "full"
            : "available",
    });
    cursor = addCalendarDays(cursor, 1);
  }

  return days.filter((day, index, allDays) => {
    if (day.items.length > 0) {
      return true;
    }

    const hasContentBefore = allDays
      .slice(0, index)
      .some((candidate) => candidate.items.length > 0);
    const hasContentAfter = allDays
      .slice(index + 1)
      .some((candidate) => candidate.items.length > 0);
    return hasContentBefore && hasContentAfter;
  });
}

function createEffectiveItem(
  item: ScheduledStudyBlock,
  baseDate: CalendarDate,
  progress: PlanBlockProgress[],
  blockDates: Map<string, CalendarDate>,
  options?: EffectiveScheduleOptions,
): EffectiveScheduledBlock {
  const record = getProgressByBlockId(progress, item.blockId);
  const originalScheduledDate = record?.originalScheduledDate ?? baseDate;
  const scheduledDate = blockDates.get(item.blockId) ?? baseDate;
  const executionStatus: PlanBlockExecutionStatus = record?.status ?? "pending";
  const timingStatus = options?.today
    ? compareCalendarDates(scheduledDate, options.today) < 0
      ? "past"
      : compareCalendarDates(scheduledDate, options.today) > 0
        ? "future"
        : "today"
    : "future";

  return {
    ...item,
    originalScheduledDate,
    scheduledDate,
    executionStatus,
    timingStatus,
    isOverdue:
      options?.today !== undefined &&
      isBeforeCalendarDate(scheduledDate, options.today) &&
      executionStatus !== "completed" &&
      executionStatus !== "skipped",
    isRescheduled: !isSameCalendarDate(originalScheduledDate, scheduledDate),
    completedAt: record?.completedAt,
    startedAt: record?.startedAt,
    skippedAt: record?.skippedAt,
    actualMinutes: record?.actualMinutes,
    difficulty: record?.difficulty,
    confidence: record?.confidence,
    notes: record?.notes,
    patternUsed: record?.patternUsed,
  };
}
