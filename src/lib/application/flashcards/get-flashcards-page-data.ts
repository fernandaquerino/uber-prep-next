import type { UberPrepDatabase } from "@/lib/db/schema";
import type { CalendarDate } from "@/lib/domain/schedule";
import { buildFlashcardListItem } from "@/lib/domain/flashcards/flashcard-selectors";
import type { FlashcardListItem } from "@/lib/domain/flashcards";
import type { ReviewRecord } from "@/types/database";

export type FlashcardsPageData = {
  allCards: FlashcardListItem[];
  dueCount: number;
  newCount: number;
  masteredCount: number;
  allTags: string[];
  reviewsByCardId: Map<string, ReviewRecord>;
};

/**
 * Load all data needed for the /flashcards page.
 * Active cards only by default; archived loaded separately on demand.
 */
export async function getFlashcardsPageData(
  db: UberPrepDatabase,
  today: CalendarDate,
): Promise<FlashcardsPageData> {
  const [cards, flashcardReviews] = await Promise.all([
    db.flashcards.toArray(),
    db.reviews.where("sourceType").equals("flashcard").toArray(),
  ]);

  const reviewsByCardId = new Map<string, ReviewRecord>();
  for (const review of flashcardReviews) {
    if (!reviewsByCardId.has(review.sourceId)) {
      reviewsByCardId.set(review.sourceId, review);
    }
  }

  const allCards = cards.map((card) =>
    buildFlashcardListItem(card, reviewsByCardId.get(card.id), today),
  );

  const activeCards = allCards.filter((c) => c.lifecycleStatus === "active");

  const dueCount = activeCards.filter((c) => c.isDueToday || c.daysOverdue > 0).length;

  const newCount = activeCards.filter((c) => c.learningState === "new").length;
  const masteredCount = activeCards.filter((c) => c.learningState === "mastered").length;

  const tagSet = new Set<string>();
  for (const card of activeCards) {
    for (const tag of card.tags) tagSet.add(tag);
  }

  return {
    allCards,
    dueCount,
    newCount,
    masteredCount,
    allTags: Array.from(tagSet).sort(),
    reviewsByCardId,
  };
}
