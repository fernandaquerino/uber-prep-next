import type { ReviewRecord } from "@/types/database";
import type { FlashcardLearningState, FlashcardReviewSummary } from "./flashcard.types";

/**
 * Derive learning state from the latest ReviewRecord for a flashcard.
 *
 * Rules:
 *   new       — no active/completed ReviewRecord (cycleIndex doesn't matter)
 *   learning  — cycleIndex <= 1, OR last result was "again"
 *   reviewing — cycleIndex 2–3
 *   mastered  — cycleIndex >= 4
 */
export function getLearningState(summary: FlashcardReviewSummary | null): FlashcardLearningState {
  if (!summary || summary.historyLength === 0) return "new";
  if (summary.cycleIndex >= 4) return "mastered";
  if (summary.cycleIndex <= 1 || summary.lastResult === "again") return "learning";
  return "reviewing";
}

export function getFlashcardReviewSummary(
  review: ReviewRecord | undefined,
): FlashcardReviewSummary | null {
  if (!review) return null;
  return {
    cycleIndex: review.cycleIndex,
    lastResult: review.lastResult ?? review.lastRating,
    historyLength: review.history.length,
  };
}

export function getFlashcardLearningStateFromReview(
  review: ReviewRecord | undefined,
): FlashcardLearningState {
  return getLearningState(getFlashcardReviewSummary(review));
}

export const LEARNING_STATE_LABELS: Record<FlashcardLearningState, string> = {
  new: "Novo",
  learning: "Aprendendo",
  reviewing: "Revisando",
  mastered: "Dominado",
};
