import { addCalendarDays } from "@/lib/domain/schedule";
import type { CalendarDate } from "@/lib/domain/schedule";
import { REVIEW_CYCLE } from "@/lib/db/constants";
import type { ReviewResult } from "@/types/database";

export { REVIEW_CYCLE };

export const REVIEW_CYCLE_LENGTH = REVIEW_CYCLE.length;

/**
 * Returns the interval in days for the given cycle index.
 * Returns null if the cycle is completed (index >= last).
 */
export function getReviewIntervalDays(cycleIndex: number): number | null {
  if (cycleIndex >= REVIEW_CYCLE.length) return null;
  return REVIEW_CYCLE[cycleIndex] as number;
}

/**
 * Advances the cycle index based on the review result.
 *
 * Rules:
 * - again: stays at same index (retry same interval)
 * - hard:  advances by 1 (conservative)
 * - good:  advances by 1
 * - easy:  advances by 2 (max = last index)
 *
 * Caps at REVIEW_CYCLE_LENGTH (completed).
 */
export function getNextCycleIndex(currentIndex: number, result: ReviewResult): number {
  switch (result) {
    case "again":
      return currentIndex; // redo same interval
    case "hard":
      return Math.min(currentIndex + 1, REVIEW_CYCLE_LENGTH);
    case "good":
      return Math.min(currentIndex + 1, REVIEW_CYCLE_LENGTH);
    case "easy":
      return Math.min(currentIndex + 2, REVIEW_CYCLE_LENGTH);
  }
}

export function isCycleCompleted(cycleIndex: number): boolean {
  return cycleIndex >= REVIEW_CYCLE_LENGTH;
}

export type CalculateNextReviewInput = {
  completedOn: CalendarDate;
  currentCycleIndex: number;
  result: ReviewResult;
};

/**
 * Returns the next review date, or null if the cycle is now completed.
 * Does not depend on new Date() — takes completedOn explicitly.
 */
export function calculateNextReviewDate({
  completedOn,
  currentCycleIndex,
  result,
}: CalculateNextReviewInput): CalendarDate | null {
  const nextIndex = getNextCycleIndex(currentCycleIndex, result);
  if (isCycleCompleted(nextIndex)) return null;
  const intervalDays = getReviewIntervalDays(nextIndex);
  if (intervalDays === null) return null;
  return addCalendarDays(completedOn, intervalDays);
}
