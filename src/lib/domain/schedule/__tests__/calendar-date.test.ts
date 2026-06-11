import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  compareCalendarDates,
  differenceInCalendarDates,
  getWeekday,
  isAfterCalendarDate,
  isBeforeCalendarDate,
  isSameCalendarDate,
  isValidCalendarDate,
  parseCalendarDate,
} from "../index";
import { InvalidCalendarDateError } from "../schedule.errors";

describe("calendar-date", () => {
  it("identifies real weekdays for the required June 2026 range", () => {
    expect(getWeekday(parseCalendarDate("2026-06-11"))).toBe("thursday");
    expect(getWeekday(parseCalendarDate("2026-06-12"))).toBe("friday");
    expect(getWeekday(parseCalendarDate("2026-06-13"))).toBe("saturday");
    expect(getWeekday(parseCalendarDate("2026-06-14"))).toBe("sunday");
    expect(getWeekday(parseCalendarDate("2026-06-15"))).toBe("monday");
  });

  it("accepts a valid leap year date", () => {
    expect(isValidCalendarDate("2024-02-29")).toBe(true);
  });

  it("rejects impossible dates and invalid formats", () => {
    expect(isValidCalendarDate("2026-02-30")).toBe(false);
    expect(isValidCalendarDate("11/06/2026")).toBe(false);
    expect(isValidCalendarDate("2026/06/11")).toBe(false);
    expect(isValidCalendarDate("abc")).toBe(false);
    expect(() => parseCalendarDate("2026-02-30")).toThrow(InvalidCalendarDateError);
  });

  it("adds days across month and year boundaries", () => {
    expect(addCalendarDays(parseCalendarDate("2026-01-31"), 1)).toBe("2026-02-01");
    expect(addCalendarDays(parseCalendarDate("2026-12-31"), 1)).toBe("2027-01-01");
  });

  it("adds negative days", () => {
    expect(addCalendarDays(parseCalendarDate("2026-03-01"), -1)).toBe("2026-02-28");
  });

  it("compares dates", () => {
    const early = parseCalendarDate("2026-06-11");
    const late = parseCalendarDate("2026-06-15");

    expect(compareCalendarDates(early, late)).toBe(-1);
    expect(compareCalendarDates(late, early)).toBe(1);
    expect(compareCalendarDates(early, early)).toBe(0);
    expect(isBeforeCalendarDate(early, late)).toBe(true);
    expect(isAfterCalendarDate(late, early)).toBe(true);
    expect(isSameCalendarDate(early, early)).toBe(true);
  });

  it("calculates day differences", () => {
    expect(
      differenceInCalendarDates(parseCalendarDate("2026-06-15"), parseCalendarDate("2026-06-11")),
    ).toBe(4);
    expect(
      differenceInCalendarDates(parseCalendarDate("2026-06-11"), parseCalendarDate("2026-06-15")),
    ).toBe(-4);
  });
});
