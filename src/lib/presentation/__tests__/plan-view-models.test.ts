import { describe, it, expect } from "vitest";
import { computeWeekStats } from "../plan-view-models";
import type { CalendarDate } from "@/lib/domain/schedule";
import type {
  EffectiveScheduledBlock,
  EffectiveScheduledDay,
  PlanBlockExecutionStatus,
} from "@/lib/domain/progress";

const d = (s: string) => s as CalendarDate;
const TODAY = d("2026-06-14");

let blockSeq = 0;

function block(
  overrides: Partial<EffectiveScheduledBlock> & {
    executionStatus: PlanBlockExecutionStatus;
  },
): EffectiveScheduledBlock {
  blockSeq += 1;
  return {
    blockId: `b${blockSeq}`,
    planDayId: "pd1",
    planDaySequence: 1,
    title: `Block ${blockSeq}`,
    category: "algo",
    estimatedMinutes: 60,
    type: "teoria",
    originalScheduledDate: d("2026-06-10"),
    scheduledDate: d("2026-06-10"),
    timingStatus: "past",
    isOverdue: false,
    isRescheduled: false,
    ...overrides,
  };
}

function day(
  date: string,
  items: EffectiveScheduledBlock[],
  opts: { isRestDay?: boolean; availableMinutes?: number } = {},
): EffectiveScheduledDay {
  const totalEstimatedMinutes = items.reduce((s, i) => s + i.estimatedMinutes, 0);
  return {
    date: d(date),
    weekday: "monday",
    availableMinutes: opts.availableMinutes ?? 480,
    isRestDay: opts.isRestDay ?? false,
    totalEstimatedMinutes,
    remainingMinutes: Math.max(0, (opts.availableMinutes ?? 480) - totalEstimatedMinutes),
    capacityStatus: "available",
    items,
  };
}

describe("computeWeekStats", () => {
  it("sums planned minutes across all study blocks (ignoring rest days)", () => {
    const days = [
      day("2026-06-10", [block({ executionStatus: "pending", estimatedMinutes: 30 })]),
      day("2026-06-15", [], { isRestDay: true }),
      day("2026-06-16", [block({ executionStatus: "pending", estimatedMinutes: 45 })]),
    ];
    expect(computeWeekStats(days, TODAY).plannedMinutes).toBe(75);
  });

  it("uses real minutes for completed blocks, estimated when unknown", () => {
    const days = [
      day("2026-06-10", [
        block({ executionStatus: "completed", estimatedMinutes: 60, actualMinutes: 50 }),
        block({ executionStatus: "completed", estimatedMinutes: 40 }), // no actualMinutes
        block({ executionStatus: "pending", estimatedMinutes: 30 }),
      ]),
    ];
    expect(computeWeekStats(days, TODAY).completedMinutes).toBe(90);
  });

  it("counts overdue blocks", () => {
    const days = [
      day("2026-06-10", [
        block({ executionStatus: "pending", isOverdue: true }),
        block({ executionStatus: "stuck", isOverdue: true }),
        block({ executionStatus: "completed" }),
      ]),
    ];
    expect(computeWeekStats(days, TODAY).overdueCount).toBe(2);
  });

  it("adherence = resolved / due, counting only days before today", () => {
    const days = [
      // Past: 2 completed, 1 skipped, 1 overdue pending => 3 resolved of 4 due
      day("2026-06-10", [
        block({ executionStatus: "completed" }),
        block({ executionStatus: "completed" }),
        block({ executionStatus: "skipped" }),
        block({ executionStatus: "pending", isOverdue: true }),
      ]),
      // Today: pending block must NOT drag adherence down
      day("2026-06-14", [block({ executionStatus: "pending", scheduledDate: TODAY })]),
    ];
    expect(computeWeekStats(days, TODAY).adherencePercent).toBe(75);
  });

  it("returns null adherence when nothing is due yet", () => {
    const days = [
      day("2026-06-14", [block({ executionStatus: "pending" })]),
      day("2026-06-16", [block({ executionStatus: "pending" })]),
    ];
    expect(computeWeekStats(days, TODAY).adherencePercent).toBeNull();
  });

  it("reports 100% adherence when all due blocks are resolved", () => {
    const days = [
      day("2026-06-10", [
        block({ executionStatus: "completed" }),
        block({ executionStatus: "skipped" }),
      ]),
    ];
    expect(computeWeekStats(days, TODAY).adherencePercent).toBe(100);
  });
});
