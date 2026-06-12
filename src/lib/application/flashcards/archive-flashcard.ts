import type { UberPrepDatabase } from "@/lib/db/schema";
import { flashcardReviewId } from "./answer-flashcard";
import { DatabaseError } from "@/lib/db/errors";

/**
 * Archive a flashcard.
 * - Sets lifecycleStatus to "archived".
 * - Cancels any pending/scheduled review.
 * - Preserves completed review history.
 */
export async function archiveFlashcard(db: UberPrepDatabase, id: string): Promise<void> {
  const card = await db.flashcards.get(id);
  if (!card) throw new Error(`Flashcard not found: ${id}`);

  try {
    const now = new Date().toISOString();

    await db.flashcards.put({
      ...card,
      lifecycleStatus: "archived",
      archivedAt: now,
      updatedAt: now,
    });

    // Cancel pending review
    const reviewId = flashcardReviewId(id);
    const review = await db.reviews.get(reviewId);
    if (review && (review.status === "scheduled" || review.status === "due")) {
      await db.reviews.put({
        ...review,
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      });
    }
  } catch (err) {
    throw new DatabaseError(`Failed to archive flashcard ${id}`, err);
  }
}

/**
 * Restore an archived flashcard to active status.
 */
export async function restoreFlashcard(db: UberPrepDatabase, id: string): Promise<void> {
  const card = await db.flashcards.get(id);
  if (!card) throw new Error(`Flashcard not found: ${id}`);

  try {
    const now = new Date().toISOString();
    await db.flashcards.put({
      ...card,
      lifecycleStatus: "active",
      archivedAt: undefined,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError(`Failed to restore flashcard ${id}`, err);
  }
}
