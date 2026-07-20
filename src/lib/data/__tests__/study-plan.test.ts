import { describe, it, expect } from "vitest";
import { STUDY_PLAN } from "../study-plan";
import {
  addMinutesToTime,
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

describe("buildStudySchedule with 2026-06-11 start date (dynamic reflow)", () => {
  const startDate = parseCalendarDate("2026-06-11");
  const schedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: "America/Sao_Paulo",
    weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
  });

  const studyDays = schedule.filter((d) => !d.isRestDay);

  it("starts study content on thursday 2026-06-11 with plan day 1 first", () => {
    const first = studyDays[0];
    expect(first.date).toBe("2026-06-11");
    expect(first.weekday).toBe("thursday");
    expect(first.items[0]?.planDaySequence).toBe(1);
  });

  it("rests on the default weekend (Saturday + Sunday)", () => {
    const saturday = schedule.find((d) => d.date === "2026-06-13");
    const sunday = schedule.find((d) => d.date === "2026-06-14");

    for (const restDay of [saturday, sunday]) {
      expect(restDay).toBeDefined();
      expect(restDay!.isRestDay).toBe(true);
      expect(restDay!.availableMinutes).toBe(0);
      expect(restDay!.items).toHaveLength(0);
    }
  });

  it("never exceeds a day's available minutes (whole blocks slide, never split)", () => {
    for (const day of studyDays) {
      expect(day.totalEstimatedMinutes).toBeLessThanOrEqual(day.availableMinutes);
    }
  });

  it("computes each block's start time from the day start plus prior durations", () => {
    for (const day of studyDays) {
      let cursor = "19:00";
      for (const item of day.items) {
        expect(item.startTime).toBe(cursor);
        cursor = addMinutesToTime(cursor, item.estimatedMinutes);
      }
    }
  });

  it("keeps the original block stream order across the whole schedule", () => {
    const flat = studyDays.flatMap((d) => d.items.map((i) => i.blockId));
    const expected = STUDY_PLAN.days.flatMap((d) => d.blocks.map((b) => b.id));
    expect(flat).toEqual(expected);
  });

  it("produces a dynamic number of study days driven by capacity, not a fixed 36", () => {
    // With ~2h/day, the 6-week content stretches well beyond the 36 plan days.
    expect(studyDays.length).toBeGreaterThan(36);
  });
});
