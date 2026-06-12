import type { UberPrepDatabase } from "@/lib/db/schema";
import { validateFlashcardInput, normalizeTags } from "@/lib/domain/flashcards";
import { DatabaseError } from "@/lib/db/errors";

export type UpdateFlashcardInput = {
  id: string;
  front?: string;
  back?: string;
  category?: string;
  tags?: string[];
};

export async function updateFlashcard(
  db: UberPrepDatabase,
  input: UpdateFlashcardInput,
): Promise<void> {
  const card = await db.flashcards.get(input.id);
  if (!card) throw new Error(`Flashcard not found: ${input.id}`);

  const errors = validateFlashcardInput({
    front: input.front,
    back: input.back,
    category: input.category,
    tags: input.tags,
  });
  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  try {
    const now = new Date().toISOString();
    await db.flashcards.put({
      ...card,
      front: input.front?.trim() ?? card.front,
      back: input.back?.trim() ?? card.back,
      category: input.category ?? card.category,
      tags: input.tags !== undefined ? normalizeTags(input.tags) : card.tags,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError(`Failed to update flashcard ${input.id}`, err);
  }
}
