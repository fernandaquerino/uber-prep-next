import type {
  FlashcardRecord,
  MockEvidence,
  NoteRecord,
  PlanProgressRecord,
  PlaygroundSolutionRecord,
  QuizAnswerRecord,
  QuizQuestionRecord,
  ResourceProgressRecord,
  ResourceRecord,
  ReviewRecord,
  TechnicalEnglishPracticeRecord,
  TechnicalEnglishRecord,
  TimerSessionRecord,
} from "@/types/database";
import type { StudyPlan } from "@/lib/domain/schedule";
import {
  getSkillTopic,
  inferSkillTopicIds,
  normalizeSkillArea,
  type SkillAreaId,
} from "@/lib/data/skill-topics";
import type { EvidenceKind, EvidenceRecord, EvidenceSource } from "./analytics.types";

export type EvidenceSourceData = {
  plan: StudyPlan;
  planProgress: PlanProgressRecord[];
  reviews: ReviewRecord[];
  flashcards: FlashcardRecord[];
  quizQuestions: QuizQuestionRecord[];
  quizAnswers: QuizAnswerRecord[];
  playgroundSolutions: PlaygroundSolutionRecord[];
  timerSessions: TimerSessionRecord[];
  mockEvidence: MockEvidence[];
  notes: NoteRecord[];
  resources: ResourceRecord[];
  resourceProgress: ResourceProgressRecord[];
  technicalEnglishItems: TechnicalEnglishRecord[];
  technicalEnglishPractices: TechnicalEnglishPracticeRecord[];
};

type TopicContext = {
  category: SkillAreaId;
  topicIds: string[];
  label: string;
};

function addEvidence(
  target: EvidenceRecord[],
  input: Omit<EvidenceRecord, "topicId"> & { topicIds?: string[] },
): void {
  const topicIds = input.topicIds?.length ? input.topicIds : [undefined];
  for (const topicId of topicIds) {
    target.push({
      id: topicId ? `${input.id}:${topicId}` : input.id,
      source: input.source,
      sourceId: input.sourceId,
      category: input.category,
      topicId,
      kind: input.kind,
      value: input.value,
      weight: input.weight,
      occurredAt: input.occurredAt,
      description: input.description,
    });
  }
}

function contextFromValues(category: string | undefined, values: string[]): TopicContext | null {
  const inferredArea = normalizeSkillArea(category);
  const inferredTopicIds = inferSkillTopicIds(values);
  const topicIds = inferredArea
    ? inferredTopicIds.filter((topicId) => getSkillTopic(topicId)?.area === inferredArea)
    : inferredTopicIds;
  const area = inferredArea ?? getSkillTopic(topicIds[0] ?? "")?.area ?? null;
  if (!area) return null;
  return { category: area, topicIds, label: values.filter(Boolean).join(" ") };
}

function reviewKind(result: string | undefined): EvidenceKind {
  return result === "again" ? "failure" : "review";
}

function resultValue(result: string | undefined): number | undefined {
  if (result === "easy") return 1;
  if (result === "good") return 0.85;
  if (result === "hard") return 0.55;
  if (result === "again") return 0;
  return undefined;
}

function parsePlaygroundNotes(notes?: string): {
  testPassRate?: number | null;
  lastTestedAt?: string | null;
  status?: string;
} {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    return {
      testPassRate: typeof parsed.testPassRate === "number" ? parsed.testPassRate : null,
      lastTestedAt: typeof parsed.lastTestedAt === "string" ? parsed.lastTestedAt : null,
      status: typeof parsed.status === "string" ? parsed.status : undefined,
    };
  } catch {
    return {};
  }
}

function sourceContext(
  review: ReviewRecord,
  contexts: {
    plan: Map<string, TopicContext>;
    flashcards: Map<string, TopicContext>;
    quizzes: Map<string, TopicContext>;
    resources: Map<string, TopicContext>;
    english: Map<string, TopicContext>;
    mocks: Map<string, TopicContext>;
  },
): TopicContext | null {
  const maps: Partial<Record<ReviewRecord["sourceType"], Map<string, TopicContext>>> = {
    plan: contexts.plan,
    flashcard: contexts.flashcards,
    quiz: contexts.quizzes,
    resource: contexts.resources,
    technical_english: contexts.english,
    mock: contexts.mocks,
  };
  return maps[review.sourceType]?.get(review.sourceId) ?? null;
}

