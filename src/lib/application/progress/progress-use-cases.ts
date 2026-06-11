import type { UberPrepDatabase } from "@/lib/db/schema";
import {
  buildEffectiveSchedule,
  completePlanBlock as completePlanBlockDomain,
  handleMissedStudyDay as handleMissedStudyDayDomain,
  initializePlanProgress as initializePlanProgressDomain,
  markPlanBlockStuck as markPlanBlockStuckDomain,
  reschedulePlanBlock as reschedulePlanBlockDomain,
  restoreSkippedPlanBlock as restoreSkippedPlanBlockDomain,
  returnPlanBlockToPending as returnPlanBlockToPendingDomain,
  shiftPendingSchedule as shiftPendingScheduleDomain,
  skipPlanBlock as skipPlanBlockDomain,
  startPlanBlock as startPlanBlockDomain,
  undoProgressAction as undoProgressActionDomain,
  updatePlanBlockProgressFields,
  type CompletePlanBlockInput,
  type CurrentStudyState,
  type EffectiveScheduledDay,
  type HandleMissedStudyDayInput,
  type MarkPlanBlockStuckInput,
  type ProgressEvent,
  type ReschedulePlanBlockInput,
  type ScheduleOverride,
  type ShiftPendingScheduleInput,
  type UpdatePlanBlockProgressInput,
  getCurrentStudyState as getCurrentStudyStateDomain,
} from "@/lib/domain/progress";
import type { ScheduledStudyDay, WeekdayAvailability, CalendarDate } from "@/lib/domain/schedule";
import type { PlanBlockProgress } from "@/lib/domain/progress";
import {
  toDomainEvent,
  toDomainOverride,
  toDomainProgress,
  toProgressEventRecord,
  toProgressRecord,
  toScheduleOverrideRecord,
} from "./mappers";

type UseCaseContext = {
  db: UberPrepDatabase;
};

export async function initializePlanProgress(input: {
  db: UberPrepDatabase;
  baseSchedule: ScheduledStudyDay[];
  now: string;
}): Promise<{ progress: PlanBlockProgress[]; events: ProgressEvent[] }> {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    initializePlanProgressDomain(input.baseSchedule, progress, input.now),
  );
}

export async function startPlanBlock(
  input: UseCaseContext & { blockId: string; startedAt: string },
) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    startPlanBlockDomain(progress, input.blockId, input.startedAt),
  );
}

export async function completePlanBlock(input: UseCaseContext & CompletePlanBlockInput) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    completePlanBlockDomain(progress, input),
  );
}

export async function markPlanBlockStuck(input: UseCaseContext & MarkPlanBlockStuckInput) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    markPlanBlockStuckDomain(progress, input),
  );
}

export async function returnPlanBlockToPending(
  input: UseCaseContext & { blockId: string; occurredAt: string },
) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    returnPlanBlockToPendingDomain(progress, input.blockId, input.occurredAt),
  );
}

export async function skipPlanBlock(
  input: UseCaseContext & { blockId: string; skippedAt: string; reason?: string },
) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    skipPlanBlockDomain(progress, input.blockId, input.skippedAt, input.reason),
  );
}

export async function restoreSkippedPlanBlock(
  input: UseCaseContext & { blockId: string; occurredAt: string },
) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    restoreSkippedPlanBlockDomain(progress, input.blockId, input.occurredAt),
  );
}

export async function updatePlanBlockProgress(
  input: UseCaseContext & UpdatePlanBlockProgressInput,
) {
  return writeProgressTransaction(input.db, async ({ progress }) =>
    updatePlanBlockProgressFields(progress, input),
  );
}

export async function reschedulePlanBlock(
  input: UseCaseContext &
    ReschedulePlanBlockInput & {
      baseSchedule: ScheduledStudyDay[];
    },
) {
  return writeProgressTransaction(input.db, async ({ progress, overrides }) =>
    reschedulePlanBlockDomain(
      {
        baseSchedule: input.baseSchedule,
        progress,
        overrides,
      },
      input,
    ),
  );
}

