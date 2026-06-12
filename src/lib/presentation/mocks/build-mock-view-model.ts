import type {
  MockRecord,
  MockEvidence,
  StarAnswer,
  SystemDesignDraft,
  FullInterviewSession,
  FullInterviewStep,
  ChecklistSession,
} from "@/types/database";
import type {
  MockListItemVM,
  MockDetailVM,
  MockRubricVM,
  MockRubricCriterionVM,
  MockEvidenceVM,
  MocksSummaryVM,
  StarQuestionVM,
  StarAnswerVM,
  SystemDesignTemplateVM,
  FullInterviewSessionVM,
  ChecklistSessionVM,
  ChecklistGroupVM,
  Badge,
} from "./mock-view-model";
import {
  getMockTypeLabel,
  MOCK_STATUS_LABELS,
  RUBRIC_RATING_LABELS,
} from "@/lib/domain/mocks/mock.types";
import { scoreToBadge } from "@/lib/domain/mocks/mock-score";
import type { SystemDesignTemplateData } from "@/lib/data/system-design-templates";
import type { StarQuestion } from "@/lib/data/star-questions";
import { DEFAULT_CHECKLIST_GROUPS } from "@/lib/data/mock-checklists";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: MockRecord["status"]): Badge {
  const labelMap: Record<string, string> = {
    draft: "Rascunho",
    in_progress: "Em andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  const variantMap: Record<string, Badge["variant"]> = {
    draft: "outline",
    in_progress: "secondary",
    completed: "default",
    cancelled: "destructive",
  };
  const label = labelMap[status] ?? status;
  const variant = variantMap[status] ?? "outline";
  return { label, variant };
}

function formatDuration(seconds: number | undefined): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  return `há ${Math.floor(diffDays / 30)} meses`;
}

// ── Mock list item ────────────────────────────────────────────────────────────

export function buildMockListItemVM(mock: MockRecord, evidence: MockEvidence[]): MockListItemVM {
  const mockEvidence = evidence.filter((e) => e.mockId === mock.id);
  const gapCount = mockEvidence.filter((e) => e.kind === "gap").length;
  const strengthCount = mockEvidence.filter((e) => e.kind === "strength").length;

  const score = (mock.score ?? mock.rubricResult) ? (mock.score ?? null) : null;

  return {
    id: mock.id,
    title: mock.title ?? getMockTypeLabel(mock.type),
    typeLabel: getMockTypeLabel(mock.type),
    statusLabel: MOCK_STATUS_LABELS[mock.status as keyof typeof MOCK_STATUS_LABELS] ?? mock.status,
    statusBadge: statusBadge(mock.status),
    scoreBadge: scoreToBadge(score),
    date: mock.date,
    dateLabel: formatRelativeDate(mock.date),
    hasAudio: mock.hasAudio ?? false,
    hasRubric: !!mock.rubricResult,
    evidenceCount: mockEvidence.length,
    gapCount,
    strengthCount,
  };
}

// ── Mock detail ───────────────────────────────────────────────────────────────

export function buildMockDetailVM(
  mock: MockRecord,
  evidence: MockEvidence[],
  reviewedGapIds: Set<string>,
): MockDetailVM {
  const rubric = mock.rubricResult ? buildMockRubricVM(mock) : null;

  const mockEvidence: MockEvidenceVM[] = evidence
    .filter((e) => e.mockId === mock.id)
    .map((e) => ({
      id: e.id,
      area: e.area,
      kind: e.kind,
      kindLabel: e.kind === "gap" ? "Gap" : "Ponto forte",
      description: e.description,
      confidence: e.confidence,
      hasReview: reviewedGapIds.has(e.id),
    }));

  return {
    id: mock.id,
    title: mock.title ?? getMockTypeLabel(mock.type),
    typeLabel: getMockTypeLabel(mock.type),
    statusLabel: MOCK_STATUS_LABELS[mock.status as keyof typeof MOCK_STATUS_LABELS] ?? mock.status,
    statusBadge: statusBadge(mock.status),
    date: mock.date,
    prompt: mock.prompt ?? mock.question ?? "",
    response: mock.response ?? mock.solution ?? "",
    feedback: mock.feedback ?? "",
    strengths: mock.strengths ?? [],
    weaknesses: mock.weaknesses ?? [],
    nextSteps: mock.nextSteps ?? [],
    scoreBadge: scoreToBadge(mock.score ?? null),
    rubricResult: rubric,
    evidence: mockEvidence,
    hasAudio: mock.hasAudio ?? false,
    audioRecordingId: mock.audioRecordingId ?? null,
    durationLabel: formatDuration(mock.durationSeconds),
  };
}

