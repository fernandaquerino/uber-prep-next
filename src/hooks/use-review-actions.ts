"use client";

import { useCallback } from "react";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewResult } from "@/types/database";
import type { CreateManualReviewInput } from "@/lib/application/reviews/review-use-cases";

function getNow(): string {
  return new Date().toISOString();
}

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` as CalendarDate;
}

async function getDb() {
  const { getDb: _getDb } = await import("@/lib/db/db");
  return _getDb();
}

export type ReviewActionsCallbacks = {
  onSuccess: () => void | Promise<void>;
  onError: (error: Error) => void;
};

export type UseReviewActionsResult = {
  completeReview: (reviewId: string, result: ReviewResult, response?: string) => Promise<void>;
  postponeReview: (reviewId: string, newDate: CalendarDate) => Promise<void>;
  dismissReview: (reviewId: string) => Promise<void>;
  reopenReview: (reviewId: string) => Promise<void>;
  createManualReview: (input: CreateManualReviewInput) => Promise<void>;
  saveJournalEntry: (content: string, wins: string, blockers: string) => Promise<void>;
  saveWeeklyReflection: (
    weekNumber: number,
    fields: {
      content: string;
      wins: string;
      blockers: string;
      whatWorked: string;
      whatToAdjust: string;
    },
  ) => Promise<void>;
};

export function useReviewActions(callbacks: ReviewActionsCallbacks): UseReviewActionsResult {
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

  const completeReview = useCallback(
    (reviewId: string, result: ReviewResult, response?: string) =>
      wrap(async () => {
        const { completeReview: _complete } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        await _complete(db, reviewId, result, getTodayCalendarDate(), response);
      }),
    [wrap],
  );

  const postponeReview = useCallback(
    (reviewId: string, newDate: CalendarDate) =>
      wrap(async () => {
        const { postponeReview: _postpone } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        await _postpone(db, reviewId, newDate);
      }),
    [wrap],
  );

  const dismissReview = useCallback(
    (reviewId: string) =>
      wrap(async () => {
        const { dismissReview: _dismiss } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        await _dismiss(db, reviewId);
      }),
    [wrap],
  );

  const reopenReview = useCallback(
    (reviewId: string) =>
      wrap(async () => {
        const { reopenReview: _reopen } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        await _reopen(db, reviewId, getTodayCalendarDate());
      }),
    [wrap],
  );

  const createManualReview = useCallback(
    (input: CreateManualReviewInput) =>
      wrap(async () => {
        const { createManualReview: _create } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        await _create(db, input, getNow());
      }),
    [wrap],
  );

  const saveJournalEntry = useCallback(
    (content: string, wins: string, blockers: string) =>
      wrap(async () => {
        const db = await getDb();
        const today = getTodayCalendarDate();
        const existing = await db.learningJournal.where("date").equals(today).first();
        const now = getNow();
        await db.learningJournal.put({
          id: existing?.id ?? `journal:${today}`,
          date: today,
          content: content || undefined,
          wins: wins || undefined,
          blockers: blockers || undefined,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        });
      }),
    [wrap],
  );

  const saveWeeklyReflection = useCallback(
    (
      weekNumber: number,
      fields: {
        content: string;
        wins: string;
        blockers: string;
        whatWorked: string;
        whatToAdjust: string;
      },
    ) =>
      wrap(async () => {
        const db = await getDb();
        const existing = await db.weeklyReflections.where("weekNumber").equals(weekNumber).first();
        const now = getNow();
        await db.weeklyReflections.put({
          id: existing?.id ?? `reflection:week-${weekNumber}`,
          weekNumber,
          content: fields.content || undefined,
          wins: fields.wins || undefined,
          blockers: fields.blockers || undefined,
          ...(fields.whatWorked ? { whatWorked: fields.whatWorked } : {}),
          ...(fields.whatToAdjust ? { whatToAdjust: fields.whatToAdjust } : {}),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        } as Parameters<typeof db.weeklyReflections.put>[0]);
      }),
    [wrap],
  );

  return {
    completeReview,
    postponeReview,
    dismissReview,
    reopenReview,
    createManualReview,
    saveJournalEntry,
    saveWeeklyReflection,
  };
}
