import type { CalendarDate, ScheduledStudyDay } from "@/lib/domain/schedule";
import { assertValidPlanBlockStatusTransition } from "./progress-status";
import { PlanBlockNotFoundError, ProgressRecordNotFoundError } from "./progress.errors";
import {
  assertNonEmptyId,
  assertOptionalNonNegativeNumber,
  assertOptionalRating,
  assertValidIsoTimestamp,
} from "./progress-validation";
import { createProgressEvent } from "./progress-events";
import type { PlanBlockExecutionStatus, PlanBlockProgress, ProgressEvent } from "./progress.types";

export type ProgressActionResult = {
  progress: PlanBlockProgress[];
  events: ProgressEvent[];
};

export type CompletePlanBlockInput = {
  blockId: string;
  completedAt: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
};

export type MarkPlanBlockStuckInput = {
  blockId: string;
  occurredAt: string;
  difficulty?: number;
  notes?: string;
  reason?: string;
};

export type UpdatePlanBlockProgressInput = {
  blockId: string;
  occurredAt: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
};

export function initializePlanProgress(
  baseSchedule: ScheduledStudyDay[],
  existingProgress: PlanBlockProgress[],
  now: string,
): ProgressActionResult {
  assertValidIsoTimestamp(now, "now");

  const existingByBlock = new Map(existingProgress.map((record) => [record.blockId, record]));
  const nextProgress = [...existingProgress];
  const events: ProgressEvent[] = [];

  for (const day of baseSchedule) {
    for (const item of day.items) {
      if (existingByBlock.has(item.blockId)) {
        continue;
      }

      const record: PlanBlockProgress = {
        id: createProgressRecordId(item.blockId),
        blockId: item.blockId,
        planDayId: item.planDayId,
        planDaySequence: item.planDaySequence,
        status: "pending",
        originalScheduledDate: day.date,
        scheduledDate: day.date,
        createdAt: now,
        updatedAt: now,
      };

      nextProgress.push(record);
      events.push(
        createProgressEvent({
          blockId: item.blockId,
          type: "created",
          occurredAt: now,
          nextProgress: record,
        }),
      );
    }
  }

  return { progress: nextProgress, events };
}

export function startPlanBlock(
  progress: PlanBlockProgress[],
  blockId: string,
  startedAt: string,
): ProgressActionResult {
  assertValidIsoTimestamp(startedAt, "startedAt");
  return updateStatus(progress, blockId, "in_progress", startedAt, "started", (record) => ({
    ...record,
    startedAt: record.startedAt ?? startedAt,
  }));
}

export function completePlanBlock(
  progress: PlanBlockProgress[],
  input: CompletePlanBlockInput,
): ProgressActionResult {
  assertNonEmptyId(input.blockId, "blockId");
  assertValidIsoTimestamp(input.completedAt, "completedAt");
  assertOptionalNonNegativeNumber(input.actualMinutes, "actualMinutes");
  assertOptionalRating(input.difficulty, "difficulty");
  assertOptionalRating(input.confidence, "confidence");

  return updateStatus(
    progress,
    input.blockId,
    "completed",
    input.completedAt,
    "completed",
    (record) => ({
      ...record,
      completedAt: input.completedAt,
      actualMinutes: input.actualMinutes ?? record.actualMinutes,
      difficulty: input.difficulty ?? record.difficulty,
      confidence: input.confidence ?? record.confidence,
      notes: input.notes ?? record.notes,
      patternUsed: input.patternUsed ?? record.patternUsed,
    }),
  );
}

export function markPlanBlockStuck(
  progress: PlanBlockProgress[],
  input: MarkPlanBlockStuckInput,
): ProgressActionResult {
  assertValidIsoTimestamp(input.occurredAt, "occurredAt");
  assertOptionalRating(input.difficulty, "difficulty");

  return updateStatus(
    progress,
    input.blockId,
    "stuck",
    input.occurredAt,
    "marked_stuck",
    (record) => ({
      ...record,
      difficulty: input.difficulty ?? record.difficulty,
      notes: input.notes ?? record.notes,
    }),
    input.reason ? { reason: input.reason } : undefined,
  );
}

export function returnPlanBlockToPending(
  progress: PlanBlockProgress[],
  blockId: string,
  occurredAt: string,
): ProgressActionResult {
  assertValidIsoTimestamp(occurredAt, "occurredAt");
  return updateStatus(
    progress,
    blockId,
    "pending",
    occurredAt,
    "returned_to_pending",
    (record) => ({
      ...record,
      completedAt: undefined,
      skippedAt: undefined,
    }),
  );
}

