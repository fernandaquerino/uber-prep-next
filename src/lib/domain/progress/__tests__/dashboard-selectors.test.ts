import { describe, it, expect } from "vitest";
import {
  getPlanProgressByCategory,
  getCurrentWeekDays,
  getUpcomingStudyItems,
} from "../dashboard-selectors";
import type { EffectiveScheduledDay, EffectiveScheduledBlock } from "../progress.types";
import type { CalendarDate } from "@/lib/domain/schedule";

function makeBlock(
  blockId: string,
  category: string,
  status: EffectiveScheduledBlock["executionStatus"] = "pending",
  overrides: Partial<EffectiveScheduledBlock> = {},
): EffectiveScheduledBlock {
  return {
    blockId,
    planDayId: "day-1",
    planDaySequence: 1,
    title: `Block ${blockId}`,
    category,
    estimatedMinutes: 60,
    type: "exercicio",
    originalScheduledDate: "2026-06-11" as CalendarDate,
    scheduledDate: "2026-06-11" as CalendarDate,
    executionStatus: status,
    timingStatus: "today",
    isOverdue: false,
    isRescheduled: false,
    ...overrides,
  };
}

function makeDay(
  date: string,
  items: EffectiveScheduledBlock[],
  isRestDay = false,
): EffectiveScheduledDay {
  return {
    date: date as CalendarDate,
    weekday: "monday",
    availableMinutes: isRestDay ? 0 : 480,
    isRestDay,
    items,
    totalEstimatedMinutes: items.reduce((sum, i) => sum + i.estimatedMinutes, 0),
    remainingMinutes: 480,
    capacityStatus: "available",
  };
}

// ─── getPlanProgressByCategory ────────────────────────────────────────────────

describe("getPlanProgressByCategory", () => {
  it("returns empty array for empty schedule", () => {
    expect(getPlanProgressByCategory([])).toEqual([]);
  });

  it("groups items by category", () => {
    const schedule = [
      makeDay("2026-06-11", [
        makeBlock("b1", "algo", "completed"),
        makeBlock("b2", "algo", "pending"),
        makeBlock("b3", "js", "in_progress"),
      ]),
    ];
    const result = getPlanProgressByCategory(schedule);
    const algo = result.find((c) => c.category === "algo")!;
    const js = result.find((c) => c.category === "js")!;

    expect(algo.total).toBe(2);
    expect(algo.completed).toBe(1);
    expect(js.total).toBe(1);
    expect(js.inProgress).toBe(1);
  });

  it("sorts by total descending", () => {
    const schedule = [
      makeDay("2026-06-11", [
        makeBlock("b1", "js"),
        makeBlock("b2", "algo"),
        makeBlock("b3", "algo"),
        makeBlock("b4", "algo"),
      ]),
    ];
    const result = getPlanProgressByCategory(schedule);
    expect(result[0].category).toBe("algo");
    expect(result[1].category).toBe("js");
  });

  it("counts stuck items", () => {
    const schedule = [makeDay("2026-06-11", [makeBlock("b1", "algo", "stuck")])];
    const result = getPlanProgressByCategory(schedule);
    expect(result[0].stuck).toBe(1);
  });
});

// ─── getCurrentWeekDays ───────────────────────────────────────────────────────

describe("getCurrentWeekDays", () => {
  it("returns 7 days for a week", () => {
    const today = "2026-06-11" as CalendarDate; // Thursday
    const days = getCurrentWeekDays([], today);
    expect(days).toHaveLength(7);
  });

  it("marks the correct day as today", () => {
    const today = "2026-06-11" as CalendarDate;
    const days = getCurrentWeekDays([], today);
    const todayEntry = days.find((d) => d.date === today);
    expect(todayEntry?.isToday).toBe(true);
  });

  it("marks future days correctly", () => {
    const today = "2026-06-11" as CalendarDate;
    const days = getCurrentWeekDays([], today);
    const futureDays = days.filter((d) => d.date > today);
    expect(futureDays.every((d) => d.status === "future" || d.status === "rest")).toBe(true);
  });

  it("overlays effective schedule data", () => {
    const today = "2026-06-11" as CalendarDate;
    const schedule = [
      makeDay("2026-06-09", [makeBlock("b1", "algo", "completed")]),
      makeDay("2026-06-11", [
        makeBlock("b2", "algo", "completed"),
        makeBlock("b3", "algo", "pending"),
      ]),
    ];
    const days = getCurrentWeekDays(schedule, today);
    const monday = days.find((d) => d.date === "2026-06-09");
    const thursday = days.find((d) => d.date === "2026-06-11");

    expect(monday?.completed).toBe(1);
    expect(monday?.total).toBe(1);
    expect(thursday?.completed).toBe(1);
    expect(thursday?.total).toBe(2);
  });

  it("marks completed day as completed status", () => {
    const today = "2026-06-12" as CalendarDate; // Friday
    const schedule = [
      makeDay("2026-06-09", [makeBlock("b1", "algo", "completed")]), // Monday
    ];
    const days = getCurrentWeekDays(schedule, today);
    const monday = days.find((d) => d.date === "2026-06-09");
    expect(monday?.status).toBe("completed");
  });
});

// ─── getUpcomingStudyItems ─────────────────────────────────────────────────────

describe("getUpcomingStudyItems", () => {
  it("excludes completed and skipped items", () => {
    const schedule = [
      makeDay("2026-06-12", [
        makeBlock("b1", "algo", "completed", { timingStatus: "future" }),
        makeBlock("b2", "algo", "pending", { timingStatus: "future" }),
      ]),
    ];
    const result = getUpcomingStudyItems(schedule, null, 5);
    expect(result.every((i) => i.blockId !== "b1")).toBe(true);
    expect(result.some((i) => i.blockId === "b2")).toBe(true);
  });

  it("excludes current block", () => {
    const schedule = [
      makeDay("2026-06-12", [
        makeBlock("current", "algo", "pending", { timingStatus: "future" }),
        makeBlock("b2", "algo", "pending", { timingStatus: "future" }),
      ]),
    ];
    const result = getUpcomingStudyItems(schedule, "current", 5);
    expect(result.every((i) => i.blockId !== "current")).toBe(true);
  });

  it("respects count limit", () => {
    const schedule = [
      makeDay("2026-06-12", [
        makeBlock("b1", "algo", "pending", { timingStatus: "future" }),
        makeBlock("b2", "algo", "pending", { timingStatus: "future" }),
        makeBlock("b3", "algo", "pending", { timingStatus: "future" }),
      ]),
    ];
    const result = getUpcomingStudyItems(schedule, null, 2);
    expect(result).toHaveLength(2);
  });
});
