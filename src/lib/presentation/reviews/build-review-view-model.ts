import type { ReviewTodayData } from "@/lib/application/reviews/get-review-today-data";
import type { ReviewQueueItem } from "@/lib/domain/reviews";
import { PRIORITY_LABELS } from "@/lib/domain/reviews";
import { REVIEW_CYCLE_LENGTH } from "@/lib/domain/reviews";
import { getCategoryLabel, getBlockTypeLabel } from "@/lib/presentation/category-visuals";
import {
  formatCalendarDate,
  formatMinutes,
  formatWeekdayLabel,
} from "@/components/features/plan/plan-utils";
import type {
  ReviewTodayViewModel,
  ReviewQueueItemViewModel,
  ReviewSummaryViewModel,
  NextStudyPreviewViewModel,
  LearningJournalViewModel,
  WeeklyReflectionViewModel,
  ReviewSessionViewModel,
  ReviewHeaderViewModel,
} from "./review-view-model";
import type { ReviewResult } from "@/types/database";

// ─── Reason labels ────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  completed_plan_block: "Revisão prevista após conclusão.",
  marked_manually: "Marcado manualmente para revisão.",
  stuck: "Você travou neste conteúdo.",
  low_confidence: "Confiança baixa registrada ao concluir.",
  high_difficulty: "Dificuldade alta registrada ao concluir.",
  failed_review: "Resultado anterior foi 'Não lembrei'.",
  future_flashcard: "Flashcard aguardando revisão.",
  future_quiz: "Quiz com erro aguardando revisão.",
  future_mock_gap: "Gap identificado em mock.",
};

function getReasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? reason;
}

// ─── Result labels ────────────────────────────────────────────────────────────

