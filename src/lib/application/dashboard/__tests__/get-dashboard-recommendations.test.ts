import { describe, it, expect } from "vitest";
import { getDashboardRecommendations } from "../get-dashboard-recommendations";
import type { CurrentStudyState, PlanCompletionSummary } from "@/lib/domain/progress";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";

function makeBlock(overrides: Partial<EffectiveScheduledBlock> = {}): EffectiveScheduledBlock {
  return {
    blockId: "block-1",
    planDayId: "day-1",
    planDaySequence: 1,
    title: "Sliding Window",
    category: "algo",
    estimatedMinutes: 120,
    type: "exercicio",
    originalScheduledDate: "2026-06-11" as import("@/lib/domain/schedule").CalendarDate,
    scheduledDate: "2026-06-11" as import("@/lib/domain/schedule").CalendarDate,
    executionStatus: "pending",
    timingStatus: "today",
    isOverdue: false,
    isRescheduled: false,
    ...overrides,
  };
}

function makeSummary(overrides: Partial<PlanCompletionSummary> = {}): PlanCompletionSummary {
  return {
    total: 10,
    completed: 0,
    pending: 10,
    inProgress: 0,
    stuck: 0,
    skipped: 0,
    completionPercentage: 0,
    resolutionPercentage: 0,
    ...overrides,
  };
}

function makeState(overrides: Partial<CurrentStudyState> = {}): CurrentStudyState {
  return {
    currentItem: null,
    currentDay: null,
    lastCompletedItem: null,
    nextItem: null,
    pendingItems: [],
    overdueItems: [],
    completedItems: [],
    isPlanCompleted: false,
    ...overrides,
  };
}

describe("getDashboardRecommendations", () => {
  it("returns plan_complete when plan is done", () => {
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ isPlanCompleted: true }),
      completionSummary: makeSummary({ total: 10, completed: 10, completionPercentage: 100 }),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("plan_complete");
    expect(result[0].priority).toBe("low");
  });

  it("returns high priority overdue recommendation when overdue items exist", () => {
    const overdueItem = makeBlock({ isOverdue: true });
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ overdueItems: [overdueItem] }),
      completionSummary: makeSummary(),
    });
    const overdue = result.find((r) => r.id === "overdue_items");
    expect(overdue).toBeDefined();
    expect(overdue!.priority).toBe("high");
  });

  it("returns high priority stuck recommendation when stuck items exist", () => {
    const result = getDashboardRecommendations({
      currentStudyState: makeState(),
      completionSummary: makeSummary({ stuck: 2 }),
    });
    const stuck = result.find((r) => r.id === "stuck_items");
    expect(stuck).toBeDefined();
    expect(stuck!.priority).toBe("high");
  });

  it("returns in_progress recommendation when in_progress items exist", () => {
    const inProgressItem = makeBlock({ executionStatus: "in_progress" });
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ currentItem: inProgressItem }),
      completionSummary: makeSummary({ inProgress: 1 }),
    });
    const rec = result.find((r) => r.id === "continue_in_progress");
    expect(rec).toBeDefined();
    expect(rec!.priority).toBe("medium");
    expect(rec!.description).toContain("Sliding Window");
  });

  it("returns start_next recommendation when nothing in progress and no overdue", () => {
    const pendingItem = makeBlock();
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ currentItem: pendingItem }),
      completionSummary: makeSummary({ pending: 10 }),
    });
    const rec = result.find((r) => r.id === "start_next");
    expect(rec).toBeDefined();
    expect(rec!.priority).toBe("medium");
  });

  it("returns on_track recommendation when everything is clear", () => {
    const pendingItem = makeBlock();
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ currentItem: pendingItem, pendingItems: [pendingItem] }),
      completionSummary: makeSummary({ pending: 10 }),
    });
    const onTrack = result.find((r) => r.id === "on_track");
    expect(onTrack).toBeDefined();
    expect(onTrack!.priority).toBe("low");
  });

  it("sorts by priority: high first", () => {
    const overdueItem = makeBlock({ isOverdue: true });
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ overdueItems: [overdueItem] }),
      completionSummary: makeSummary({ stuck: 1, inProgress: 1 }),
    });
    const priorities = result.map((r) => r.priority);
    const highIdx = priorities.indexOf("high");
    const medIdx = priorities.indexOf("medium");
    if (highIdx !== -1 && medIdx !== -1) {
      expect(highIdx).toBeLessThan(medIdx);
    }
  });

  it("plural description when multiple overdue items", () => {
    const items = [makeBlock({ blockId: "b1", isOverdue: true }), makeBlock({ blockId: "b2", isOverdue: true })];
    const result = getDashboardRecommendations({
      currentStudyState: makeState({ overdueItems: items }),
      completionSummary: makeSummary(),
    });
    const overdue = result.find((r) => r.id === "overdue_items");
    expect(overdue!.title).toContain("blocos atrasados");
  });
});
