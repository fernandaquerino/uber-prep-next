import { parseCalendarDate } from "@/lib/domain/schedule";
import type { PlanBlockProgress, ProgressEvent, ScheduleOverride } from "@/lib/domain/progress";
import type {
  PlanProgressRecord,
  ProgressEventRecord,
  ScheduleOverrideRecord,
} from "@/types/database";

export function toDomainProgress(record: PlanProgressRecord): PlanBlockProgress {
  return {
    ...record,
    planDayId: record.planDayId ?? "unknown-plan-day",
    planDaySequence: record.planDaySequence ?? 0,
    status: record.status,
    originalScheduledDate: parseCalendarDate(
      record.originalScheduledDate ?? record.scheduledDate ?? "1970-01-01",
    ),
    scheduledDate: parseCalendarDate(
      record.scheduledDate ?? record.originalScheduledDate ?? "1970-01-01",
    ),
  };
}

export function toProgressRecord(progress: PlanBlockProgress): PlanProgressRecord {
  return {
    ...progress,
    originalScheduledDate: progress.originalScheduledDate,
    scheduledDate: progress.scheduledDate,
  };
}

export function toDomainEvent(record: ProgressEventRecord): ProgressEvent {
  return {
    ...record,
    previousProgress: record.previousProgress
      ? toDomainProgress(record.previousProgress)
      : undefined,
    nextProgress: record.nextProgress ? toDomainProgress(record.nextProgress) : undefined,
  };
}

export function toProgressEventRecord(event: ProgressEvent): ProgressEventRecord {
  return {
    ...event,
    previousProgress: event.previousProgress ? toProgressRecord(event.previousProgress) : undefined,
    nextProgress: event.nextProgress ? toProgressRecord(event.nextProgress) : undefined,
  };
}

export function toDomainOverride(record: ScheduleOverrideRecord): ScheduleOverride {
  return {
    ...record,
    fromDate: parseCalendarDate(record.fromDate),
    toDate: parseCalendarDate(record.toDate),
  };
}

export function toScheduleOverrideRecord(override: ScheduleOverride): ScheduleOverrideRecord {
  return {
    ...override,
    fromDate: override.fromDate,
    toDate: override.toDate,
  };
}
