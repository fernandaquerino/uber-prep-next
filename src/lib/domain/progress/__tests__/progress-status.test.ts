import { describe, expect, it } from "vitest";
import {
  assertValidPlanBlockStatusTransition,
  canTransitionPlanBlockStatus,
  getPlanDayProgressStatus,
} from "../index";
import { InvalidProgressTransitionError } from "../progress.errors";

describe("progress status", () => {
  it("allows explicit valid transitions", () => {
    expect(canTransitionPlanBlockStatus("pending", "in_progress")).toBe(true);
    expect(canTransitionPlanBlockStatus("pending", "completed")).toBe(true);
    expect(canTransitionPlanBlockStatus("pending", "stuck")).toBe(true);
    expect(canTransitionPlanBlockStatus("pending", "skipped")).toBe(true);
    expect(canTransitionPlanBlockStatus("in_progress", "completed")).toBe(true);
    expect(canTransitionPlanBlockStatus("stuck", "in_progress")).toBe(true);
    expect(canTransitionPlanBlockStatus("completed", "pending")).toBe(true);
    expect(canTransitionPlanBlockStatus("skipped", "pending")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionPlanBlockStatus("completed", "skipped")).toBe(false);
    expect(() => assertValidPlanBlockStatusTransition("completed", "skipped")).toThrow(
      InvalidProgressTransitionError,
    );
  });

  it("derives day status from block statuses", () => {
    expect(getPlanDayProgressStatus([])).toBe("not_started");
    expect(getPlanDayProgressStatus(["pending", "pending"])).toBe("not_started");
    expect(getPlanDayProgressStatus(["completed", "completed"])).toBe("completed");
    expect(getPlanDayProgressStatus(["completed", "pending"])).toBe("partial");
    expect(getPlanDayProgressStatus(["in_progress", "pending"])).toBe("in_progress");
    expect(getPlanDayProgressStatus(["stuck", "pending"])).toBe("stuck");
    expect(getPlanDayProgressStatus(["skipped", "skipped"])).toBe("skipped");
    expect(getPlanDayProgressStatus(["completed", "skipped"])).toBe("partial");
  });
});
