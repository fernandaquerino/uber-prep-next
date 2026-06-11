import {
  compareCalendarDates,
  getCalendarWeekEnd,
  getCalendarWeekStart,
  isSameCalendarDate,
} from "./calendar-date";
import type {
  CalendarDate,
  ScheduledStudyDay,
  ScheduledWeek,
  ScheduleDayStatus,
} from "./schedule.types";

export function getScheduledDayByDate(
  schedule: ScheduledStudyDay[],
  date: CalendarDate,
): ScheduledStudyDay | undefined {
  return schedule.find((day) => isSameCalendarDate(day.date, date));
}

export function getFirstStudyDay(schedule: ScheduledStudyDay[]): ScheduledStudyDay | undefined {
  return schedule.find((day) => !day.isRestDay);
}

export function getLastStudyDay(schedule: ScheduledStudyDay[]): ScheduledStudyDay | undefined {
  return [...schedule].reverse().find((day) => !day.isRestDay);
}

export function getNextScheduledStudyDay(
  schedule: ScheduledStudyDay[],
  date: CalendarDate,
): ScheduledStudyDay | undefined {
  return schedule.find((day) => !day.isRestDay && compareCalendarDates(day.date, date) > 0);
}

export function getPreviousScheduledStudyDay(
  schedule: ScheduledStudyDay[],
  date: CalendarDate,
): ScheduledStudyDay | undefined {
  return [...schedule]
    .reverse()
    .find((day) => !day.isRestDay && compareCalendarDates(day.date, date) < 0);
}

export function getScheduleDayStatus(
  scheduledDate: CalendarDate,
  today: CalendarDate,
): ScheduleDayStatus {
  const comparison = compareCalendarDates(scheduledDate, today);

  if (comparison < 0) {
    return "past";
  }

  if (comparison > 0) {
    return "future";
  }

  return "today";
}

export function getScheduleRange(schedule: ScheduledStudyDay[]): {
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
} {
  return {
    startDate: schedule[0]?.date ?? null,
    endDate: schedule.at(-1)?.date ?? null,
  };
}

export function groupScheduleByCalendarWeek(schedule: ScheduledStudyDay[]): ScheduledWeek[] {
  const weeks = new Map<string, ScheduledWeek>();

  for (const day of schedule) {
    const weekStart = getCalendarWeekStart(day.date);
    const weekEnd = getCalendarWeekEnd(day.date);
    const weekId = `${weekStart}_${weekEnd}`;
    const week = weeks.get(weekId);

    if (week) {
      week.days.push(day);
    } else {
      weeks.set(weekId, {
        id: weekId,
        weekStart,
        weekEnd,
        days: [day],
      });
    }
  }

  return [...weeks.values()];
}
