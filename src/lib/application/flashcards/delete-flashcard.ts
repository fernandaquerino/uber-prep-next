import type { UberPrepDatabase } from "@/lib/db/schema";
import { flashcardReviewId } from "./answer-flashcard";
import { DatabaseError } from "@/lib/db/errors";

/**
 * Permanently delete a flashcard and its review record.
 * Only call this after confirming with the user.
 */
export async function deleteFlashcard(db: UberPrepDatabase, id: string): Promise<void> {
  const card = await db.flashcards.get(id);
  if (!card) throw new Error(`Flashcard not found: ${id}`);

  try {
    await db.flashcards.delete(id);
    await db.reviews.delete(flashcardReviewId(id));
  } catch (err) {
    throw new DatabaseError(`Failed to delete flashcard ${id}`, err);
  }
}
