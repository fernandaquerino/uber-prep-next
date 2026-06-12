import type { UberPrepDatabase } from "@/lib/db/schema";
import type { FlashcardRecord, FlashcardSource } from "@/types/database";
import { validateFlashcardInput, normalizeTags } from "@/lib/domain/flashcards";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `fc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type CreateFlashcardInput = {
  front: string;
  back: string;
  category: string;
  tags?: string[];
  source?: FlashcardSource;
  sourceId?: string;
};

export async function createFlashcard(
  db: UberPrepDatabase,
  input: CreateFlashcardInput,
): Promise<string> {
  const errors = validateFlashcardInput({
    front: input.front,
    back: input.back,
    category: input.category,
    tags: input.tags ?? [],
  });
  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  try {
    const now = new Date().toISOString();
    const id = generateId();

    const record: FlashcardRecord = {
      id,
      front: input.front.trim(),
      back: input.back.trim(),
      category: input.category,
      tags: normalizeTags(input.tags ?? []),
      status: "pending",
      lifecycleStatus: "active",
      source: input.source ?? "user",
      sourceId: input.sourceId,
      nextReview: null,
      knownAt: null,
      lastReviewedAt: null,
      reviewCount: 0,
      reviews: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.flashcards.put(record);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to create flashcard", err);
  }
}
