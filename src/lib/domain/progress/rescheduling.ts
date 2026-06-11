import {
  compareCalendarDates,
  getAvailabilityForDate,
  isBeforeCalendarDate,
  isSameCalendarDate,
} from "@/lib/domain/schedule";
import { buildEffectiveSchedule } from "./effective-schedule";
import {
  CannotRescheduleCompletedBlockError,
  CannotRescheduleSkippedBlockError,
  InvalidRescheduleDateError,
} from "./progress.errors";
import { createActionGroupId, createProgressEvent } from "./progress-events";
import { getProgressRecordByBlockId } from "./progress-actions";
import type {
  ProgressActionContext,
  ReschedulePlanBlockInput,
  ReschedulePlanBlockResult,
  ScheduleOverride,
} from "./progress.types";

export function reschedulePlanBlock(
  context: ProgressActionContext,
  input: ReschedulePlanBlockInput,
): ReschedulePlanBlockResult {
  const record = getProgressRecordByBlockId(context.progress, input.blockId);

  if (record.status === "completed") {
    throw new CannotRescheduleCompletedBlockError(
      "Completed blocks must be reopened before reschedule.",
    );
  }

  if (record.status === "skipped") {
    throw new CannotRescheduleSkippedBlockError(
      "Skipped blocks must be restored before reschedule.",
    );
  }

  const targetAvailability = getAvailabilityForDate(input.targetDate, input.availability);

  if (!targetAvailability.enabled && !input.allowRestDay) {
    throw new InvalidRescheduleDateError("Cannot reschedule to a rest day without allowRestDay.");
  }

  if (isBeforeCalendarDate(input.targetDate, input.today) && !input.allowPastDate) {
    throw new InvalidRescheduleDateError("Cannot reschedule to a date before today.");
  }

  const actionGroupId = input.actionGroupId ?? createActionGroupId("reschedule", input.now);
  const nextRecord = {
    ...record,
    scheduledDate: input.targetDate,
    updatedAt: input.now,
  };
  const progress = context.progress.map((candidate) =>
    candidate.id === record.id ? nextRecord : candidate,
  );
  const override: ScheduleOverride = {
    id: `schedule-override:reschedule:${input.blockId}:${input.now}`,
    blockId: input.blockId,
    type: "reschedule",
    fromDate: record.scheduledDate,
    toDate: input.targetDate,
    createdAt: input.now,
    actionGroupId,
  };
  const overrides = [...(context.overrides ?? []), override];
  const effectiveSchedule = buildEffectiveSchedule(context.baseSchedule, progress, overrides, {
    today: input.today,
    availability: input.availability,
  });
  const targetDay = effectiveSchedule.find((day) => isSameCalendarDate(day.date, input.targetDate));
  const warnings =
    targetDay &&
    compareCalendarDates(targetDay.date, input.targetDate) === 0 &&
    targetDay.capacityStatus === "over_capacity"
      ? [
          {
            type: "target_day_over_capacity" as const,
            availableMinutes: targetDay.availableMinutes,
            scheduledMinutes: targetDay.totalEstimatedMinutes,
          },
        ]
      : [];

  return {
    progress,
    overrides: [override],
    warnings,
    events: [
      createProgressEvent({
        blockId: input.blockId,
        type: "rescheduled",
        occurredAt: input.now,
        previousProgress: record,
        nextProgress: nextRecord,
        previousValue: record.scheduledDate,
        nextValue: input.targetDate,
        actionGroupId,
      }),
    ],
  };
}
