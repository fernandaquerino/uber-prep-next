"use client";

import { useState, useCallback } from "react";
import type { ReviewQueueItemViewModel } from "@/lib/presentation/reviews/review-view-model";

export type ReviewSessionState = {
  isActive: boolean;
  currentIndex: number;
  total: number;
  currentItem: ReviewQueueItemViewModel | null;
  isLast: boolean;
  progressLabel: string;
  progressPercentage: number;
};

export type UseReviewSessionResult = {
  session: ReviewSessionState;
  startSession: (queue: ReviewQueueItemViewModel[]) => void;
  advanceToNext: () => void;
  exitSession: () => void;
};

function buildState(
  isActive: boolean,
  queue: ReviewQueueItemViewModel[],
  index: number,
): ReviewSessionState {
  const total = queue.length;
  return {
    isActive,
    currentIndex: index,
    total,
    currentItem: isActive && index < total ? (queue[index] ?? null) : null,
    isLast: index >= total - 1,
    progressLabel: total === 0 ? "Sem revisões" : `${index + 1} de ${total}`,
    progressPercentage: total === 0 ? 0 : Math.round(((index + 1) / total) * 100),
  };
}

const INITIAL: ReviewSessionState = {
  isActive: false,
  currentIndex: 0,
  total: 0,
  currentItem: null,
  isLast: false,
  progressLabel: "Sem revisões",
  progressPercentage: 0,
};

export function useReviewSession(): UseReviewSessionResult {
  const [queue, setQueue] = useState<ReviewQueueItemViewModel[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  const session: ReviewSessionState = active ? buildState(true, queue, index) : INITIAL;

  const startSession = useCallback((items: ReviewQueueItemViewModel[]) => {
    setQueue(items);
    setIndex(0);
    setActive(true);
  }, []);

  const advanceToNext = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      return next;
    });
  }, []);

  const exitSession = useCallback(() => {
    setActive(false);
    setIndex(0);
    setQueue([]);
  }, []);

  return { session, startSession, advanceToNext, exitSession };
}