export function skipPlanBlock(
  progress: PlanBlockProgress[],
  blockId: string,
  skippedAt: string,
  reason?: string,
): ProgressActionResult {
  assertValidIsoTimestamp(skippedAt, "skippedAt");
  return updateStatus(
    progress,
    blockId,
    "skipped",
    skippedAt,
    "skipped",
    (record) => ({
      ...record,
      skippedAt,
    }),
    reason ? { reason } : undefined,
  );
}

export function restoreSkippedPlanBlock(
  progress: PlanBlockProgress[],
  blockId: string,
  occurredAt: string,
): ProgressActionResult {
  assertValidIsoTimestamp(occurredAt, "occurredAt");
  return updateStatus(progress, blockId, "pending", occurredAt, "restored", (record) => ({
    ...record,
    skippedAt: undefined,
  }));
}

export function updatePlanBlockProgressFields(
  progress: PlanBlockProgress[],
  input: UpdatePlanBlockProgressInput,
): ProgressActionResult {
  assertValidIsoTimestamp(input.occurredAt, "occurredAt");
  assertOptionalNonNegativeNumber(input.actualMinutes, "actualMinutes");
  assertOptionalRating(input.difficulty, "difficulty");
  assertOptionalRating(input.confidence, "confidence");

  const record = findRequiredProgress(progress, input.blockId);
  const nextRecord: PlanBlockProgress = {
    ...record,
    actualMinutes: input.actualMinutes ?? record.actualMinutes,
    difficulty: input.difficulty ?? record.difficulty,
    confidence: input.confidence ?? record.confidence,
    notes: input.notes ?? record.notes,
    patternUsed: input.patternUsed ?? record.patternUsed,
    updatedAt: input.occurredAt,
  };

  return replaceRecord(progress, record, nextRecord, [
    createProgressEvent({
      blockId: input.blockId,
      type: "notes_updated",
      occurredAt: input.occurredAt,
      previousProgress: record,
      nextProgress: nextRecord,
    }),
  ]);
}

export function createProgressRecordId(blockId: string): string {
  return `progress:${blockId}`;
}

function updateStatus(
  progress: PlanBlockProgress[],
  blockId: string,
  nextStatus: PlanBlockExecutionStatus,
  occurredAt: string,
  eventType: ProgressEvent["type"],
  mapRecord?: (record: PlanBlockProgress) => PlanBlockProgress,
  metadata?: Record<string, unknown>,
): ProgressActionResult {
  assertNonEmptyId(blockId, "blockId");
  const record = findRequiredProgress(progress, blockId);
  assertValidPlanBlockStatusTransition(record.status, nextStatus);

  const nextRecord = {
    ...(mapRecord ? mapRecord(record) : record),
    status: nextStatus,
    updatedAt: occurredAt,
  };

  return replaceRecord(progress, record, nextRecord, [
    createProgressEvent({
      blockId,
      type: eventType,
      occurredAt,
      previousProgress: record,
      nextProgress: nextRecord,
      metadata,
    }),
  ]);
}

function findRequiredProgress(progress: PlanBlockProgress[], blockId: string): PlanBlockProgress {
  const record = progress.find((candidate) => candidate.blockId === blockId);

  if (!record) {
    throw new ProgressRecordNotFoundError(`Progress record not found for block ${blockId}.`);
  }

  return record;
}

function replaceRecord(
  progress: PlanBlockProgress[],
  previousRecord: PlanBlockProgress,
  nextRecord: PlanBlockProgress,
  events: ProgressEvent[],
): ProgressActionResult {
  const exists = progress.some((record) => record.id === previousRecord.id);

  if (!exists) {
    throw new PlanBlockNotFoundError(`Plan block not found: ${previousRecord.blockId}.`);
  }

  return {
    progress: progress.map((record) => (record.id === previousRecord.id ? nextRecord : record)),
    events,
  };
}

export function getProgressRecordByBlockId(
  progress: PlanBlockProgress[],
  blockId: string,
): PlanBlockProgress {
  return findRequiredProgress(progress, blockId);
}

export function updateProgressScheduledDate(
  progress: PlanBlockProgress[],
  blockId: string,
  scheduledDate: CalendarDate,
  occurredAt: string,
): PlanBlockProgress[] {
  const record = findRequiredProgress(progress, blockId);
  const nextRecord = { ...record, scheduledDate, updatedAt: occurredAt };
  return progress.map((candidate) => (candidate.id === record.id ? nextRecord : candidate));
}
