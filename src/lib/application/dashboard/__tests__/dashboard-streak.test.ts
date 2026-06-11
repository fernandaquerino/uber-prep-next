import { describe, it, expect } from "vitest";
import type { ActivityDay } from "@/lib/presentation/dashboard/dashboard-view-model";
import type { CalendarDate } from "@/lib/domain/schedule";

// Extract the streak logic for isolated testing.
// This mirrors the computeStreak function in get-dashboard-data.ts exactly.
function computeStreak(activityDays: ActivityDay[], today: CalendarDate) {
  const sortedDays = [...activityDays].sort((a, b) => b.date.localeCompare(a.date));
  let current = 0;
  let longestEver = 0;
  let runLength = 0;
  let counting = true;

  for (const day of sortedDays) {
    if (day.date > today) continue;
    if (day.isRestDay) continue;

    if (day.completedCount > 0) {
      runLength++;
      if (counting) current++;
    } else {
      if (counting) counting = false;
      longestEver = Math.max(longestEver, runLength);
      runLength = 0;
    }
  }

  longestEver = Math.max(longestEver, runLength);
  return { current, longestEver };
}

function day(date: string, completedCount: number, isRestDay = false): ActivityDay {
  return { date: date as CalendarDate, completedCount, isRestDay };
}

describe("computeStreak", () => {
  it("returns 0 when no activity", () => {
    const days = [day("2026-06-09", 0), day("2026-06-10", 0), day("2026-06-11", 0)];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    expect(result.current).toBe(0);
    expect(result.longestEver).toBe(0);
  });

  it("counts consecutive days with activity", () => {
    const days = [day("2026-06-09", 2), day("2026-06-10", 1), day("2026-06-11", 3)];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    expect(result.current).toBe(3);
    expect(result.longestEver).toBe(3);
  });

  it("stops streak on gap day", () => {
    const days = [
      day("2026-06-09", 1),
      day("2026-06-10", 0), // gap
      day("2026-06-11", 2),
    ];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    // current streak: only today (2026-06-11)
    expect(result.current).toBe(1);
    // longest run was 1 before the gap, 1 after — wait, 2026-06-09 was 1, gap, 2026-06-11 is 1
    // After gap: run resets. current = 1 (only 2026-06-11)
    // longestEver = max(1, 1) = 1
    expect(result.longestEver).toBe(1);
  });

  it("rest days do not break streak", () => {
    const days = [
      day("2026-06-09", 1),
      day("2026-06-10", 0, true), // rest — should not break streak
      day("2026-06-11", 2),
    ];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    expect(result.current).toBe(2); // 2026-06-09 + 2026-06-11 (10 is rest, skipped)
  });

  it("future days are ignored", () => {
    const days = [
      day("2026-06-11", 2),
      day("2026-06-12", 5), // future
    ];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    expect(result.current).toBe(1);
  });

  it("tracks longestEver across multiple runs", () => {
    const days = [
      day("2026-06-01", 1),
      day("2026-06-02", 1),
      day("2026-06-03", 1),
      day("2026-06-04", 0), // gap
      day("2026-06-05", 1),
      day("2026-06-06", 0), // gap
      day("2026-06-07", 1),
    ];
    // Going backwards from 2026-06-07:
    // 2026-06-07: current=1, run=1
    // 2026-06-06: gap -> longestEver=max(0,1)=1, run=0, counting=false
    // 2026-06-05: not counting, run=1
    // 2026-06-04: gap -> longestEver=max(1,1)=1, run=0
    // 2026-06-03: run=1
    // 2026-06-02: run=2
    // 2026-06-01: run=3
    // end: longestEver=max(1,3)=3
    const result = computeStreak(days, "2026-06-07" as CalendarDate);
    expect(result.current).toBe(1);
    expect(result.longestEver).toBe(3);
  });

  it("single active day produces current=1", () => {
    const days = [day("2026-06-11", 1)];
    const result = computeStreak(days, "2026-06-11" as CalendarDate);
    expect(result.current).toBe(1);
    expect(result.longestEver).toBe(1);
  });
});
