import { parseCalendarDate } from "@/lib/domain/schedule";
import { InvalidProgressInputError } from "./progress.errors";

export function assertNonEmptyId(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new InvalidProgressInputError(`${label} is required.`);
  }
}

export function assertValidIsoTimestamp(value: string, label: string): void {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new InvalidProgressInputError(`${label} must be a valid ISO timestamp.`);
  }
}

export function assertOptionalNonNegativeNumber(value: number | undefined, label: string): void {
  if (value === undefined) {
    return;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new InvalidProgressInputError(`${label} must be a non-negative finite number.`);
  }
}

export function assertOptionalRating(value: number | undefined, label: string): void {
  if (value === undefined) {
    return;
  }

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new InvalidProgressInputError(`${label} must be an integer between 1 and 5.`);
  }
}

export function assertCalendarDateString(value: string, label: string): void {
  try {
    parseCalendarDate(value);
  } catch {
    throw new InvalidProgressInputError(`${label} must be a valid calendar date.`);
  }
}