function buildMockRubricVM(mock: MockRecord): MockRubricVM | null {
  if (!mock.rubricResult) return null;

  const criteria: MockRubricCriterionVM[] = mock.rubricResult.criteria.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description ?? "",
    rating: c.rating,
    ratingLabel:
      RUBRIC_RATING_LABELS[c.rating as keyof typeof RUBRIC_RATING_LABELS] ?? String(c.rating),
    isEvaluated: c.rating !== 0,
  }));

  const evaluated = criteria.filter((c) => c.isEvaluated);
  const scorePercent =
    evaluated.length > 0
      ? Math.round((evaluated.reduce((s, c) => s + c.rating, 0) / evaluated.length / 5) * 100)
      : null;

  return {
    definitionId: mock.rubricResult.rubricDefinitionId,
    version: mock.rubricResult.version,
    criteria,
    scorePercent,
    evaluatedCount: evaluated.length,
    totalCount: criteria.length,
  };
}

// ── Summary stats ─────────────────────────────────────────────────────────────

export function buildMocksSummaryVM(mocks: MockRecord[], evidence: MockEvidence[]): MocksSummaryVM {
  const completed = mocks.filter((m) => m.status === "completed");
  const scores = completed.map((m) => m.score).filter((s): s is number => typeof s === "number");

  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 14);
  const recentGapCount = evidence.filter(
    (e) => e.kind === "gap" && new Date(e.createdAt) > recentCutoff,
  ).length;

  const sorted = [...mocks].sort((a, b) => b.date.localeCompare(a.date));
  const lastMockDate = sorted[0]?.date ?? null;

  return {
    totalMocks: mocks.length,
    completedMocks: completed.length,
    avgScore,
    avgScoreLabel: avgScore !== null ? `${avgScore}%` : "Sem dados",
    recentGapCount,
    lastMockDate,
    lastMockDateLabel: lastMockDate ? formatRelativeDate(lastMockDate) : "Nunca",
  };
}

// ── STAR ──────────────────────────────────────────────────────────────────────

export function buildStarQuestionVM(
  question: StarQuestion,
  answer: StarAnswer | null,
): StarQuestionVM {
  return {
    id: question.id,
    category: question.category,
    categoryLabel: question.categoryLabel,
    question: question.question,
    hasAnswer: !!answer,
    selfRating: answer?.selfRating ?? null,
    selfRatingLabel: answer?.selfRating
      ? (RUBRIC_RATING_LABELS[answer.selfRating as keyof typeof RUBRIC_RATING_LABELS] ?? "")
      : "Não avaliado",
    answeredAt: answer?.updatedAt ?? null,
  };
}

export function buildStarAnswerVM(questionId: string, answer: StarAnswer): StarAnswerVM {
  return {
    id: answer.id,
    questionId,
    situation: answer.situation,
    task: answer.task,
    action: answer.action,
    result: answer.result,
    learning: answer.learning ?? "",
    conciseVersion: answer.conciseVersion ?? "",
    englishVersion: answer.englishVersion ?? "",
    selfRating: answer.selfRating ?? null,
    selfRatingLabel: answer.selfRating
      ? (RUBRIC_RATING_LABELS[answer.selfRating as keyof typeof RUBRIC_RATING_LABELS] ?? "")
      : "Não avaliado",
    hasAudio: !!answer.audioRecordingId,
    audioRecordingId: answer.audioRecordingId ?? null,
    durationLabel: formatDuration(answer.durationSeconds),
    updatedAt: answer.updatedAt,
  };
}

