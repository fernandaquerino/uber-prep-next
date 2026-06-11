import { describe, expect, it } from "vitest";
import {
  buildStudySchedule,
  getFirstStudyDay,
  getLastStudyDay,
  getNextScheduledStudyDay,
  getPreviousScheduledStudyDay,
  getScheduleDayStatus,
  getScheduleRange,
  getScheduledDayByDate,
  groupScheduleByCalendarWeek,
  parseCalendarDate,
} from "../index";
import { createConfig, createPlan, createPlanDays } from "./test-fixtures";

describe("schedule selectors", () => {
  const schedule = buildStudySchedule(createPlan(createPlanDays(5)), createConfig("2026-06-11"));

  it("finds a scheduled day by date", () => {
    expect(getScheduledDayByDate(schedule, parseCalendarDate("2026-06-14"))).toMatchObject({
      isRestDay: true,
    });
    expect(getScheduledDayByDate(schedule, parseCalendarDate("2026-06-20"))).toBeUndefined();
  });

  it("returns first and last study days", () => {
    expect(getFirstStudyDay(schedule)?.date).toBe("2026-06-11");
    expect(getLastStudyDay(schedule)?.date).toBe("2026-06-16");
    expect(getFirstStudyDay([])).toBeUndefined();
    expect(getLastStudyDay([])).toBeUndefined();
  });

  it("returns next and previous study days", () => {
    expect(getNextScheduledStudyDay(schedule, parseCalendarDate("2026-06-13"))?.date).toBe(
      "2026-06-15",
    );
    expect(getNextScheduledStudyDay(schedule, parseCalendarDate("2026-06-16"))).toBeUndefined();
    expect(getPreviousScheduledStudyDay(schedule, parseCalendarDate("2026-06-15"))?.date).toBe(
      "2026-06-13",
    );
    expect(getPreviousScheduledStudyDay(schedule, parseCalendarDate("2026-06-11"))).toBeUndefined();
  });

  it("handles dates before the start and after the end", () => {
    expect(getNextScheduledStudyDay(schedule, parseCalendarDate("2026-06-01"))?.date).toBe(
      "2026-06-11",
    );
    expect(getPreviousScheduledStudyDay(schedule, parseCalendarDate("2026-06-30"))?.date).toBe(
      "2026-06-16",
    );
  });

  it("calculates relative status from an explicit today", () => {
    const today = parseCalendarDate("2026-06-15");

    expect(getScheduleDayStatus(parseCalendarDate("2026-06-14"), today)).toBe("past");
    expect(getScheduleDayStatus(parseCalendarDate("2026-06-15"), today)).toBe("today");
    expect(getScheduleDayStatus(parseCalendarDate("2026-06-16"), today)).toBe("future");
  });

  it("returns the schedule range", () => {
    expect(getScheduleRange(schedule)).toEqual({
      startDate: "2026-06-11",
      endDate: "2026-06-16",
    });
    expect(getScheduleRange([])).toEqual({ startDate: null, endDate: null });
  });

  it("groups schedule by real calendar weeks starting on Monday", () => {
    const weeks = groupScheduleByCalendarWeek(schedule);

    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toMatchObject({
      weekStart: "2026-06-08",
      weekEnd: "2026-06-14",
    });
    expect(weeks[0].days.map((day) => day.weekday)).toEqual([
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]);
    expect(weeks[1]).toMatchObject({
      weekStart: "2026-06-15",
      weekEnd: "2026-06-21",
    });
    expect(weeks[1].days.map((day) => day.weekday)).toEqual(["monday", "tuesday"]);
  });

  it("groups a schedule that starts on Monday in one week", () => {
    const weeks = groupScheduleByCalendarWeek(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-06-15")),
    );

    expect(weeks).toHaveLength(1);
    expect(weeks[0].weekStart).toBe("2026-06-15");
    expect(weeks[0].days.map((day) => day.date)).toEqual(["2026-06-15", "2026-06-16"]);
  });

  it("groups across month and year changes", () => {
    const monthWeeks = groupScheduleByCalendarWeek(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-01-31")),
    );
    const yearWeeks = groupScheduleByCalendarWeek(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-12-31")),
    );

    expect(monthWeeks[0]).toMatchObject({ weekStart: "2026-01-26", weekEnd: "2026-02-01" });
    expect(yearWeeks[0]).toMatchObject({ weekStart: "2026-12-28", weekEnd: "2027-01-03" });
  });

  it("starts a new group on Monday after Sunday closes a week", () => {
    const sundayToMonday = buildStudySchedule(
      createPlan(createPlanDays(1)),
      createConfig("2026-06-14"),
    );
    const weeks = groupScheduleByCalendarWeek(sundayToMonday);

    expect(weeks).toHaveLength(2);
    expect(weeks[0].days.map((day) => day.weekday)).toEqual(["sunday"]);
    expect(weeks[1].days.map((day) => day.weekday)).toEqual(["monday"]);
  });

  it("returns no groups for an empty schedule", () => {
    expect(groupScheduleByCalendarWeek([])).toEqual([]);
  });
});
