import type { CalendarDate } from "@/lib/domain/schedule";
import type { FlashcardListItem } from "@/lib/domain/flashcards";
import { LEARNING_STATE_LABELS } from "@/lib/domain/flashcards";
import { getCategoryLabel, getCategoryVisual } from "@/lib/presentation/category-visuals";
import type {
  FlashcardViewModel,
  FlashcardSummaryViewModel,
  FlashcardStudyCardViewModel,
  FlashcardSessionSummaryViewModel,
} from "./flashcard-view-model";
import type { FlashcardStudyCard, FlashcardSessionResult } from "@/lib/domain/flashcards";

const LAST_RESULT_LABELS: Record<string, string> = {
  again: "Errei / Travei",
  hard: "Difícil",
  good: "Sabia",
  easy: "Fácil",
};

const LEARNING_STATE_BADGES: Record<string, string> = {
  new: "bg-muted text-muted-foreground border-border",
  learning: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  reviewing: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  mastered: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
};

function formatNextReview(date: string | null, today: CalendarDate): string {
  if (!date) return "—";
  if (date < today) {
    const diff = Math.round(
      (new Date(`${today}T12:00:00Z`).getTime() - new Date(`${date}T12:00:00Z`).getTime()) /
        86_400_000,
    );
    return diff === 1 ? "Ontem" : `Há ${diff} dias`;
  }
  if (date === today) return "Hoje";
  const diff = Math.round(
    (new Date(`${date}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) /
      86_400_000,
  );
  if (diff === 1) return "Amanhã";
  if (diff <= 7) return `Em ${diff} dias`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

function formatOverdue(daysOverdue: number): string {
  if (daysOverdue === 0) return "";
  if (daysOverdue === 1) return "1 dia atrasado";
  return `${daysOverdue} dias atrasado`;
}

export function buildFlashcardViewModel(
  item: FlashcardListItem,
  today: CalendarDate,
): FlashcardViewModel {
  const visual = getCategoryVisual(item.category);
  return {
    id: item.id,
    front: item.front,
    back: item.back,
    category: item.category,
    categoryLabel: getCategoryLabel(item.category),
    categoryBadge: visual.badge,
    tags: item.tags,
    learningState: item.learningState,
    learningStateLabel: LEARNING_STATE_LABELS[item.learningState],
    learningStateBadge: LEARNING_STATE_BADGES[item.learningState] ?? LEARNING_STATE_BADGES.new!,
    nextReviewDate: item.nextReviewDate,
    nextReviewFormatted: formatNextReview(item.nextReviewDate, today),
    daysOverdue: item.daysOverdue,
    overdueLabel: formatOverdue(item.daysOverdue),
    isDueToday: item.isDueToday,
    reviewCount: item.reviewCount,
    lastResult: item.lastResult,
    lastResultLabel: item.lastResult ? LAST_RESULT_LABELS[item.lastResult] : undefined,
    source: item.source,
    lifecycleStatus: item.lifecycleStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function buildFlashcardSummaryViewModel(
  items: FlashcardListItem[],
): FlashcardSummaryViewModel {
  const active = items.filter((c) => c.lifecycleStatus === "active");
  const archived = items.filter((c) => c.lifecycleStatus === "archived");

  return {
    total: items.length,
    active: active.length,
    archived: archived.length,
    due: active.filter((c) => c.isDueToday || c.daysOverdue > 0).length,
    newCards: active.filter((c) => c.learningState === "new").length,
    learning: active.filter((c) => c.learningState === "learning").length,
    reviewing: active.filter((c) => c.learningState === "reviewing").length,
    mastered: active.filter((c) => c.learningState === "mastered").length,
    hasData: items.length > 0,
  };
}

export function buildFlashcardStudyCardViewModel(
  card: FlashcardStudyCard,
  isRevealed: boolean,
  position: number,
  total: number,
): FlashcardStudyCardViewModel {
  const visual = getCategoryVisual(card.category);
  return {
    flashcardId: card.flashcardId,
    front: card.front,
    back: card.back,
    category: card.category,
    categoryLabel: getCategoryLabel(card.category),
    categoryBadge: visual.badge,
    learningState: card.learningState,
    learningStateLabel: LEARNING_STATE_LABELS[card.learningState],
    tags: card.tags,
    daysOverdue: card.daysOverdue,
    cycleIndex: card.cycleIndex,
    reviewCount: card.reviewCount,
    isRevealed,
    position,
    total,
  };
}

export function buildSessionSummaryViewModel(
  result: FlashcardSessionResult,
): FlashcardSessionSummaryViewModel {
  const goodAndEasy = result.good + result.easy;
  const durationSeconds = Math.round(result.durationMs / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationFormatted =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return {
    total: result.total,
    again: result.again,
    hard: result.hard,
    good: result.good,
    easy: result.easy,
    againPercent: result.total > 0 ? Math.round((result.again / result.total) * 100) : 0,
    goodPlusEasyPercent: result.total > 0 ? Math.round((goodAndEasy / result.total) * 100) : 0,
    durationFormatted,
  };
}
