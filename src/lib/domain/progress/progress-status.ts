import { InvalidProgressTransitionError } from "./progress.errors";
import type { PlanBlockExecutionStatus, PlanDayProgressStatus } from "./progress.types";

const VALID_TRANSITIONS: Record<PlanBlockExecutionStatus, readonly PlanBlockExecutionStatus[]> = {
  pending: ["in_progress", "completed", "stuck", "skipped"],
  in_progress: ["completed", "stuck", "pending", "skipped"],
  stuck: ["in_progress", "completed", "pending", "skipped"],
  completed: ["pending"],
  skipped: ["pending"],
};

export function canTransitionPlanBlockStatus(
  from: PlanBlockExecutionStatus,
  to: PlanBlockExecutionStatus,
): boolean {
  return from === to || VALID_TRANSITIONS[from].includes(to);
}

export function assertValidPlanBlockStatusTransition(
  from: PlanBlockExecutionStatus,
  to: PlanBlockExecutionStatus,
): void {
  if (!canTransitionPlanBlockStatus(from, to)) {
    throw new InvalidProgressTransitionError(`Invalid progress transition from ${from} to ${to}.`);
  }
}

export function getPlanDayProgressStatus(
  statuses: PlanBlockExecutionStatus[],
): PlanDayProgressStatus {
  if (statuses.length === 0 || statuses.every((status) => status === "pending")) {
    return "not_started";
  }

  if (statuses.some((status) => status === "in_progress")) {
    return "in_progress";
  }

  if (statuses.every((status) => status === "completed")) {
    return "completed";
  }

  if (statuses.every((status) => status === "skipped")) {
    return "skipped";
  }

  if (statuses.some((status) => status === "stuck")) {
    return "stuck";
  }

  return "partial";
}
