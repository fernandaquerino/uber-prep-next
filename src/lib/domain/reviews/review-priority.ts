import type { ReviewRecord } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewPriority } from "./review.types";
import { getDaysOverdue } from "./review-selectors";

/**
 * Priority rules (documented):
 *
 * critical — atraso > 7 dias, falhas repetidas (3+ again), travado com atraso > 3 dias
 * high     — atraso 3–7 dias, último resultado "again", baixa confiança (reason=low_confidence)
 * medium   — revisão devida hoje (atraso = 0), dificuldade alta (reason=high_difficulty/stuck)
 * low      — revisão futura (upcoming), manual sem atraso
 */
export function getReviewPriority(review: ReviewRecord, today: CalendarDate): ReviewPriority {
  const isFuture = (review.scheduledFor as CalendarDate) > today;
  if (isFuture) return "low";

  const daysOverdue = getDaysOverdue(review, today);
  const reason = review.reason;
  const lastResult = review.lastResult ?? review.lastRating;
  const failureCount = review.history.filter((h) => h.result === "again").length;

  if (daysOverdue > 7 || failureCount >= 3 || (reason === "stuck" && daysOverdue > 3)) {
    return "critical";
  }

  if (
    daysOverdue >= 3 ||
    lastResult === "again" ||
    reason === "low_confidence" ||
    reason === "failed_review"
  ) {
    return "high";
  }

  if (daysOverdue === 0 || reason === "high_difficulty" || reason === "stuck") {
    return "medium";
  }

  return "low";
}

const PRIORITY_ORDER: Record<ReviewPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function comparePriority(a: ReviewPriority, b: ReviewPriority): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

export const PRIORITY_LABELS: Record<ReviewPriority, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};
