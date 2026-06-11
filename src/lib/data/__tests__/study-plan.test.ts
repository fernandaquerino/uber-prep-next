import { describe, it, expect } from "vitest";
import { STUDY_PLAN } from "../study-plan";
import {
  buildStudySchedule,
  DEFAULT_WEEKDAY_AVAILABILITY,
  parseCalendarDate,
} from "@/lib/domain/schedule";

describe("STUDY_PLAN", () => {
  it("has a valid id and version", () => {
    expect(STUDY_PLAN.id).toBe("uber-prep-v2");
    expect(STUDY_PLAN.version).toBe(2);
  });

  it("has 36 plan days", () => {
    expect(STUDY_PLAN.days).toHaveLength(36);
  });

  it("sequences are 1–36 with no duplicates", () => {
    const sequences = STUDY_PLAN.days.map((d) => d.sequence);
    expect(sequences).toEqual([...Array.from({ length: 36 }, (_, i) => i + 1)]);
  });

  it("all blocks have non-empty ids", () => {
    for (const day of STUDY_PLAN.days) {
      for (const block of day.blocks) {
        expect(block.id.trim()).not.toBe("");
      }
    }
  });

  it("block ids are globally unique", () => {
    const ids = STUDY_PLAN.days.flatMap((d) => d.blocks.map((b) => b.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all blocks have positive estimatedMinutes", () => {
    for (const day of STUDY_PLAN.days) {
      for (const block of day.blocks) {
        expect(block.estimatedMinutes).toBeGreaterThan(0);
      }
    }
  });

  it("no blocks have null category", () => {
    for (const day of STUDY_PLAN.days) {
      for (const block of day.blocks) {
        expect(block.category).toBeTruthy();
      }
    }
  });
});

describe("buildStudySchedule with 2026-06-11 start date", () => {
  const startDate = parseCalendarDate("2026-06-11");
  const schedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: "America/Sao_Paulo",
    weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
  });

  it("day 1 falls on thursday 2026-06-11", () => {
    const day1 = schedule.find((d) => !d.isRestDay && d.items[0]?.planDaySequence === 1);
    expect(day1).toBeDefined();
    expect(day1!.date).toBe("2026-06-11");
    expect(day1!.weekday).toBe("thursday");
  });

  it("day 2 falls on friday 2026-06-12", () => {
    const day2 = schedule.find((d) => !d.isRestDay && d.items[0]?.planDaySequence === 2);
    expect(day2).toBeDefined();
    expect(day2!.date).toBe("2026-06-12");
    expect(day2!.weekday).toBe("friday");
  });

  it("day 3 falls on saturday 2026-06-13 with 240 min", () => {
    const day3 = schedule.find((d) => !d.isRestDay && d.items[0]?.planDaySequence === 3);
    expect(day3).toBeDefined();
    expect(day3!.date).toBe("2026-06-13");
    expect(day3!.weekday).toBe("saturday");
    expect(day3!.availableMinutes).toBe(240);
  });

  it("sunday 2026-06-14 is a rest day with 0 minutes and no items", () => {
    const sunday = schedule.find((d) => d.date === "2026-06-14");
    expect(sunday).toBeDefined();
    expect(sunday!.isRestDay).toBe(true);
    expect(sunday!.availableMinutes).toBe(0);
    expect(sunday!.items).toHaveLength(0);
  });

  it("day 4 falls on monday 2026-06-15", () => {
    const day4 = schedule.find((d) => !d.isRestDay && d.items[0]?.planDaySequence === 4);
    expect(day4).toBeDefined();
    expect(day4!.date).toBe("2026-06-15");
    expect(day4!.weekday).toBe("monday");
  });

  it("day 5 falls on tuesday 2026-06-16", () => {
    const day5 = schedule.find((d) => !d.isRestDay && d.items[0]?.planDaySequence === 5);
    expect(day5).toBeDefined();
    expect(day5!.date).toBe("2026-06-16");
    expect(day5!.weekday).toBe("tuesday");
  });
});
