"use client";

import { useCallback } from "react";
import type {
  CompletePlanBlockInput,
  HandleMissedStudyDayInput,
  MarkPlanBlockStuckInput,
  ReschedulePlanBlockInput,
  ShiftPendingScheduleInput,
} from "@/lib/domain/progress";
import type { ScheduledStudyDay } from "@/lib/domain/schedule";
import {
  changeStartDate,
  completePlanBlock,
  handleMissedStudyDay,
  markPlanBlockStuck,
  reschedulePlanBlock,
  restoreSkippedPlanBlock,
  returnPlanBlockToPending,
  shiftPendingSchedule,
  skipPlanBlock,
  startPlanBlock,
  undoProgressAction,
  updatePlanBlockProgress,
} from "@/lib/application/progress";
import type { UpdatePlanBlockProgressInput } from "@/lib/domain/progress";

function getNow(): string {
  return new Date().toISOString();
}

async function getDb() {
  const { getDb: _getDb } = await import("@/lib/db/db");
  return _getDb();
}

export type PlanActionsCallbacks = {
  onSuccess: () => Promise<void>;
  onError: (error: Error) => void;
};

export type UsePlanActionsResult = {
  startBlock: (blockId: string) => Promise<void>;
  completeBlock: (input: Omit<CompletePlanBlockInput, "completedAt">) => Promise<void>;
  markStuck: (input: Omit<MarkPlanBlockStuckInput, "occurredAt">) => Promise<void>;
  returnToPending: (blockId: string) => Promise<void>;
  skipBlock: (blockId: string, reason?: string) => Promise<void>;
  restoreBlock: (blockId: string) => Promise<void>;
  rescheduleBlock: (
    input: Omit<ReschedulePlanBlockInput, "now"> & { baseSchedule: ScheduledStudyDay[] },
  ) => Promise<void>;
  shiftSchedule: (
    input: Omit<ShiftPendingScheduleInput, "now"> & { baseSchedule: ScheduledStudyDay[] },
  ) => Promise<void>;
  handleMissedDay: (
    input: Omit<HandleMissedStudyDayInput, "now"> & { baseSchedule: ScheduledStudyDay[] },
  ) => Promise<void>;
  undoAction: (input: { eventId?: string; actionGroupId?: string }) => Promise<void>;
  changeStartDate: (input: {
    newStartDate: import("@/lib/domain/schedule").CalendarDate;
    newBaseSchedule: ScheduledStudyDay[];
    option: import("@/lib/application/progress").ChangeStartDateOption;
  }) => Promise<void>;
  updateBlockDetails: (input: Omit<UpdatePlanBlockProgressInput, "occurredAt">) => Promise<void>;
};

export function usePlanActions(callbacks: PlanActionsCallbacks): UsePlanActionsResult {
  const { onSuccess, onError } = callbacks;

  const wrap = useCallback(
    async (fn: () => Promise<void>) => {
      try {
        await fn();
        await onSuccess();
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [onSuccess, onError],
  );

  return {
    startBlock: useCallback(
      (blockId) =>
        wrap(async () => {
          const db = await getDb();
          await startPlanBlock({ db, blockId, startedAt: getNow() });
        }),
      [wrap],
    ),

    completeBlock: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await completePlanBlock({ db, ...input, completedAt: getNow() });
        }),
      [wrap],
    ),

    markStuck: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await markPlanBlockStuck({ db, ...input, occurredAt: getNow() });
        }),
      [wrap],
    ),

    returnToPending: useCallback(
      (blockId) =>
        wrap(async () => {
          const db = await getDb();
          await returnPlanBlockToPending({ db, blockId, occurredAt: getNow() });
        }),
      [wrap],
    ),

    skipBlock: useCallback(
      (blockId, reason) =>
        wrap(async () => {
          const db = await getDb();
          await skipPlanBlock({ db, blockId, skippedAt: getNow(), reason });
        }),
      [wrap],
    ),

    restoreBlock: useCallback(
      (blockId) =>
        wrap(async () => {
          const db = await getDb();
          await restoreSkippedPlanBlock({ db, blockId, occurredAt: getNow() });
        }),
      [wrap],
    ),

    rescheduleBlock: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await reschedulePlanBlock({ db, ...input, now: getNow() });
        }),
      [wrap],
    ),

    shiftSchedule: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await shiftPendingSchedule({ db, ...input, now: getNow() });
        }),
      [wrap],
    ),

    handleMissedDay: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await handleMissedStudyDay({ db, ...input, now: getNow() });
        }),
      [wrap],
    ),

    undoAction: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await undoProgressAction({ db, ...input, occurredAt: getNow() });
        }),
      [wrap],
    ),

    changeStartDate: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await changeStartDate({ db, ...input, now: getNow() });
        }),
      [wrap],
    ),

    updateBlockDetails: useCallback(
      (input) =>
        wrap(async () => {
          const db = await getDb();
          await updatePlanBlockProgress({ db, ...input, occurredAt: getNow() });
        }),
      [wrap],
    ),
  };
}
