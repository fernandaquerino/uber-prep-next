import type { FlashcardRecord } from "@/types/database";

/** Normalize text for duplicate comparison: lowercase, collapse whitespace, strip punctuation */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`#>~\[\]()]/g, " ") // strip markdown chars
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?'"]/g, "")
    .trim();
}

export type DuplicateCheckResult = {
  exactDuplicates: FlashcardRecord[];
  potentialDuplicates: FlashcardRecord[];
};

/**
 * Check for exact and potential duplicates before creating a flashcard.
 *
 * Exact: same normalized front + back + category
 * Potential: same normalized front (different answer or category)
 */
export function findPotentialDuplicateFlashcards(
  front: string,
  back: string,
  category: string,
  existing: FlashcardRecord[],
  excludeId?: string,
): DuplicateCheckResult {
  const normFront = normalizeForComparison(front);
  const normBack = normalizeForComparison(back);

  const candidates = existing.filter(
    (c) => c.lifecycleStatus !== "archived" && c.id !== excludeId,
  );

  const exactDuplicates: FlashcardRecord[] = [];
  const potentialDuplicates: FlashcardRecord[] = [];

  for (const card of candidates) {
    const cardFront = normalizeForComparison(card.front);
    const cardBack = normalizeForComparison(card.back);

    if (cardFront === normFront && cardBack === normBack && card.category === category) {
      exactDuplicates.push(card);
    } else if (cardFront === normFront) {
      potentialDuplicates.push(card);
    }
  }

  return { exactDuplicates, potentialDuplicates };
}
