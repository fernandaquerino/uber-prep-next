import { getSkillTopic, SKILL_AREAS } from "@/lib/data/skill-topics";
import {
  buildSkillTree,
  calculateReadiness,
  calculateReadinessByArea,
  getRiskTopics,
  type EvidenceRecord,
} from "@/lib/domain/analytics";
import type { WeeklyReflectionRecord } from "@/types/database";
import type {
  WeeklyReport,
  WeeklyReportComparison,
  WeeklyReportMetrics,
  WeeklyReportRecommendation,
  WeeklyReportWeek,
} from "./report.types";

function dateOf(value: string): string {
  return value.slice(0, 10);
}

function inRange(value: string, start: string, end: string): boolean {
  const date = dateOf(value);
  return start <= date && date <= end;
}

function buildMetrics(week: WeeklyReportWeek, evidence: EvidenceRecord[]): WeeklyReportMetrics {
  const items = week.days.flatMap((day) => day.items);
  const quizzes = evidence.filter((item) => item.source === "quiz" && item.value !== undefined);
  return {
    plannedBlocks: items.length,
    completedBlocks: items.filter(
      (item) =>
        item.executionStatus === "completed" &&
        (!item.completedAt || inRange(item.completedAt, week.weekStart, week.weekEnd)),
    ).length,
    overdueBlocks: items.filter(
      (item) =>
        item.isOverdue ||
        (item.completedAt !== undefined && dateOf(item.completedAt) > week.weekEnd),
    ).length,
    plannedMinutes: items.reduce((sum, item) => sum + item.estimatedMinutes, 0),
    actualSeconds: evidence
      .filter((item) => item.kind === "time")
      .reduce((sum, item) => sum + (item.value ?? 0), 0),
    completedReviews: evidence.filter(
      (item) =>
        item.source === "review" &&
        (item.kind === "review" || item.kind === "failure") &&
        !item.description?.startsWith("Revisão atrasada"),
    ).length,
    quizAnswers: quizzes.length,
    quizAccuracy:
      quizzes.length === 0
        ? null
        : Math.round(
            (quizzes.reduce((sum, item) => sum + (item.value ?? 0), 0) / quizzes.length) * 100,
          ),
    flashcardsReviewed: new Set(
      evidence.filter((item) => item.source === "flashcard").map((item) => item.sourceId),
    ).size,
    mocksCompleted: new Set(
      evidence.filter((item) => item.source === "mock").map((item) => item.sourceId),
    ).size,
    playgroundPractices: new Set(
      evidence.filter((item) => item.source === "playground").map((item) => item.sourceId),
    ).size,
    resourcesStudied: new Set(
      evidence.filter((item) => item.source === "resource").map((item) => item.sourceId),
    ).size,
    englishPractices: evidence.filter((item) => item.source === "technical_english").length,
    notesUpdated: new Set(
      evidence.filter((item) => item.source === "note").map((item) => item.sourceId),
    ).size,
    evidenceCount: evidence.length,
  };
}