// ── System Design ─────────────────────────────────────────────────────────────

export function buildSystemDesignTemplateVM(
  template: SystemDesignTemplateData,
  draft: SystemDesignDraft | null,
): SystemDesignTemplateVM {
  const filledSections = template.sections.filter((s) => draft?.answers[s.id]?.trim()).length;
  const draftProgress =
    template.sections.length > 0
      ? Math.round((filledSections / template.sections.length) * 100)
      : 0;

  return {
    id: template.id,
    title: template.title,
    description: template.description,
    difficulty: template.difficulty,
    estimatedMinutes: 45,
    sectionCount: template.sections.length,
    checklistCount: template.checklist.length,
    hasDraft: !!draft,
    draftProgress,
    linkedMockId: draft?.linkedMockId ?? null,
  };
}

// ── Full Interview ────────────────────────────────────────────────────────────

const STEP_TYPE_LABELS: Record<string, string> = {
  coding: "Coding",
  system_design: "System Design",
  behavioral: "Behavioral",
  reflection: "Reflexão",
};

export function buildFullInterviewSessionVM(
  session: FullInterviewSession,
  steps: FullInterviewStep[],
): FullInterviewSessionVM {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  const currentStep = steps.find((s) => s.order === session.currentStepIndex);

  return {
    id: session.id,
    title: session.title,
    statusLabel:
      MOCK_STATUS_LABELS[session.status as keyof typeof MOCK_STATUS_LABELS] ?? session.status,
    statusBadge: statusBadge(session.status as MockRecord["status"]),
    stepCount: steps.length,
    completedSteps,
    currentStepIndex: session.currentStepIndex,
    currentStepTypeLabel: currentStep
      ? (STEP_TYPE_LABELS[currentStep.type] ?? currentStep.type)
      : "",
    progressPercent,
    startedAt: session.startedAt ?? null,
    completedAt: session.completedAt ?? null,
  };
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export function buildChecklistSessionVM(session: ChecklistSession): ChecklistSessionVM {
  const groupMap = new Map<string, ChecklistGroupVM>();

  for (const group of DEFAULT_CHECKLIST_GROUPS) {
    groupMap.set(group.id, {
      id: group.id,
      label: group.label,
      items: [],
      completedCount: 0,
      totalCount: 0,
      isComplete: false,
    });
  }

  for (const item of session.items) {
    let group = groupMap.get(item.group);
    if (!group) {
      group = {
        id: item.group,
        label: item.group,
        items: [],
        completedCount: 0,
        totalCount: 0,
        isComplete: false,
      };
      groupMap.set(item.group, group);
    }

    group.items.push({
      id: item.id,
      text: item.text,
      isCustom: item.isCustom,
      checked: item.checked,
      checkedAt: item.checkedAt ?? null,
    });
    group.totalCount += 1;
    if (item.checked) group.completedCount += 1;
  }

  const groups = Array.from(groupMap.values()).map((g) => ({
    ...g,
    isComplete: g.totalCount > 0 && g.completedCount === g.totalCount,
  }));

  const progressPercent =
    session.totalCount > 0 ? Math.round((session.completedCount / session.totalCount) * 100) : 0;

  return {
    id: session.id,
    label: session.label ?? null,
    groups,
    completedCount: session.completedCount,
    totalCount: session.totalCount,
    progressPercent,
    isComplete: session.completedCount === session.totalCount && session.totalCount > 0,
    createdAt: session.createdAt,
  };
}
