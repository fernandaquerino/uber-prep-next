import { addCalendarDays, getWeekday } from "./calendar-date";
import { InvalidAvailabilityError, NoStudyDaysEnabledError } from "./schedule.errors";
import type { CalendarDate, DayAvailability, Weekday, WeekdayAvailability } from "./schedule.types";
import { WEEKDAYS } from "./weekdays";

export const DEFAULT_WEEKDAY_AVAILABILITY: Readonly<WeekdayAvailability> = Object.freeze({
  monday: Object.freeze({ enabled: true, availableMinutes: 480 }),
  tuesday: Object.freeze({ enabled: true, availableMinutes: 480 }),
  wednesday: Object.freeze({ enabled: true, availableMinutes: 480 }),
  thursday: Object.freeze({ enabled: true, availableMinutes: 480 }),
  friday: Object.freeze({ enabled: true, availableMinutes: 480 }),
  saturday: Object.freeze({ enabled: true, availableMinutes: 240 }),
  sunday: Object.freeze({ enabled: false, availableMinutes: 0 }),
});

type SearchOptions = {
  includeCurrentDate?: boolean;
  maxSearchDays?: number;
};

export function getAvailabilityForDate(
  date: CalendarDate,
  availability: WeekdayAvailability,
): DayAvailability {
  validateWeekdayAvailability(availability);

  const dayAvailability = availability[getWeekday(date)];

  return {
    enabled: dayAvailability.enabled,
    availableMinutes: dayAvailability.availableMinutes,
  };
}

export function isStudyDate(date: CalendarDate, availability: WeekdayAvailability): boolean {
  const dayAvailability = getAvailabilityForDate(date, availability);

  return dayAvailability.enabled;
}

export function getNextStudyDate(
  date: CalendarDate,
  availability: WeekdayAvailability,
  options: SearchOptions = {},
): CalendarDate {
  validateWeekdayAvailability(availability);

  const maxSearchDays = options.maxSearchDays ?? 14;
  validateMaxSearchDays(maxSearchDays);

  for (let offset = options.includeCurrentDate ? 0 : 1; offset <= maxSearchDays; offset += 1) {
    const candidate = addCalendarDays(date, offset);

    if (isStudyDate(candidate, availability)) {
      return candidate;
    }
  }

  throw new NoStudyDaysEnabledError(`No study date found within ${maxSearchDays} days.`);
}

export function getPreviousStudyDate(
  date: CalendarDate,
  availability: WeekdayAvailability,
  options: SearchOptions = {},
): CalendarDate {
  validateWeekdayAvailability(availability);

  const maxSearchDays = options.maxSearchDays ?? 14;
  validateMaxSearchDays(maxSearchDays);

  for (let offset = options.includeCurrentDate ? 0 : 1; offset <= maxSearchDays; offset += 1) {
    const candidate = addCalendarDays(date, -offset);

    if (isStudyDate(candidate, availability)) {
      return candidate;
    }
  }

  throw new NoStudyDaysEnabledError(`No study date found within ${maxSearchDays} days.`);
}

export function validateWeekdayAvailability(availability: WeekdayAvailability): void {
  let enabledDays = 0;

  for (const weekday of WEEKDAYS) {
    const dayAvailability = availability[weekday];
    validateDayAvailability(weekday, dayAvailability);

    if (dayAvailability.enabled) {
      enabledDays += 1;
    }
  }

  if (enabledDays === 0) {
    throw new NoStudyDaysEnabledError("At least one weekday must be enabled for study.");
  }
}

function validateDayAvailability(
  weekday: Weekday,
  availability: DayAvailability | undefined,
): void {
  if (!availability) {
    throw new InvalidAvailabilityError(`Missing availability for ${weekday}.`);
  }

  if (!Number.isFinite(availability.availableMinutes) || availability.availableMinutes < 0) {
    throw new InvalidAvailabilityError(`Invalid available minutes for ${weekday}.`);
  }

  if (availability.enabled && availability.availableMinutes === 0) {
    throw new InvalidAvailabilityError(`Enabled weekday ${weekday} must have available minutes.`);
  }
}

function validateMaxSearchDays(maxSearchDays: number): void {
  if (!Number.isInteger(maxSearchDays) || maxSearchDays < 0) {
    throw new InvalidAvailabilityError("maxSearchDays must be a non-negative integer.");
  }
}
