"use client";

import { useState, useCallback, useRef } from "react";
import type { ReviewResult } from "@/types/database";
import type {
  FlashcardSessionConfig,
  FlashcardSessionState,
  FlashcardSessionResult,
} from "@/lib/domain/flashcards";
import type { FlashcardsPageData } from "@/lib/application/flashcards";
import {
  buildFlashcardSession,
  saveSessionToStorage,
  loadSessionFromStorage,
  clearSessionFromStorage,
} from "@/lib/application/flashcards";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

export type UseFlashcardStudySessionResult = {
  session: FlashcardSessionState | null;
  result: FlashcardSessionResult | null;
  startSession: (config: FlashcardSessionConfig, data: FlashcardsPageData) => void;
  restoreSession: () => boolean;
  reveal: () => void;
  answer: (flashcardId: string, result: ReviewResult) => void;
  endSession: () => void;
  cancelSession: () => void;
};

export function useFlashcardStudySession(
  onAnswer?: (flashcardId: string, result: ReviewResult, updateSpacedRep: boolean) => void,
): UseFlashcardStudySessionResult {
  const [session, setSession] = useState<FlashcardSessionState | null>(null);
  const [result, setResult] = useState<FlashcardSessionResult | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const startSession = useCallback((config: FlashcardSessionConfig, data: FlashcardsPageData) => {
    const built = buildFlashcardSession({
      config,
      cards: data.allCards.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        category: c.category,
        tags: c.tags,
        status: "pending",
        lifecycleStatus: c.lifecycleStatus,
        source: c.source,
        sourceId: c.sourceId,
        nextReview: c.nextReviewDate,
        knownAt: null,
        lastReviewedAt: null,
        reviewCount: c.reviewCount,
        reviews: [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      reviewsByCardId: data.reviewsByCardId,
      today: getTodayCalendarDate(),
    });
    startedAtRef.current = Date.now();
    setResult(null);
    setSession(built);
    saveSessionToStorage(built);
  }, []);

  const restoreSession = useCallback((): boolean => {
    const stored = loadSessionFromStorage();
    if (!stored) return false;
    startedAtRef.current = new Date(stored.startedAt).getTime();
    setSession(stored);
    return true;
  }, []);

  const reveal = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, isRevealed: true };
      saveSessionToStorage(next);
      return next;
    });
  }, []);

  const answer = useCallback(
    (flashcardId: string, rating: ReviewResult) => {
      setSession((prev) => {
        if (!prev) return prev;
        const newAnswered = new Map(prev.answered);
        newAnswered.set(flashcardId, rating);
        const nextIndex = prev.currentIndex + 1;
        const next: FlashcardSessionState = {
          ...prev,
          answered: newAnswered,
          currentIndex: nextIndex,
          isRevealed: false,
        };
        saveSessionToStorage(next);

        // Persist to DB (fire-and-forget — errors handled by the hook consumer)
        onAnswer?.(flashcardId, rating, prev.updateSpacedRep);

        return next;
      });
    },
    [onAnswer],
  );

  const endSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const durationMs = Date.now() - (startedAtRef.current ?? Date.now());
      const counts = { again: 0, hard: 0, good: 0, easy: 0 };
      for (const r of prev.answered.values()) {
        counts[r]++;
      }
      const sessionResult: FlashcardSessionResult = {
        total: prev.answered.size,
        ...counts,
        completedAt: new Date().toISOString(),
        durationMs,
      };
      setResult(sessionResult);
      clearSessionFromStorage();
      return null;
    });
  }, []);

  const cancelSession = useCallback(() => {
    clearSessionFromStorage();
    setSession(null);
    setResult(null);
  }, []);

  return {
    session,
    result,
    startSession,
    restoreSession,
    reveal,
    answer,
    endSession,
    cancelSession,
  };
}
