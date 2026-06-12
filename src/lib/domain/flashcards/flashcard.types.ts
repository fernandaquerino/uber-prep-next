import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewResult } from "@/types/database";

/**
 * Learning state derived from ReviewRecord history.
 * Never stored on the FlashcardRecord itself.
 *
 * Rules (documented):
 *   new       — no ReviewRecord exists for this flashcard (sourceType="flashcard")
 *   learning  — cycleIndex <= 1, OR last result was "again"
 *   reviewing — cycleIndex 2–3
 *   mastered  — cycleIndex >= 4 (cycle nearly or fully completed)
 */
export type FlashcardLearningState = "new" | "learning" | "reviewing" | "mastered";

export type FlashcardCreateInput = {
  front: string;
  back: string;
  category: string;
  tags: string[];
  source?: import("@/types/database").FlashcardSource;
  sourceId?: string;
};

export type FlashcardUpdateInput = {
  id: string;
  front?: string;
  back?: string;
  category?: string;
  tags?: string[];
};

/** A review record summary for learning state calculation */
export type FlashcardReviewSummary = {
  cycleIndex: number;
  lastResult?: ReviewResult;
  historyLength: number;
};

export type FlashcardListItem = {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  source: import("@/types/database").FlashcardSource;
  lifecycleStatus: import("@/types/database").FlashcardLifecycleStatus;
  sourceId?: string;
  learningState: FlashcardLearningState;
  nextReviewDate: CalendarDate | null;
  daysOverdue: number;
  isDueToday: boolean;
  reviewCount: number;
  lastResult?: ReviewResult;
  createdAt: string;
  updatedAt: string;
};

/** Session types */
export type FlashcardSessionType = "due" | "new" | "filtered" | "free_practice";

export type FlashcardSessionConfig = {
  type: FlashcardSessionType;
  limit?: number;
  category?: string;
  shuffle?: boolean;
  /** If true, results update spaced repetition. If false (free practice), they don't. */
  updateSpacedRep: boolean;
  cardIds?: string[];
};

export type FlashcardStudyCard = {
  flashcardId: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  learningState: FlashcardLearningState;
  cycleIndex: number;
  daysOverdue: number;
  reviewCount: number;
};

export type FlashcardSessionState = {
  sessionId: string;
  type: FlashcardSessionType;
  updateSpacedRep: boolean;
  cards: FlashcardStudyCard[];
  currentIndex: number;
  answered: Map<string, ReviewResult>;
  startedAt: string;
  isRevealed: boolean;
};

export type FlashcardSessionResult = {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  completedAt: string;
  durationMs: number;
};

export type DifficultFlashcard = {
  flashcardId: string;
  front: string;
  score: number;
  reasons: string[];
};
