import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEEKDAY_AVAILABILITY,
  getAvailabilityForDate,
  getNextStudyDate,
  getPreviousStudyDate,
  isStudyDate,
  parseCalendarDate,
  validateWeekdayAvailability,
  type WeekdayAvailability,
} from "../index";
import { InvalidAvailabilityError, NoStudyDaysEnabledError } from "../schedule.errors";

describe("availability", () => {
  it("returns default weekday availability", () => {
    // Monday — enabled evening study (2h)
    expect(
      getAvailabilityForDate(parseCalendarDate("2026-06-15"), DEFAULT_WEEKDAY_AVAILABILITY),
    ).toEqual({
      enabled: true,
      availableMinutes: 120,
    });
    // Saturday — rest by default
    expect(
      getAvailabilityForDate(parseCalendarDate("2026-06-13"), DEFAULT_WEEKDAY_AVAILABILITY),
    ).toEqual({
      enabled: false,
      availableMinutes: 0,
    });
    // Sunday — rest by default
    expect(
      getAvailabilityForDate(parseCalendarDate("2026-06-14"), DEFAULT_WEEKDAY_AVAILABILITY),
    ).toEqual({
      enabled: false,
      availableMinutes: 0,
    });
  });

  it("detects study and rest dates", () => {
    expect(isStudyDate(parseCalendarDate("2026-06-15"), DEFAULT_WEEKDAY_AVAILABILITY)).toBe(true);
    expect(isStudyDate(parseCalendarDate("2026-06-14"), DEFAULT_WEEKDAY_AVAILABILITY)).toBe(false);
  });

  it("finds the next study date around the weekend", () => {
    expect(getNextStudyDate(parseCalendarDate("2026-06-13"), DEFAULT_WEEKDAY_AVAILABILITY)).toBe(
      "2026-06-15",
    );
    expect(getNextStudyDate(parseCalendarDate("2026-06-14"), DEFAULT_WEEKDAY_AVAILABILITY)).toBe(
      "2026-06-15",
    );
  });

  it("supports includeCurrentDate for next and previous study dates", () => {
    // 2026-06-15 is a Monday (enabled), so includeCurrentDate returns it as-is.
    expect(
      getNextStudyDate(parseCalendarDate("2026-06-15"), DEFAULT_WEEKDAY_AVAILABILITY, {
        includeCurrentDate: true,
      }),
    ).toBe("2026-06-15");
    expect(
      getPreviousStudyDate(parseCalendarDate("2026-06-15"), DEFAULT_WEEKDAY_AVAILABILITY, {
        includeCurrentDate: true,
      }),
    ).toBe("2026-06-15");
  });

  it("rejects a week with all days disabled", () => {
    const disabled = Object.fromEntries(
      Object.keys(DEFAULT_WEEKDAY_AVAILABILITY).map((weekday) => [
        weekday,
        { enabled: false, availableMinutes: 0 },
      ]),
    ) as WeekdayAvailability;

    expect(() => validateWeekdayAvailability(disabled)).toThrow(NoStudyDaysEnabledError);
  });

  it("rejects negative minutes", () => {
    const availability = {
      ...DEFAULT_WEEKDAY_AVAILABILITY,
      monday: { enabled: true, availableMinutes: -1 },
    };

    expect(() => validateWeekdayAvailability(availability)).toThrow(InvalidAvailabilityError);
  });

  it("rejects enabled days with zero capacity", () => {
    const availability = {
      ...DEFAULT_WEEKDAY_AVAILABILITY,
      monday: { enabled: true, availableMinutes: 0 },
    };

    expect(() => validateWeekdayAvailability(availability)).toThrow(InvalidAvailabilityError);
  });
});
