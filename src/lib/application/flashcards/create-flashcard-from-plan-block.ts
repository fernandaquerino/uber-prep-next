import type { UberPrepDatabase } from "@/lib/db/schema";
import { findBlockInPlan } from "@/lib/application/reviews/review-use-cases";
import { createFlashcard } from "./create-flashcard";
import type { FlashcardCreateInput } from "@/lib/domain/flashcards";

function categoryFromPlanBlock(category: string): string {
  // Map plan block categories to flashcard categories
  const MAP: Record<string, string> = {
    algo: "algo",
    javascript: "js",
    js: "js",
    react: "react",
    system_design: "system",
    fe_coding: "fe_coding",
    mock: "mock",
    behavioral: "behavioral",
    english: "english",
  };
  return MAP[category] ?? "general";
}

export type CreateFlashcardFromBlockInput = Omit<FlashcardCreateInput, "source" | "sourceId"> & {
  blockId: string;
};

/**
 * Create a flashcard linked to a plan block.
 * The plan block becomes the sourceId so the card can be traced back.
 */
export async function createFlashcardFromPlanBlock(
  db: UberPrepDatabase,
  input: CreateFlashcardFromBlockInput,
): Promise<string> {
  const block = findBlockInPlan(input.blockId);

  return createFlashcard(db, {
    front: input.front,
    back: input.back,
    category: input.category ?? (block ? categoryFromPlanBlock(block.category) : "general"),
    tags: input.tags,
    source: "plan",
    sourceId: input.blockId,
  });
}