function buildRecommendations(
  week: WeeklyReportWeek,
  metrics: WeeklyReportMetrics,
  risks: WeeklyReport["risks"],
  timerByCategory: WeeklyReport["timerByCategory"],
): WeeklyReportRecommendation[] {
  const recommendations: WeeklyReportRecommendation[] = [];
  if (metrics.overdueBlocks > 0) {
    recommendations.push({
      id: "recover-overdue",
      title: "Recuperar blocos atrasados",
      reason: `${metrics.overdueBlocks} bloco${metrics.overdueBlocks === 1 ? "" : "s"} da semana ainda exige atenção.`,
      href: "/plano",
      priority: 100,
    });
  }
  for (const risk of risks.slice(0, 2)) {
    recommendations.push({
      id: `risk:${risk.topicId}`,
      title: risk.recommendedAction,
      reason: risk.reasons.join("; "),
      href: risk.reasons.some((reason) => reason.includes("atrasada")) ? "/revisoes" : "/plano",
      priority: 90 - recommendations.length,
    });
  }
  if (metrics.quizAnswers > 0 && metrics.quizAccuracy !== null && metrics.quizAccuracy < 70) {
    recommendations.push({
      id: "quiz-errors",
      title: "Refazer quizzes com erro",
      reason: `A acurácia da semana foi ${metrics.quizAccuracy}%, abaixo do alvo de 70%.`,
      href: "/quizzes",
      priority: 75,
    });
  }
  if (metrics.flashcardsReviewed === 0 && week.status !== "future") {
    recommendations.push({
      id: "flashcards",
      title: "Consolidar com flashcards",
      reason: "Nenhum flashcard foi revisado nesta semana.",
      href: "/flashcards",
      priority: 60,
    });
  }
  if (metrics.mocksCompleted === 0 && week.weekNumber >= 2 && week.status !== "future") {
    recommendations.push({
      id: "mock",
      title: "Praticar um mock",
      reason: "A semana não possui evidência de mock concluído.",
      href: "/mocks",
      priority: 55,
    });
  }
  if (metrics.actualSeconds > metrics.plannedMinutes * 60 * 1.25 && metrics.plannedMinutes > 0) {
    recommendations.push({
      id: "rest",
      title: "Preservar recuperação e descanso",
      reason: "O tempo real excedeu a carga planejada em mais de 25%.",
      href: "/configuracoes",
      priority: 50,
    });
  }
  const weakestTimeArea = [...timerByCategory].sort((a, b) => a.seconds - b.seconds)[0];
  if (weakestTimeArea && timerByCategory.length > 1) {
    recommendations.push({
      id: `time:${weakestTimeArea.category}`,
      title: "Equilibrar tempo entre áreas",
      reason: `${
        SKILL_AREAS.find((area) => area.id === weakestTimeArea.category)?.label ??
        weakestTimeArea.category
      } recebeu menos tempo registrado.`,
      href: "/timer",
      priority: 40,
    });
  }
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

export function compareWeeklyReports(
  current: WeeklyReport,
  previous: WeeklyReport | null,
): WeeklyReportComparison | null {
  if (!previous) return null;
  return {
    previousWeekNumber: previous.weekNumber,
    completedBlocksDelta: current.metrics.completedBlocks - previous.metrics.completedBlocks,
    actualSecondsDelta: current.metrics.actualSeconds - previous.metrics.actualSeconds,
    quizAccuracyDelta:
      current.metrics.quizAccuracy === null || previous.metrics.quizAccuracy === null
        ? null
        : current.metrics.quizAccuracy - previous.metrics.quizAccuracy,
    readinessDelta:
      current.readiness.score === null || previous.readiness.score === null
        ? null
        : current.readiness.score - previous.readiness.score,
    evidenceDelta: current.metrics.evidenceCount - previous.metrics.evidenceCount,
  };
}

export function buildWeeklyReport(input: {
  week: WeeklyReportWeek;
  today: string;
  allEvidence: EvidenceRecord[];
  plannedTopicIds: string[];
  reflection?: WeeklyReflectionRecord;
  previous?: WeeklyReport | null;
  generatedAt?: string;
}): WeeklyReport {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const periodEvidence = input.allEvidence.filter((item) =>
    inRange(item.occurredAt, input.week.weekStart, input.week.weekEnd),
  );
  const cumulativeEvidence = input.allEvidence.filter(
    (item) => dateOf(item.occurredAt) <= input.week.weekEnd,
  );
  const skills = buildSkillTree(cumulativeEvidence, input.plannedTopicIds, generatedAt);
  const readiness = calculateReadiness(cumulativeEvidence, input.plannedTopicIds, generatedAt);
  const readinessByArea = calculateReadinessByArea(
    cumulativeEvidence,
    input.plannedTopicIds,
    generatedAt,
  ).filter(
    (item) =>
      item.readiness.evidenceCount > 0 ||
      input.plannedTopicIds.some((topicId) => getSkillTopic(topicId)?.area === item.area),
  );
  const risks = getRiskTopics(skills, cumulativeEvidence, input.plannedTopicIds);
  const metrics = buildMetrics(input.week, periodEvidence);
  const timerByCategory = SKILL_AREAS.map((area) => ({
    category: area.id,
    seconds: periodEvidence
      .filter((item) => item.kind === "time" && item.category === area.id)
      .reduce((sum, item) => sum + (item.value ?? 0), 0),
  })).filter((item) => item.seconds > 0);
  const reflection = input.reflection;
  const report: WeeklyReport = {
    weekNumber: input.week.weekNumber,
    weekStart: input.week.weekStart,
    weekEnd: input.week.weekEnd,
    status: input.week.status,
    isEmpty: metrics.evidenceCount === 0 && metrics.completedBlocks === 0,
    metrics,
    timerByCategory,
    readiness,
    readinessByArea,
    skills,
    strengths: skills
      .filter((skill) => skill.state === "mastered" || skill.state === "consistent")
      .sort((a, b) => (b.knowledge ?? 0) - (a.knowledge ?? 0))
      .slice(0, 5),
    risks,
    recommendations: [],
    reflection: {
      content: reflection?.content ?? "",
      wins: reflection?.wins ?? "",
      blockers: reflection?.blockers ?? "",
      whatWorked: reflection?.whatWorked ?? "",
      whatToAdjust: reflection?.whatToAdjust ?? "",
      updatedAt: reflection?.updatedAt,
    },
    comparison: null,
    generatedAt,
  };
  report.recommendations = buildRecommendations(input.week, metrics, risks, timerByCategory);
  report.comparison = compareWeeklyReports(report, input.previous ?? null);
  return report;
}