const RESULT_LABELS: Record<ReviewResult, string> = {
  again: "Não lembrei",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildOverdueLabel(daysOverdue: number): string {
  if (daysOverdue === 0) return "Devida hoje";
  if (daysOverdue === 1) return "1 dia de atraso";
  return `${daysOverdue} dias de atraso`;
}

function buildCycleLabel(cycleIndex: number): string {
  if (cycleIndex >= REVIEW_CYCLE_LENGTH) return "Ciclo concluído";
  return `Ciclo ${cycleIndex + 1} de ${REVIEW_CYCLE_LENGTH}`;
}

// ─── Sub-builders ─────────────────────────────────────────────────────────────

function buildQueueItem(item: ReviewQueueItem): ReviewQueueItemViewModel {
  return {
    reviewId: item.reviewId,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    title: item.title,
    category: item.category,
    categoryLabel: item.category ? getCategoryLabel(item.category) : undefined,
    type: item.type,
    typeLabel: item.type ? getBlockTypeLabel(item.type) : undefined,
    scheduledFor: item.scheduledFor,
    scheduledForFormatted: formatCalendarDate(item.scheduledFor, "long"),
    daysOverdue: item.daysOverdue,
    overdueLabel: buildOverdueLabel(item.daysOverdue),
    timingStatus: item.timingStatus,
    reason: item.reason,
    reasonLabel: getReasonLabel(String(item.reason)),
    priority: item.priority,
    priorityLabel: PRIORITY_LABELS[item.priority],
    cycleIndex: item.cycleIndex,
    cycleLabel: buildCycleLabel(item.cycleIndex),
    estimatedMinutes: item.estimatedMinutes,
    durationFormatted: item.estimatedMinutes ? formatMinutes(item.estimatedMinutes) : undefined,
    lastResult: item.lastResult,
    lastResultLabel: item.lastResult ? RESULT_LABELS[item.lastResult] : undefined,
  };
}

function buildSummary(data: ReviewTodayData): ReviewSummaryViewModel {
  const { summary } = data;
  const total = summary.dueToday + summary.overdue;

  const parts: string[] = [formatCalendarDate(data.today, "long")];
  if (total > 0) parts.push(`${total} revisão${total !== 1 ? "ões" : ""}`);
  if (summary.overdue > 0)
    parts.push(`${summary.overdue} atrasada${summary.overdue !== 1 ? "s" : ""}`);
  if (summary.estimatedMinutes > 0)
    parts.push(`${formatMinutes(summary.estimatedMinutes)} estimados`);

  return {
    ...summary,
    durationFormatted: formatMinutes(summary.estimatedMinutes),
    headerSubtitle: parts.join(" · "),
  };
}

function buildNextStudy(data: ReviewTodayData): NextStudyPreviewViewModel | null {
  const { nextStudy } = data;
  if (!nextStudy) return null;

  const sectionTitle = nextStudy.isTomorrow ? "O que estudar amanhã" : "Próximo dia de estudo";

  return {
    date: nextStudy.date,
    dateLabel: formatCalendarDate(nextStudy.date, "long"),
    weekdayLabel: formatWeekdayLabel(
      nextStudy.weekdayLabel as Parameters<typeof formatWeekdayLabel>[0],
    ),
    sectionTitle,
    isTomorrow: nextStudy.isTomorrow,
    items: nextStudy.items.map((i) => ({
      blockId: i.blockId,
      title: i.title,
      category: i.category,
      categoryLabel: getCategoryLabel(i.category),
      type: i.type,
      typeLabel: getBlockTypeLabel(i.type),
      estimatedMinutes: i.estimatedMinutes,
      durationFormatted: formatMinutes(i.estimatedMinutes),
    })),
    estimatedMinutes: nextStudy.estimatedMinutes,
    durationFormatted: formatMinutes(nextStudy.estimatedMinutes),
  };
}

function buildJournal(data: ReviewTodayData): LearningJournalViewModel {
  const j = data.journal;
  return {
    id: j?.id ?? `journal:${data.today}`,
    date: data.today,
    dateLabel: formatCalendarDate(data.today, "long"),
    content: j?.content ?? "",
    wins: j?.wins ?? "",
    blockers: j?.blockers ?? "",
    hasContent: !!(j?.content || j?.wins || j?.blockers),
  };
}

function buildReflection(data: ReviewTodayData): WeeklyReflectionViewModel {
  const r = data.weeklyReflection;
  const wn = data.currentWeekNumber;
  return {
    id: r?.id ?? `reflection:week-${wn}`,
    weekNumber: wn,
    weekLabel: `Semana ${wn} de ${data.totalWeeks}`,
    content: r?.content ?? "",
    wins: r?.wins ?? "",
    blockers: r?.blockers ?? "",
    whatWorked: (r as Record<string, string> | null)?.whatWorked ?? "",
    whatToAdjust: (r as Record<string, string> | null)?.whatToAdjust ?? "",
    hasContent: !!(r?.content || r?.wins || r?.blockers),
    canGoToPrevious: wn > 1,
    canGoToNext: wn < data.totalWeeks,
    updatedAt: r?.updatedAt,
  };
}

function buildSession(queue: ReviewQueueItemViewModel[]): ReviewSessionViewModel {
  return {
    isActive: false,
    currentIndex: 0,
    total: queue.length,
    progressLabel: queue.length === 0 ? "Sem revisões" : `0 de ${queue.length}`,
    progressPercentage: 0,
  };
}

function buildHeader(data: ReviewTodayData): ReviewHeaderViewModel {
  const total = data.summary.dueToday + data.summary.overdue;
  return {
    todayFormatted: formatCalendarDate(data.today, "long"),
    subtitle:
      total === 0
        ? "Nenhuma revisão pendente para hoje."
        : `${total} revisão${total !== 1 ? "ões" : ""} pendente${total !== 1 ? "s" : ""}`,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildReviewTodayViewModel(data: ReviewTodayData): ReviewTodayViewModel {
  const queue = data.queue.map(buildQueueItem);

  return {
    header: buildHeader(data),
    summary: buildSummary(data),
    queue,
    session: buildSession(queue),
    nextStudy: buildNextStudy(data),
    journal: buildJournal(data),
    reflection: buildReflection(data),
  };
}

export const RESULT_LABELS_MAP = {
  again: "Não lembrei",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
} satisfies Record<ReviewResult, string>;
