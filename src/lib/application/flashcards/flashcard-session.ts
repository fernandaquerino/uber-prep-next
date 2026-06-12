import type { FlashcardRecord } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type {
  FlashcardSessionConfig,
  FlashcardSessionState,
  FlashcardStudyCard,
} from "@/lib/domain/flashcards";
import { getFlashcardLearningStateFromReview } from "@/lib/domain/flashcards";
import { isDueToday } from "@/lib/domain/flashcards/flashcard-selectors";
import type { ReviewRecord } from "@/types/database";

const SESSION_STORAGE_KEY = "uber-prep:flashcard-session";

function generateSessionId(): string {
  return `fsess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Convert a FlashcardRecord + optional ReviewRecord → FlashcardStudyCard */
function toStudyCard(card: FlashcardRecord, review: ReviewRecord | undefined): FlashcardStudyCard {
  return {
    flashcardId: card.id,
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags ?? [],
    learningState: getFlashcardLearningStateFromReview(review),
    cycleIndex: review?.cycleIndex ?? 0,
    daysOverdue: review
      ? isDueToday(review.scheduledFor, new Date().toISOString().slice(0, 10) as CalendarDate)
        ? Math.max(
            0,
            Math.floor(
              (new Date().getTime() - new Date(`${review.scheduledFor}T12:00:00Z`).getTime()) /
                86_400_000,
            ),
          )
        : 0
      : 0,
    reviewCount: review?.history.length ?? card.reviewCount ?? 0,
  };
}

/** Shuffle an array in place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export type BuildSessionInput = {
  config: FlashcardSessionConfig;
  cards: FlashcardRecord[];
  reviewsByCardId: Map<string, ReviewRecord>;
  today: CalendarDate;
};

/**
 * Build a FlashcardSessionState from the given config and data.
 */
export function buildFlashcardSession(input: BuildSessionInput): FlashcardSessionState {
  const { config, cards, reviewsByCardId, today } = input;

  let candidates = cards.filter((c) => c.lifecycleStatus !== "archived");

  // Filter by category
  if (config.category) {
    candidates = candidates.filter((c) => c.category === config.category);
  }

  // Filter by specific card IDs
  if (config.cardIds?.length) {
    const idSet = new Set(config.cardIds);
    candidates = candidates.filter((c) => idSet.has(c.id));
  }

  // Filter by session type
  if (config.type === "due") {
    candidates = candidates.filter((c) => {
      const review = reviewsByCardId.get(c.id);
      if (!review) return false; // new cards are not "due"
      return isDueToday(review.scheduledFor, today) && review.status !== "completed";
    });
  } else if (config.type === "new") {
    candidates = candidates.filter((c) => !reviewsByCardId.has(c.id));
  }

  // Shuffle if requested
  if (config.shuffle !== false) {
    candidates = shuffle(candidates);
  }

  // Apply limit
  const limited = config.limit ? candidates.slice(0, config.limit) : candidates;

  const studyCards = limited.map((card) => toStudyCard(card, reviewsByCardId.get(card.id)));

  return {
    sessionId: generateSessionId(),
    type: config.type,
    updateSpacedRep: config.updateSpacedRep,
    cards: studyCards,
    currentIndex: 0,
    answered: new Map(),
    startedAt: new Date().toISOString(),
    isRevealed: false,
  };
}

// ─── localStorage persistence ─────────────────────────────────────────────────

type PersistedSession = {
  sessionId: string;
  type: string;
  updateSpacedRep: boolean;
  cards: FlashcardStudyCard[];
  currentIndex: number;
  answered: [string, string][];
  startedAt: string;
  isRevealed: boolean;
};

export function saveSessionToStorage(session: FlashcardSessionState): void {
  try {
    const persisted: PersistedSession = {
      ...session,
      answered: Array.from(session.answered.entries()),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // localStorage may be unavailable in SSR
  }
}

export function loadSessionFromStorage(): FlashcardSessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedSession;
    return {
      ...data,
      type: data.type as FlashcardSessionState["type"],
      answered: new Map(data.answered as [string, import("@/types/database").ReviewResult][]),
    };
  } catch {
    return null;
  }
}

export function clearSessionFromStorage(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