export function buildEvidenceRecords(
  data: EvidenceSourceData,
  today: string,
): {
  evidence: EvidenceRecord[];
  plannedTopicIds: string[];
} {
  const evidence: EvidenceRecord[] = [];
  const blocks = data.plan.days.flatMap((day) => day.blocks);
  const blockContexts = new Map<string, TopicContext>();
  const plannedTopicIds = new Set<string>();

  for (const block of blocks) {
    const context = contextFromValues(block.category, [
      block.title,
      block.description ?? "",
      ...(block.tags ?? []),
    ]);
    if (!context) continue;
    blockContexts.set(block.id, context);
    context.topicIds.forEach((topicId) => plannedTopicIds.add(topicId));
  }

  for (const progress of data.planProgress) {
    const context = blockContexts.get(progress.blockId);
    if (!context) continue;
    const occurredAt = progress.completedAt ?? progress.startedAt ?? progress.updatedAt;
    if (progress.status === "completed") {
      addEvidence(evidence, {
        id: `plan:${progress.id}:complete`,
        source: "plan",
        sourceId: progress.blockId,
        category: context.category,
        topicIds: context.topicIds,
        kind: "completion",
        value: 1,
        weight: 1.2,
        occurredAt,
        description: `Bloco concluído: ${context.label}`,
      });
    } else if (progress.status === "stuck") {
      addEvidence(evidence, {
        id: `plan:${progress.id}:stuck`,
        source: "plan",
        sourceId: progress.blockId,
        category: context.category,
        topicIds: context.topicIds,
        kind: "failure",
        value: 0,
        weight: 1,
        occurredAt,
        description: "Bloco marcado como travado.",
      });
    } else if (progress.status === "in_progress") {
      addEvidence(evidence, {
        id: `plan:${progress.id}:practice`,
        source: "plan",
        sourceId: progress.blockId,
        category: context.category,
        topicIds: context.topicIds,
        kind: "practice",
        weight: 0.5,
        occurredAt,
      });
    }
    if (progress.confidence !== undefined) {
      addEvidence(evidence, {
        id: `plan:${progress.id}:confidence`,
        source: "plan",
        sourceId: progress.blockId,
        category: context.category,
        topicIds: context.topicIds,
        kind: "confidence",
        value: Math.max(0, Math.min(1, progress.confidence / 5)),
        weight: 0.8,
        occurredAt,
      });
    }
  }

  const flashcardContexts = new Map<string, TopicContext>();
  for (const card of data.flashcards) {
    const context = contextFromValues(card.category, [card.front, card.back, ...card.tags]);
    if (!context) continue;
    flashcardContexts.set(card.id, context);
    if (card.lastReviewedAt) {
      addEvidence(evidence, {
        id: `flashcard:${card.id}:practice`,
        source: "flashcard",
        sourceId: card.id,
        category: context.category,
        topicIds: context.topicIds,
        kind: "practice",
        weight: 0.45,
        occurredAt: card.lastReviewedAt,
      });
    }
  }

  const quizContexts = new Map<string, TopicContext>();
  for (const question of data.quizQuestions) {
    const context = contextFromValues(question.category, [
      ...question.topicIds,
      question.group ?? "",
      ...question.tags,
      question.prompt,
    ]);
    if (context) quizContexts.set(question.id, context);
  }
  for (const answer of data.quizAnswers.filter((item) => item.isSubmitted)) {
    const context = quizContexts.get(answer.questionId);
    if (!context || answer.score === null) continue;
    addEvidence(evidence, {
      id: `quiz:${answer.id}`,
      source: "quiz",
      sourceId: answer.questionId,
      category: context.category,
      topicIds: context.topicIds,
      kind: answer.score >= 0.5 ? "success" : "failure",
      value: answer.score,
      weight: 1.3,
      occurredAt: answer.submittedAt ?? answer.updatedAt,
      description: `Questão respondida com ${Math.round(answer.score * 100)}% de crédito.`,
    });
  }

  const resourceContexts = new Map<string, TopicContext>();
  for (const resource of data.resources) {
    const context = contextFromValues(resource.category, [
      ...resource.topicIds,
      ...resource.tags,
      resource.title,
      resource.description ?? "",
    ]);
    if (context) resourceContexts.set(resource.id, context);
  }
  const progressByResource = new Map(data.resourceProgress.map((item) => [item.resourceId, item]));
  for (const resource of data.resources) {
    const context = resourceContexts.get(resource.id);
    const progress = progressByResource.get(resource.id);
    if (!context || !progress || progress.status === "not_started") continue;
    addEvidence(evidence, {
      id: `resource:${progress.id}`,
      source: "resource",
      sourceId: resource.id,
      category: context.category,
      topicIds: context.topicIds,
      kind: "resource",
      value: progress.status === "completed" ? 1 : 0.5,
      weight: 0.25,
      occurredAt: progress.completedAt ?? progress.lastOpenedAt ?? progress.updatedAt,
      description: progress.status === "completed" ? "Recurso concluído." : "Recurso em andamento.",
    });
  }

  const englishContexts = new Map<string, TopicContext>();
  for (const item of data.technicalEnglishItems) {
    const context = contextFromValues("english", [
      ...item.topicIds,
      ...item.tags,
      item.scenario,
      item.title,
      item.content,
    ]) ?? { category: "english", topicIds: [], label: item.title };
    englishContexts.set(item.id, context);
  }
  for (const practice of data.technicalEnglishPractices) {
    const context = englishContexts.get(practice.itemId);
    if (!context) continue;
    addEvidence(evidence, {
      id: `english:${practice.id}`,
      source: "technical_english",
      sourceId: practice.itemId,
      category: "english",
      topicIds: context.topicIds,
      kind: "practice",
      weight: 0.8,
      occurredAt: practice.createdAt,
      description: "Prática de inglês técnico registrada.",
    });
  }

  const mockContexts = new Map<string, TopicContext>();
  for (const item of data.mockEvidence) {
    const area = normalizeSkillArea(item.area) ?? "mock";
    const topicIds = inferSkillTopicIds([item.area, item.criterionId, item.description]);
    const context = { category: area, topicIds, label: item.description };
    mockContexts.set(item.mockId, context);
    addEvidence(evidence, {
      id: `mock:${item.id}`,
      source: "mock",
      sourceId: item.mockId,
      category: area,
      topicIds,
      kind: item.kind === "gap" ? "mock_gap" : "mock_strength",
      value: item.kind === "gap" ? 0 : 1,
      weight: 1.5 * item.confidence,
      occurredAt: item.createdAt,
      description: item.description,
    });
  }

  for (const solution of data.playgroundSolutions) {
    const context = contextFromValues("fe_coding", [
      solution.category ?? "",
      solution.title ?? "",
      solution.notes ?? "",
    ]);
    if (!context) continue;
    const metadata = parsePlaygroundNotes(solution.notes);
    const occurredAt = metadata.lastTestedAt ?? solution.updatedAt;
    addEvidence(evidence, {
      id: `playground:${solution.id}:practice`,
      source: "playground",
      sourceId: solution.id,
      category: context.category,
      topicIds: context.topicIds,
      kind: "practice",
      weight: 0.9,
      occurredAt,
    });
    if (metadata.testPassRate !== null && metadata.testPassRate !== undefined) {
      addEvidence(evidence, {
        id: `playground:${solution.id}:tests`,
        source: "playground",
        sourceId: solution.id,
        category: context.category,
        topicIds: context.topicIds,
        kind: metadata.testPassRate >= 60 ? "success" : "failure",
        value: metadata.testPassRate / 100,
        weight: 1.2,
        occurredAt,
        description: `${metadata.testPassRate}% dos testes passaram.`,
      });
    }
  }

  for (const session of data.timerSessions.filter((item) => item.status !== "cancelled")) {
    const context = contextFromValues(session.category, [session.category, session.title]);
    if (!context || session.actualDurationSeconds <= 0) continue;
    addEvidence(evidence, {
      id: `timer:${session.id}`,
      source: "timer",
      sourceId: session.id,
      category: context.category,
      topicIds: context.topicIds,
      kind: "time",
      value: session.actualDurationSeconds,
      weight: 0.15,
      occurredAt: session.endedAt,
      description: `${Math.round(session.actualDurationSeconds / 60)} minutos registrados.`,
    });
  }

  for (const note of data.notes.filter((item) => item.lifecycleStatus === "active")) {
    const context = contextFromValues(note.category, [
      note.topicId ?? "",
      ...note.tags,
      note.title,
    ]);
    if (!context) continue;
    addEvidence(evidence, {
      id: `note:${note.id}`,
      source: "note",
      sourceId: note.id,
      category: context.category,
      topicIds: context.topicIds,
      kind: "note",
      weight: 0.1,
      occurredAt: note.updatedAt,
      description: "Nota associada ao tópico.",
    });
  }

  const contexts = {
    plan: blockContexts,
    flashcards: flashcardContexts,
    quizzes: quizContexts,
    resources: resourceContexts,
    english: englishContexts,
    mocks: mockContexts,
  };
  for (const review of data.reviews) {
    const context = sourceContext(review, contexts);
    if (!context) continue;
    if (
      (review.status === "scheduled" || review.status === "due") &&
      review.scheduledFor.slice(0, 10) < today
    ) {
      const days = Math.max(
        1,
        Math.floor(
          (new Date(`${today}T12:00:00Z`).getTime() -
            new Date(`${review.scheduledFor.slice(0, 10)}T12:00:00Z`).getTime()) /
            86_400_000,
        ),
      );
      addEvidence(evidence, {
        id: `review:${review.id}:overdue`,
        source: "review",
        sourceId: review.id,
        category: context.category,
        topicIds: context.topicIds,
        kind: "failure",
        value: 0,
        weight: Math.min(2, 0.5 + days * 0.15),
        occurredAt: review.scheduledFor,
        description: `Revisão atrasada há ${days} dia${days === 1 ? "" : "s"}.`,
      });
    }
    for (const [index, history] of review.history.entries()) {
      if (!history.result) continue;
      addEvidence(evidence, {
        id: `review:${review.id}:${history.id ?? index}`,
        source: "review",
        sourceId: review.id,
        category: context.category,
        topicIds: context.topicIds,
        kind: reviewKind(history.result),
        value: resultValue(history.result),
        weight: 1.1,
        occurredAt: history.date,
        description: `Revisão: ${history.result}.`,
      });
    }
  }

  return { evidence, plannedTopicIds: Array.from(plannedTopicIds) };
}

export function getEvidenceSources(evidence: EvidenceRecord[]): EvidenceSource[] {
  return Array.from(new Set(evidence.map((item) => item.source)));
}
