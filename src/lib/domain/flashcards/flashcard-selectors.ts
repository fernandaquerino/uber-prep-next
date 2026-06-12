import type { CalendarDate } from "@/lib/domain/schedule";
import type { FlashcardRecord, ReviewRecord } from "@/types/database";
import { getLearningState, getFlashcardReviewSummary } from "./flashcard-status";
import type { FlashcardListItem } from "./flashcard.types";

/** Number of days a review is overdue; 0 if not overdue */
export function getDaysOverdue(nextReviewDate: string | null, today: CalendarDate): number {
  if (!nextReviewDate) return 0;
  if (nextReviewDate <= today) {
    // Calculate delta in days
    const a = new Date(`${today}T12:00:00Z`);
    const b = new Date(`${nextReviewDate}T12:00:00Z`);
    const diff = Math.floor((a.getTime() - b.getTime()) / 86_400_000);
    return Math.max(0, diff);
  }
  return 0;
}

export function isDueToday(nextReviewDate: string | null, today: CalendarDate): boolean {
  if (!nextReviewDate) return false;
  return nextReviewDate <= today;
}

/** Check if a flashcard review is new (no ReviewRecord). */
export function isNewFlashcard(review: ReviewRecord | undefined): boolean {
  return !review || review.history.length === 0;
}

/**
 * Build a FlashcardListItem from a FlashcardRecord + optional ReviewRecord.
 * All list-level computed fields are derived here.
 */
export function buildFlashcardListItem(
  card: FlashcardRecord,
  review: ReviewRecord | undefined,
  today: CalendarDate,
): FlashcardListItem {
  const summary = getFlashcardReviewSummary(review);
  const learningState = getLearningState(summary);

  // nextReview comes from ReviewRecord.scheduledFor (source of truth).
  // If the review cycle is completed or cancelled/dismissed, there is no future review.
  const hasActiveReview =
    review &&
    review.status !== "completed" &&
    review.status !== "cancelled" &&
    review.status !== "dismissed";
  const nextReviewDate = hasActiveReview ? (review.scheduledFor as CalendarDate) : null;
  const overdue = getDaysOverdue(nextReviewDate, today);
  const due = isDueToday(nextReviewDate, today);

  return {
    id: card.id,
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags ?? [],
    source: card.source ?? "user",
    lifecycleStatus: card.lifecycleStatus ?? "active",
    sourceId: card.sourceId,
    learningState,
    nextReviewDate,
    daysOverdue: overdue,
    isDueToday: due,
    reviewCount: review?.history.length ?? card.reviewCount ?? 0,
    lastResult: summary?.lastResult,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

/** Filter to only flashcards that are due today or overdue */
export function selectDueFlashcards(
  items: FlashcardListItem[],
  today: CalendarDate,
): FlashcardListItem[] {
  return items.filter((c) => c.lifecycleStatus !== "archived" && isDueToday(c.nextReviewDate, today));
}

/** Filter to new flashcards (never reviewed) */
export function selectNewFlashcards(items: FlashcardListItem[]): FlashcardListItem[] {
  return items.filter((c) => c.lifecycleStatus !== "archived" && c.learningState === "new");
}
