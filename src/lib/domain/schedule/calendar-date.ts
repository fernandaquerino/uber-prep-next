import { InvalidCalendarDateError } from "./schedule.errors";
import type { CalendarDate, Weekday } from "./schedule.types";

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAYS_BY_UTC_DAY: Record<number, Weekday> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

export function parseCalendarDate(value: string): CalendarDate {
  if (!isValidCalendarDate(value)) {
    throw new InvalidCalendarDateError(`Invalid calendar date: ${value}`);
  }

  return value as CalendarDate;
}

export function isValidCalendarDate(value: string): boolean {
  const parts = parseParts(value);

  if (!parts) {
    return false;
  }

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

export function addCalendarDays(date: CalendarDate, amount: number): CalendarDate {
  if (!Number.isInteger(amount)) {
    throw new InvalidCalendarDateError(`Day amount must be an integer: ${amount}`);
  }

  const timestamp = toUtcTimestamp(date) + amount * MILLISECONDS_PER_DAY;
  return fromUtcDate(new Date(timestamp));
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function differenceInCalendarDates(a: CalendarDate, b: CalendarDate): number {
  return (toUtcTimestamp(a) - toUtcTimestamp(b)) / MILLISECONDS_PER_DAY;
}

export function getWeekday(date: CalendarDate): Weekday {
  return WEEKDAYS_BY_UTC_DAY[new Date(toUtcTimestamp(date)).getUTCDay()];
}

export function isBeforeCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareCalendarDates(a, b) < 0;
}

export function isAfterCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareCalendarDates(a, b) > 0;
}

export function isSameCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareCalendarDates(a, b) === 0;
}

export function getCalendarWeekStart(date: CalendarDate): CalendarDate {
  const weekday = getWeekday(date);
  const daysSinceMonday: Record<Weekday, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  return addCalendarDays(date, -daysSinceMonday[weekday]);
}

export function getCalendarWeekEnd(date: CalendarDate): CalendarDate {
  return addCalendarDays(getCalendarWeekStart(date), 6);
}

function parseParts(value: string): CalendarDateParts | null {
  const match = CALENDAR_DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function toUtcTimestamp(date: CalendarDate): number {
  const parts = parseParts(date);

  if (!parts) {
    throw new InvalidCalendarDateError(`Invalid calendar date: ${date}`);
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function fromUtcDate(date: Date): CalendarDate {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return parseCalendarDate(`${year}-${month}-${day}`);
}
