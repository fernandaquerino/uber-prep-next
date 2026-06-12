import { SKILL_TOPICS, type SkillTopicDefinition } from "@/lib/data/skill-topics";
import type { EvidenceRecord, SkillState, SkillTopicAnalytics } from "./analytics.types";

const EVALUATED_KINDS = new Set([
  "success",
  "failure",
  "review",
  "mock_gap",
  "mock_strength",
  "confidence",
]);

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function daysSince(iso: string, now: string): number {
  const delta = new Date(now).getTime() - new Date(iso).getTime();
  return Math.max(0, Math.floor(delta / 86_400_000));
}

function getKnowledge(items: EvidenceRecord[]): number | null {
  const evaluated = items.filter(
    (item) => EVALUATED_KINDS.has(item.kind) && item.value !== undefined,
  );
  const totalWeight = evaluated.reduce((sum, item) => sum + item.weight, 0);
  if (evaluated.length < 2 || totalWeight < 1.5) return null;
  const weighted = evaluated.reduce((sum, item) => sum + (item.value ?? 0) * item.weight, 0);
  return Math.round((weighted / totalWeight) * 100);
}

function getRetention(items: EvidenceRecord[]): number | null {
  const reviews = items.filter(
    (item) =>
      item.source === "review" &&
      item.value !== undefined &&
      (item.kind === "review" || item.kind === "failure"),
  );
  if (reviews.length < 2) return null;
  return Math.round(
    (reviews.reduce((sum, item) => sum + (item.value ?? 0), 0) / reviews.length) * 100,
  );
}

function getState(
  evidenceCount: number,
  sourceCount: number,
  knowledge: number | null,
  retention: number | null,
  hasRisk: boolean,
): SkillState {
  if (hasRisk) return "at_risk";
  if (evidenceCount === 0) return "not_started";
  if (knowledge !== null && knowledge >= 85 && (retention ?? 0) >= 75 && sourceCount >= 3) {
    return "mastered";
  }
  if (knowledge !== null && knowledge >= 70 && evidenceCount >= 6 && sourceCount >= 2) {
    return "consistent";
  }
  if (evidenceCount >= 3 || sourceCount >= 2) return "practicing";
  return "learning";
}

function explain(topic: SkillTopicDefinition, items: EvidenceRecord[], state: SkillState): string {
  if (state === "not_started") return `${topic.label} ainda não possui atividade registrada.`;
  const quiz = items.filter((item) => item.source === "quiz" && item.kind === "success").length;
  const reviews = items.filter((item) => item.source === "review" && item.kind === "review").length;
  const practice = items.filter(
    (item) => item.kind === "practice" || item.kind === "completion",
  ).length;
  const strengths = items.filter((item) => item.kind === "mock_strength").length;
  const gaps = items.filter((item) => item.kind === "mock_gap" || item.kind === "failure").length;
  const parts = [
    quiz > 0 ? `${quiz} quiz${quiz === 1 ? "" : "zes"} com resultado positivo` : "",
    reviews > 0
      ? `${reviews} revisão${reviews === 1 ? "" : "ões"} concluída${reviews === 1 ? "" : "s"}`
      : "",
    practice > 0 ? `${practice} prática${practice === 1 ? "" : "s"}` : "",
    strengths > 0 ? `${strengths} força${strengths === 1 ? "" : "s"} em mock` : "",
    gaps > 0 ? `${gaps} evidência${gaps === 1 ? "" : "s"} de dificuldade` : "",
  ].filter(Boolean);
  return `${state === "at_risk" ? "Em risco" : "Estado baseado"} em: ${parts.slice(0, 3).join(", ")}.`;
}

function nextAction(state: SkillState, label: string): string {
  if (state === "not_started") return `Iniciar uma prática de ${label}.`;
  if (state === "at_risk") return `Revisar ${label} e refazer uma atividade avaliada.`;
  if (state === "learning") return `Adicionar uma segunda fonte de prática para ${label}.`;
  if (state === "practicing") return `Concluir uma revisão ou quiz de ${label}.`;
  if (state === "consistent") return `Manter ${label} com revisão espaçada.`;
  return `Preservar o domínio de ${label} com prática periódica.`;
}

export function buildSkillTree(
  evidence: EvidenceRecord[],
  plannedTopicIds: string[],
  now: string,
): SkillTopicAnalytics[] {
  const relevantIds = new Set([
    ...plannedTopicIds,
    ...evidence.map((item) => item.topicId).filter((id): id is string => Boolean(id)),
  ]);

  return SKILL_TOPICS.filter((topic) => relevantIds.has(topic.id)).map((topic) => {
    const items = evidence.filter((item) => item.topicId === topic.id);
    const sources = new Set(items.map((item) => item.source));
    const knowledge = getKnowledge(items);
    const retention = getRetention(items);
    const confidenceValues = items
      .filter((item) => item.kind === "confidence" && item.value !== undefined)
      .map((item) => item.value!);
    const confidence =
      confidenceValues.length > 0 ? Math.round((average(confidenceValues) ?? 0) * 100) : null;
    const lastActivityAt =
      items.map((item) => item.occurredAt).sort((a, b) => b.localeCompare(a))[0] ?? null;
    const recentActivity = items.filter((item) => daysSince(item.occurredAt, now) <= 14).length;
    const negativeWeight = items
      .filter((item) => item.kind === "failure" || item.kind === "mock_gap")
      .reduce((sum, item) => sum + item.weight, 0);
    const overdue = items.some((item) => item.description?.startsWith("Revisão atrasada"));
    const hasRisk =
      negativeWeight >= 2 ||
      overdue ||
      (knowledge !== null && knowledge < 45 && items.length >= 3) ||
      (confidence !== null && confidence < 40);
    const state = getState(items.length, sources.size, knowledge, retention, hasRisk);

    return {
      topicId: topic.id,
      area: topic.area,
      label: topic.label,
      state,
      explanation: explain(topic, items, state),
      evidenceCount: items.length,
      sourceCount: sources.size,
      lastActivityAt,
      knowledge,
      retention,
      confidence,
      recentActivity,
      reviewCount: items.filter((item) => item.source === "review").length,
      quizCount: items.filter((item) => item.source === "quiz").length,
      mockCount: items.filter((item) => item.source === "mock").length,
      timeSeconds: items
        .filter((item) => item.kind === "time")
        .reduce((sum, item) => sum + (item.value ?? 0), 0),
      noteCount: items.filter((item) => item.source === "note").length,
      resourceCount: items.filter((item) => item.source === "resource").length,
      nextAction: nextAction(state, topic.label),
    };
  });
}
