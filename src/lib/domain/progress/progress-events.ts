import type { PlanBlockProgress, ProgressEvent, ProgressEventType } from "./progress.types";

type CreateProgressEventInput = {
  id?: string;
  blockId: string;
  type: ProgressEventType;
  occurredAt: string;
  previousProgress?: PlanBlockProgress;
  nextProgress?: PlanBlockProgress;
  previousValue?: unknown;
  nextValue?: unknown;
  metadata?: Record<string, unknown>;
  actionGroupId?: string;
};

export function createProgressEvent(input: CreateProgressEventInput): ProgressEvent {
  return {
    id: input.id ?? createProgressEventId(input.type, input.blockId, input.occurredAt),
    blockId: input.blockId,
    type: input.type,
    occurredAt: input.occurredAt,
    previousProgress: input.previousProgress,
    nextProgress: input.nextProgress,
    previousValue: input.previousValue,
    nextValue: input.nextValue,
    metadata: input.metadata,
    actionGroupId: input.actionGroupId,
  };
}

export function createActionGroupId(prefix: string, occurredAt: string): string {
  return `${prefix}:${occurredAt}`;
}

function createProgressEventId(
  type: ProgressEventType,
  blockId: string,
  occurredAt: string,
): string {
  return `progress-event:${type}:${blockId}:${occurredAt}`;
}
