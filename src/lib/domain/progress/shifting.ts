import {
  getNextStudyDate,
  isBeforeCalendarDate,
  isSameCalendarDate,
  type CalendarDate,
} from "@/lib/domain/schedule";
import { buildEffectiveSchedule } from "./effective-schedule";
import { NoPendingItemsToShiftError } from "./progress.errors";
import { createActionGroupId, createProgressEvent } from "./progress-events";
import { skipPlanBlock } from "./progress-actions";
import type {
  HandleMissedStudyDayInput,
  HandleMissedStudyDayResult,
  PlanBlockProgress,
  ProgressActionContext,
  ProgressEvent,
  ScheduleOverride,
  ShiftPendingScheduleInput,
  ShiftPendingScheduleResult,
} from "./progress.types";
import { reschedulePlanBlock } from "./rescheduling";

const SHIFTABLE_STATUSES = new Set(["pending", "in_progress", "stuck"]);

export function shiftPendingSchedule(
  context: ProgressActionContext,
  input: ShiftPendingScheduleInput,
): ShiftPendingScheduleResult {
  const effectiveSchedule = buildEffectiveSchedule(
    context.baseSchedule,
    context.progress,
    context.overrides,
    {
      today: input.fromDate,
      availability: input.availability,
    },
  );
  const actionGroupId = input.actionGroupId ?? createActionGroupId("shift", input.now);
  const shiftableItems = effectiveSchedule
    .flatMap((day) => day.items)
    .filter(
      (item) =>
        !isBeforeCalendarDate(item.scheduledDate, input.fromDate) &&
        SHIFTABLE_STATUSES.has(item.executionStatus),
    )
    .sort((a, b) => a.planDaySequence - b.planDaySequence || a.blockId.localeCompare(b.blockId));

  if (shiftableItems.length === 0) {
    throw new NoPendingItemsToShiftError("There are no pending items to shift.");
  }

  const uniquePlanDaySequences = [
    ...new Set(shiftableItems.map((item) => item.planDaySequence)),
  ].sort((a, b) => a - b);
  const sequenceDateMap = new Map<number, CalendarDate>();
  let cursor = getNextStudyDate(input.fromDate, input.availability, { includeCurrentDate: false });

  for (const sequence of uniquePlanDaySequences) {
    sequenceDateMap.set(sequence, cursor);
    cursor = getNextStudyDate(cursor, input.availability);
  }

  let progress = context.progress;
  const events: ProgressEvent[] = [];
  const overrides: ScheduleOverride[] = [];

  for (const item of shiftableItems) {
    const record = progress.find((candidate) => candidate.blockId === item.blockId);

    if (!record) {
      continue;
    }

    const toDate = sequenceDateMap.get(item.planDaySequence);

    if (!toDate || isSameCalendarDate(record.scheduledDate, toDate)) {
      continue;
    }

    const nextRecord: PlanBlockProgress = {
      ...record,
      scheduledDate: toDate,
      updatedAt: input.now,
    };
    progress = progress.map((candidate) => (candidate.id === record.id ? nextRecord : candidate));
    overrides.push({
      id: `schedule-override:shift:${item.blockId}:${input.now}`,
      blockId: item.blockId,
      type: "shift",
      fromDate: record.scheduledDate,
      toDate,
      createdAt: input.now,
      actionGroupId,
    });
    events.push(
      createProgressEvent({
        blockId: item.blockId,
        type: "schedule_shifted",
        occurredAt: input.now,
        previousProgress: record,
        nextProgress: nextRecord,
        previousValue: record.scheduledDate,
        nextValue: toDate,
        actionGroupId,
      }),
    );
  }

  if (events.length === 0) {
    throw new NoPendingItemsToShiftError("There are no pending items to shift.");
  }

  return { progress, events, overrides, actionGroupId };
}

export function handleMissedStudyDay(
  context: ProgressActionContext,
  input: HandleMissedStudyDayInput,
): HandleMissedStudyDayResult {
  if (input.strategy === "keep_overdue") {
    return { progress: context.progress, events: [], overrides: [], warnings: [] };
  }

  const effectiveSchedule = buildEffectiveSchedule(
    context.baseSchedule,
    context.progress,
    context.overrides,
    {
      today: input.today,
      availability: input.availability,
    },
  );
  const missedItems = effectiveSchedule
    .flatMap((day) => day.items)
    .filter(
      (item) =>
        isSameCalendarDate(item.scheduledDate, input.missedDate) &&
        item.executionStatus !== "completed" &&
        item.executionStatus !== "skipped",
    );

  if (input.strategy === "shift_pending") {
    const result = shiftPendingSchedule(context, {
      fromDate: input.missedDate,
      availability: input.availability,
      now: input.now,
    });
    return { ...result, warnings: [] };
  }

  if (input.strategy === "reschedule_items") {
    let progress = context.progress;
    const events: ProgressEvent[] = [];
    const overrides: ScheduleOverride[] = [];
    const warnings: HandleMissedStudyDayResult["warnings"] = [];

    for (const item of missedItems) {
      const targetDate = input.rescheduleTargets?.[item.blockId];

      if (!targetDate) {
        throw new NoPendingItemsToShiftError(`Missing target date for ${item.blockId}.`);
      }

      const result = reschedulePlanBlock(
        { ...context, progress },
        {
          blockId: item.blockId,
          targetDate,
          today: input.today,
          availability: input.availability,
          now: input.now,
        },
      );
      progress = result.progress;
      events.push(...result.events);
      overrides.push(...result.overrides);
      warnings.push(...result.warnings);
    }

    return { progress, events, overrides, warnings };
  }

  let progress = context.progress;
  const events: ProgressEvent[] = [];

  for (const item of missedItems) {
    const result = skipPlanBlock(progress, item.blockId, input.now, input.skipReason);
    progress = result.progress;
    events.push(...result.events);
  }

  return { progress, events, overrides: [], warnings: [] };
}
