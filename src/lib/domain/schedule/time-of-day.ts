import { InvalidAvailabilityError } from "./schedule.errors";

/** Default start time used when a weekday does not configure its own. */
export const DEFAULT_START_TIME = "19:00";

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const MINUTES_PER_DAY = 24 * 60;

/** Returns true when `value` is a valid 24h "HH:mm" time-of-day string. */
export function isValidTimeOfDay(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** Parse "HH:mm" into minutes since midnight. Throws on malformed input. */
export function parseTimeOfDay(value: string): number {
  const match = TIME_PATTERN.exec(value);

  if (!match) {
    throw new InvalidAvailabilityError(`Invalid time of day: ${value}`);
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes since midnight back into a zero-padded "HH:mm" string. */
export function formatTimeOfDay(minutesSinceMidnight: number): string {
  const normalized = ((minutesSinceMidnight % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Add `minutes` to a "HH:mm" start time, returning a "HH:mm" string.
 * Wraps around midnight if the total exceeds 24h (defensive; a day should
 * not exceed its available minutes once reflow is applied).
 */
export function addMinutesToTime(startTime: string, minutes: number): string {
  return formatTimeOfDay(parseTimeOfDay(startTime) + minutes);
}
