"use client";

import { useState, useCallback } from "react";
import type { ReviewResult } from "@/types/database";
import type { FlashcardCreateInput, FlashcardUpdateInput } from "@/lib/domain/flashcards";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

type ActionState = "idle" | "loading" | "error";

async function getDb() {
  const { getDb: _getDb } = await import("@/lib/db/db");
  return _getDb();
}

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

export function useFlashcardActions(onSuccess?: () => void) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const wrap = useCallback(
    async (fn: () => Promise<void>) => {
      setActionState("loading");
      setActionError(null);
      try {
        await fn();
        setActionState("idle");
        onSuccess?.();
      } catch (err) {
        setActionState("error");
        setActionError(err instanceof Error ? err.message : "Erro desconhecido.");
      }
    },
    [onSuccess],
  );

  const createFlashcard = useCallback(
    (input: FlashcardCreateInput) =>
      wrap(async () => {
        const db = await getDb();
        const { createFlashcard: _create } = await import("@/lib/application/flashcards");
        await _create(db, input);
      }),
    [wrap],
  );

  const updateFlashcard = useCallback(
    (input: FlashcardUpdateInput) =>
      wrap(async () => {
        const db = await getDb();
        const { updateFlashcard: _update } = await import("@/lib/application/flashcards");
        await _update(db, input);
      }),
    [wrap],
  );

  const archiveFlashcard = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { archiveFlashcard: _archive } = await import("@/lib/application/flashcards");
        await _archive(db, id);
      }),
    [wrap],
  );

  const restoreFlashcard = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { restoreFlashcard: _restore } = await import("@/lib/application/flashcards");
        await _restore(db, id);
      }),
    [wrap],
  );

  const deleteFlashcard = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { deleteFlashcard: _delete } = await import("@/lib/application/flashcards");
        await _delete(db, id);
      }),
    [wrap],
  );

  const answerFlashcard = useCallback(
    (flashcardId: string, result: ReviewResult, updateSpacedRep: boolean) =>
      wrap(async () => {
        const db = await getDb();
        const { answerFlashcard: _answer } = await import("@/lib/application/flashcards");
        await _answer(db, flashcardId, result, getTodayCalendarDate(), updateSpacedRep);
      }),
    [wrap],
  );

  const createFromPlanBlock = useCallback(
    (blockId: string, input: Omit<FlashcardCreateInput, "source" | "sourceId">) =>
      wrap(async () => {
        const db = await getDb();
        const { createFlashcardFromPlanBlock } = await import("@/lib/application/flashcards");
        await createFlashcardFromPlanBlock(db, { ...input, blockId });
      }),
    [wrap],
  );

  return {
    createFlashcard,
    updateFlashcard,
    archiveFlashcard,
    restoreFlashcard,
    deleteFlashcard,
    answerFlashcard,
    createFromPlanBlock,
    isLoading: actionState === "loading",
    error: actionError,
  };
}
