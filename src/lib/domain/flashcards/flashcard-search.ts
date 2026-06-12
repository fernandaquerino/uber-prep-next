import type { FlashcardListItem } from "./flashcard.types";

/**
 * Simple text search across front, back, and tags.
 * Returns items that match ALL space-separated tokens.
 */
export function searchFlashcards(cards: FlashcardListItem[], query: string): FlashcardListItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return cards;

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  return cards.filter((card) => {
    const text = [card.front, card.back, ...card.tags].join(" ").toLowerCase();
    return tokens.every((token) => text.includes(token));
  });
}
