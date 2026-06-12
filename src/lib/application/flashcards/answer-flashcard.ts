import type { UberPrepDatabase } from "@/lib/db/schema";
import type { ReviewRecord, ReviewResult } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import { getNextCycleIndex, calculateNextReviewDate, isCycleCompleted } from "@/lib/domain/reviews";
import { DatabaseError } from "@/lib/db/errors";

/** Stable review ID for a flashcard — one record per card, updated each cycle */
export function flashcardReviewId(flashcardId: string): string {
  return `flashcard-review:${flashcardId}`;
}

function historyEntryId(): string {
  return `fh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Answer a flashcard review.
 *
 * - Creates the ReviewRecord if none exists.
 * - Advances the spaced repetition cycle using the shared REVIEW_CYCLE.
 * - Updates FlashcardRecord.reviewCount and .lastReviewedAt (legacy fields).
 *
 * If updateSpacedRep is false (free-practice session), no review record is written.
 */
export async function answerFlashcard(
  db: UberPrepDatabase,
  flashcardId: string,
  result: ReviewResult,
  answeredOn: CalendarDate,
  updateSpacedRep: boolean,
): Promise<void> {
  try {
    const card = await db.flashcards.get(flashcardId);
    if (!card) throw new Error(`Flashcard not found: ${flashcardId}`);

    const now = new Date().toISOString();
    const reviewId = flashcardReviewId(flashcardId);

    // Update legacy fields on the card (always)
    await db.flashcards.put({
      ...card,
      reviewCount: (card.reviewCount ?? 0) + 1,
      lastReviewedAt: now,
      updatedAt: now,
    });

    if (!updateSpacedRep) return;

    const existing = await db.reviews.get(reviewId);
    const currentCycleIndex = existing?.cycleIndex ?? 0;

    const nextCycleIndex = getNextCycleIndex(currentCycleIndex, result);
    const calculatedNextReviewDate = calculateNextReviewDate({
      completedOn: answeredOn,
      currentCycleIndex,
      result,
    });
    const nextReviewDate = result === "again" ? answeredOn : calculatedNextReviewDate;

    const cycleCompleted = isCycleCompleted(nextCycleIndex);

    const historyEntry = {
      id: historyEntryId(),
      date: now,
      result,
      previousCycleIndex: currentCycleIndex,
      nextCycleIndex,
      nextReviewAt: nextReviewDate,
    };

    if (!existing) {
      // First time answering — create ReviewRecord
      const record: ReviewRecord = {
        id: reviewId,
        sourceType: "flashcard",
        sourceId: flashcardId,
        status: cycleCompleted ? "completed" : result === "again" ? "due" : "scheduled",
        scheduledFor: nextReviewDate ?? answeredOn,
        originalScheduledFor: answeredOn,
        cycleIndex: nextCycleIndex,
        lastResult: result,
        lastRating: result,
        doneAt: now,
        history: [historyEntry],
        createdAt: now,
        updatedAt: now,
      };
      await db.reviews.put(record);
    } else {
      await db.reviews.put({
        ...existing,
        status: cycleCompleted ? "completed" : result === "again" ? "due" : "scheduled",
        scheduledFor: nextReviewDate ?? existing.scheduledFor,
        cycleIndex: nextCycleIndex,
        lastResult: result,
        lastRating: result,
        doneAt: now,
        history: [...existing.history, historyEntry],
        updatedAt: now,
      });
    }

    // Update legacy nextReview field on the card
    await db.flashcards.put({
      ...card,
      nextReview: nextReviewDate,
      reviewCount: (card.reviewCount ?? 0) + 1,
      lastReviewedAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Flashcard not found")) throw err;
    throw new DatabaseError(`Failed to answer flashcard ${flashcardId}`, err);
  }
}
