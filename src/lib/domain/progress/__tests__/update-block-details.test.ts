import { describe, it, expect } from "vitest";
import { updatePlanBlockProgressFields } from "../progress-actions";
import type { PlanBlockProgress } from "../progress.types";
import { parseCalendarDate } from "@/lib/domain/schedule";

const NOW = "2026-06-11T14:00:00.000Z";

function makeProgress(overrides: Partial<PlanBlockProgress> = {}): PlanBlockProgress {
  return {
    id: "progress:block-1",
    blockId: "block-1",
    planDayId: "day-1",
    planDaySequence: 1,
    status: "completed",
    originalScheduledDate: parseCalendarDate("2026-06-11"),
    scheduledDate: parseCalendarDate("2026-06-11"),
    createdAt: "2026-06-11T08:00:00.000Z",
    updatedAt: "2026-06-11T09:00:00.000Z",
    ...overrides,
  };
}

describe("updatePlanBlockProgressFields – solution fields", () => {
  it("saves solution without changing status", () => {
    const progress = [makeProgress()];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      solution: "Two pointer approach",
    });

    const updated = result.find((p) => p.blockId === "block-1")!;
    expect(updated.solution).toBe("Two pointer approach");
    expect(updated.status).toBe("completed");
  });

  it("saves timeComplexity and spaceComplexity", () => {
    const progress = [makeProgress()];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
    });

    const updated = result.find((p) => p.blockId === "block-1")!;
    expect(updated.timeComplexity).toBe("O(n)");
    expect(updated.spaceComplexity).toBe("O(1)");
  });

  it("saves solutionNotes", () => {
    const progress = [makeProgress()];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      solutionNotes: "Edge case: empty array",
    });

    const updated = result.find((p) => p.blockId === "block-1")!;
    expect(updated.solutionNotes).toBe("Edge case: empty array");
  });

  it("preserves existing solution fields when not provided", () => {
    const progress = [
      makeProgress({
        solution: "existing solution",
        timeComplexity: "O(n²)",
        notes: "keep this",
      }),
    ];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      patternUsed: "Hash Map",
    });

    const updated = result.find((p) => p.blockId === "block-1")!;
    expect(updated.solution).toBe("existing solution");
    expect(updated.timeComplexity).toBe("O(n²)");
    expect(updated.notes).toBe("keep this");
    expect(updated.patternUsed).toBe("Hash Map");
  });

  it("updates updatedAt timestamp", () => {
    const progress = [makeProgress()];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      solution: "test",
    });

    const updated = result.find((p) => p.blockId === "block-1")!;
    expect(updated.updatedAt).toBe(NOW);
  });

  it("does not change other blocks", () => {
    const progress = [makeProgress(), makeProgress({ id: "progress:block-2", blockId: "block-2" })];
    const { progress: result } = updatePlanBlockProgressFields(progress, {
      blockId: "block-1",
      occurredAt: NOW,
      solution: "changed",
    });

    const other = result.find((p) => p.blockId === "block-2")!;
    expect(other.solution).toBeUndefined();
  });
});