export async function shiftPendingSchedule(
  input: UseCaseContext &
    ShiftPendingScheduleInput & {
      baseSchedule: ScheduledStudyDay[];
    },
) {
  return writeProgressTransaction(input.db, async ({ progress, overrides }) =>
    shiftPendingScheduleDomain(
      {
        baseSchedule: input.baseSchedule,
        progress,
        overrides,
      },
      input,
    ),
  );
}

export async function handleMissedStudyDay(
  input: UseCaseContext &
    HandleMissedStudyDayInput & {
      baseSchedule: ScheduledStudyDay[];
    },
) {
  return writeProgressTransaction(input.db, async ({ progress, overrides }) =>
    handleMissedStudyDayDomain(
      {
        baseSchedule: input.baseSchedule,
        progress,
        overrides,
      },
      input,
    ),
  );
}

export async function undoProgressAction(
  input: UseCaseContext & {
    eventId?: string;
    actionGroupId?: string;
    occurredAt: string;
  },
) {
  return input.db.transaction(
    "rw",
    [input.db.planProgress, input.db.progressEvents, input.db.scheduleOverrides],
    async () => {
      const progress = (await input.db.planProgress.toArray()).map(toDomainProgress);
      const events = (await input.db.progressEvents.toArray()).map(toDomainEvent);
      const overrides = (await input.db.scheduleOverrides.toArray()).map(toDomainOverride);
      const result = undoProgressActionDomain(progress, events, overrides, input);

      await input.db.planProgress.bulkPut(result.progress.map(toProgressRecord));
      if (result.removedOverrideIds.length > 0) {
        await input.db.scheduleOverrides.bulkDelete(result.removedOverrideIds);
      }
      await input.db.progressEvents.bulkAdd(result.events.map(toProgressEventRecord));
      return result;
    },
  );
}

export async function getEffectiveSchedule(input: {
  db: UberPrepDatabase;
  baseSchedule: ScheduledStudyDay[];
  today: CalendarDate;
  availability: WeekdayAvailability;
}): Promise<EffectiveScheduledDay[]> {
  const [progressRecords, overrideRecords] = await Promise.all([
    input.db.planProgress.toArray(),
    input.db.scheduleOverrides.toArray(),
  ]);

  return buildEffectiveSchedule(
    input.baseSchedule,
    progressRecords.map(toDomainProgress),
    overrideRecords.map(toDomainOverride),
    {
      today: input.today,
      availability: input.availability,
    },
  );
}

export async function getCurrentStudyState(input: {
  db: UberPrepDatabase;
  baseSchedule: ScheduledStudyDay[];
  today: CalendarDate;
  availability: WeekdayAvailability;
}): Promise<CurrentStudyState> {
  return getCurrentStudyStateDomain(await getEffectiveSchedule(input));
}

async function writeProgressTransaction<
  T extends {
    progress: PlanBlockProgress[];
    events: ProgressEvent[];
    overrides?: ScheduleOverride[];
  },
>(
  db: UberPrepDatabase,
  run: (state: {
    progress: PlanBlockProgress[];
    events: ProgressEvent[];
    overrides: ScheduleOverride[];
  }) => Promise<T> | T,
): Promise<T> {
  return db.transaction(
    "rw",
    [db.planProgress, db.progressEvents, db.scheduleOverrides],
    async () => {
      const progress = (await db.planProgress.toArray()).map(toDomainProgress);
      const events = (await db.progressEvents.toArray()).map(toDomainEvent);
      const overrides = (await db.scheduleOverrides.toArray()).map(toDomainOverride);
      const result = await run({ progress, events, overrides });

      await db.planProgress.bulkPut(result.progress.map(toProgressRecord));
      if (result.overrides && result.overrides.length > 0) {
        await db.scheduleOverrides.bulkAdd(result.overrides.map(toScheduleOverrideRecord));
      }
      if (result.events.length > 0) {
        await db.progressEvents.bulkAdd(result.events.map(toProgressEventRecord));
      }

      return result;
    },
  );
}
