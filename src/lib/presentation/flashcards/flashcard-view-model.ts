import type { ReviewResult } from "@/types/database";
import type { FlashcardLearningState } from "@/lib/domain/flashcards";

export type FlashcardViewModel = {
  id: string;
  front: string;
  back: string;
  category: string;
  categoryLabel: string;
  categoryBadge: string;
  tags: string[];
  learningState: FlashcardLearningState;
  learningStateLabel: string;
  learningStateBadge: string;
  nextReviewDate: string | null;
  nextReviewFormatted: string;
  daysOverdue: number;
  overdueLabel: string;
  isDueToday: boolean;
  reviewCount: number;
  lastResult?: ReviewResult;
  lastResultLabel?: string;
  source: string;
  lifecycleStatus: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type FlashcardSummaryViewModel = {
  total: number;
  active: number;
  archived: number;
  due: number;
  newCards: number;
  learning: number;
  reviewing: number;
  mastered: number;
  hasData: boolean;
};

export type FlashcardStudyCardViewModel = {
  flashcardId: string;
  front: string;
  back: string;
  category: string;
  categoryLabel: string;
  categoryBadge: string;
  learningState: FlashcardLearningState;
  learningStateLabel: string;
  tags: string[];
  daysOverdue: number;
  cycleIndex: number;
  reviewCount: number;
  isRevealed: boolean;
  position: number;
  total: number;
};

export type FlashcardSessionSummaryViewModel = {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  againPercent: number;
  goodPlusEasyPercent: number;
  durationFormatted: string;
};
