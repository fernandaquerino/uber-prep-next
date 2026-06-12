import type { FlashcardListItem, FlashcardLearningState } from "./flashcard.types";

export type FlashcardSortField = "nextReview" | "createdAt" | "updatedAt" | "front" | "category";

export type FlashcardSortDirection = "asc" | "desc";

export type FlashcardFilters = {
  query?: string;
  category?: string;
  learningState?: FlashcardLearningState;
  isDue?: boolean;
  includeArchived?: boolean;
  lifecycleStatus?: "active" | "archived";
  source?: string;
  tag?: string;
  sortField?: FlashcardSortField;
  sortDirection?: FlashcardSortDirection;
};

/** Apply all filters and sort to a list of FlashcardListItems */
export function applyFlashcardFilters(
  cards: FlashcardListItem[],
  filters: FlashcardFilters,
): FlashcardListItem[] {
  let result = [...cards];

  // Archive filter
  if (filters.lifecycleStatus) {
    result = result.filter((c) => c.lifecycleStatus === filters.lifecycleStatus);
  } else if (!filters.includeArchived) {
    result = result.filter((c) => c.lifecycleStatus !== "archived");
  }

  // Query filter: search in front, back (via searchable text), tags
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)),
    );
  }

  // Category
  if (filters.category) {
    result = result.filter((c) => c.category === filters.category);
  }

  // Learning state
  if (filters.learningState) {
    result = result.filter((c) => c.learningState === filters.learningState);
  }

  // Due filter
  if (filters.isDue === true) {
    result = result.filter((c) => c.isDueToday || c.daysOverdue > 0);
  }

  // Source
  if (filters.source) {
    result = result.filter((c) => c.source === filters.source);
  }

  // Tag
  if (filters.tag) {
    const tag = filters.tag.toLowerCase();
    result = result.filter((c) => c.tags.includes(tag));
  }

  // Sort
  const field = filters.sortField ?? "createdAt";
  const dir = filters.sortDirection ?? "desc";

  result.sort((a, b) => {
    let cmp = 0;
    if (field === "nextReview") {
      const aVal = a.nextReviewDate ?? "9999-99-99";
      const bVal = b.nextReviewDate ?? "9999-99-99";
      cmp = aVal.localeCompare(bVal);
    } else if (field === "front") {
      cmp = a.front.localeCompare(b.front, "pt-BR");
    } else if (field === "category") {
      cmp = a.category.localeCompare(b.category);
    } else {
      const aVal = a[field as "createdAt" | "updatedAt"] ?? "";
      const bVal = b[field as "createdAt" | "updatedAt"] ?? "";
      cmp = aVal.localeCompare(bVal);
    }
    return dir === "asc" ? cmp : -cmp;
  });

  return result;
}
