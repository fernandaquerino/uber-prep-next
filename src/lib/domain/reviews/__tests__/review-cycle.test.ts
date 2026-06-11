import { describe, it, expect } from "vitest";
import {
  getReviewIntervalDays,
  getNextCycleIndex,
  calculateNextReviewDate,
  isCycleCompleted,
  REVIEW_CYCLE,
} from "../review-cycle";
import type { CalendarDate } from "@/lib/domain/schedule";

const CYCLE_LEN = REVIEW_CYCLE.length; // 5

describe("getReviewIntervalDays", () => {
  it("returns the interval for each cycle index", () => {
    expect(getReviewIntervalDays(0)).toBe(1);
    expect(getReviewIntervalDays(1)).toBe(3);
    expect(getReviewIntervalDays(2)).toBe(7);
    expect(getReviewIntervalDays(3)).toBe(14);
    expect(getReviewIntervalDays(4)).toBe(30);
  });

  it("returns null for completed cycle", () => {
    expect(getReviewIntervalDays(5)).toBeNull();
    expect(getReviewIntervalDays(99)).toBeNull();
  });
});

describe("getNextCycleIndex", () => {
  it("again stays at same index", () => {
    expect(getNextCycleIndex(0, "again")).toBe(0);
    expect(getNextCycleIndex(2, "again")).toBe(2);
  });

  it("hard advances by 1", () => {
    expect(getNextCycleIndex(0, "hard")).toBe(1);
    expect(getNextCycleIndex(3, "hard")).toBe(4);
  });

  it("good advances by 1", () => {
    expect(getNextCycleIndex(0, "good")).toBe(1);
    expect(getNextCycleIndex(4, "good")).toBe(5);
  });

  it("easy advances by 2", () => {
    expect(getNextCycleIndex(0, "easy")).toBe(2);
    expect(getNextCycleIndex(3, "easy")).toBe(5);
  });

  it("caps at CYCLE_LEN on last interval", () => {
    expect(getNextCycleIndex(4, "good")).toBe(CYCLE_LEN);
    expect(getNextCycleIndex(4, "easy")).toBe(CYCLE_LEN);
    expect(getNextCycleIndex(4, "hard")).toBe(CYCLE_LEN);
  });

  it("again at last index stays at last index", () => {
    expect(getNextCycleIndex(4, "again")).toBe(4);
  });
});

describe("isCycleCompleted", () => {
  it("false for active cycles", () => {
    expect(isCycleCompleted(0)).toBe(false);
    expect(isCycleCompleted(4)).toBe(false);
  });

  it("true when index reaches length", () => {
    expect(isCycleCompleted(5)).toBe(true);
    expect(isCycleCompleted(10)).toBe(true);
  });
});

describe("calculateNextReviewDate", () => {
  const today = "2026-06-11" as CalendarDate;

  it("again with cycle 0 stays at cycle 0, schedules +1 day", () => {
    const result = calculateNextReviewDate({
      completedOn: today,
      currentCycleIndex: 0,
      result: "again",
    });
    expect(result).toBe("2026-06-12");
  });

  it("good with cycle 0 advances to cycle 1, schedules +3 days", () => {
    const result = calculateNextReviewDate({
      completedOn: today,
      currentCycleIndex: 0,
      result: "good",
    });
    expect(result).toBe("2026-06-14");
  });

  it("easy with cycle 0 advances to cycle 2, schedules +7 days", () => {
    const result = calculateNextReviewDate({
      completedOn: today,
      currentCycleIndex: 0,
      result: "easy",
    });
    expect(result).toBe("2026-06-18");
  });

  it("returns null when cycle completes", () => {
    const result = calculateNextReviewDate({
      completedOn: today,
      currentCycleIndex: 4,
      result: "good",
    });
    expect(result).toBeNull();
  });

  it("handles month boundary correctly", () => {
    const dec29 = "2025-12-29" as CalendarDate;
    const result = calculateNextReviewDate({
      completedOn: dec29,
      currentCycleIndex: 1, // +7 days (cycle 2)
      result: "good",
    });
    expect(result).toBe("2026-01-05");
  });

  it("handles year boundary correctly", () => {
    const dec31 = "2025-12-31" as CalendarDate;
    const result = calculateNextReviewDate({
      completedOn: dec31,
      currentCycleIndex: 0,
      result: "good",
    });
    expect(result).toBe("2026-01-03");
  });
});
