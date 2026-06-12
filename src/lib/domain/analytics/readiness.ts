import { getSkillTopic, SKILL_AREAS, type SkillAreaId } from "@/lib/data/skill-topics";
import type { EvidenceRecord, ReadinessScore } from "./analytics.types";

const PRACTICAL_SOURCES = new Set(["plan", "quiz", "playground", "mock", "review", "flashcard"]);
const EVALUATED_KINDS = new Set(["success", "failure", "review", "mock_gap", "mock_strength"]);

function weightedAverage(items: EvidenceRecord[]): number | null {
  const valid = items.filter((item) => item.value !== undefined);
  const weight = valid.reduce((sum, item) => sum + item.weight, 0);
  if (weight === 0) return null;
  return valid.reduce((sum, item) => sum + item.value! * item.weight, 0) / weight;
}

function recentRatio(items: EvidenceRecord[], now: string): number {
  if (items.length === 0) return 0;
  const cutoff = new Date(now).getTime() - 21 * 86_400_000;
  return (
    items.filter((item) => new Date(item.occurredAt).getTime() >= cutoff).length / items.length
  );
}

export function calculateReadiness(
  evidence: EvidenceRecord[],
  plannedTopicIds: string[],
  now: string,
): ReadinessScore {
  const evaluated = evidence.filter(
    (item) => EVALUATED_KINDS.has(item.kind) && item.value !== undefined,
  );
  const practical = evidence.filter((item) => PRACTICAL_SOURCES.has(item.source));
  const sources = new Set(evaluated.map((item) => item.source));
  const practicedTopics = new Set(
    practical.map((item) => item.topicId).filter((id): id is string => Boolean(id)),
  );
  const completedPlan = evidence.filter((item) => item.kind === "completion").length;
  const planItems = evidence.filter((item) => item.source === "plan").length;

  const performance = weightedAverage(
    evaluated.filter(
      (item) => item.source === "quiz" || item.source === "mock" || item.source === "playground",
    ),
  );
  const retention = weightedAverage(evaluated.filter((item) => item.source === "review"));
  const execution = Math.min(1, practical.length / 12);
  const coverage =
    plannedTopicIds.length > 0
      ? Math.min(1, practicedTopics.size / new Set(plannedTopicIds).size)
      : planItems > 0
        ? Math.min(1, completedPlan / planItems)
        : null;
  const consistency = recentRatio(practical, now);

  const factors = [
    {
      id: "performance",
      label: "Desempenho avaliado",
      score: performance === null ? null : Math.round(performance * 100),
      weight: 0.3,
    },
    {
      id: "retention",
      label: "Retenção em revisões",
      score: retention === null ? null : Math.round(retention * 100),
      weight: 0.25,
    },
    {
      id: "execution",
      label: "Execução prática",
      score: Math.round(execution * 100),
      weight: 0.25,
    },
    {
      id: "coverage",
      label: "Cobertura do plano",
      score: coverage === null ? null : Math.round(coverage * 100),
      weight: 0.1,
    },
    {
      id: "consistency",
      label: "Consistência recente",
      score: Math.round(consistency * 100),
      weight: 0.1,
    },
  ];

  const missingEvidence = [
    performance === null ? "Atividades avaliadas, como quizzes, Playground ou mocks." : "",
    retention === null ? "Ao menos duas revisões com resultado." : "",
    practical.length < 4 ? "Mais prática registrada em fontes reais." : "",
    sources.size < 2 ? "Evidências avaliadas de uma segunda fonte." : "",
  ].filter(Boolean);

  if (evaluated.length < 4 || sources.size < 2) {
    return {
      score: null,
      confidence: "insufficient_data",
      evidenceCount: evaluated.length,
      sourceCount: sources.size,
      reasons: [
        "A fórmula exige ao menos quatro evidências avaliadas em duas fontes independentes.",
      ],
      missingEvidence,
      factors,
    };
  }

  const available = factors.filter((factor) => factor.score !== null);
  const totalWeight = available.reduce((sum, factor) => sum + factor.weight, 0);
  const score = Math.round(
    available.reduce((sum, factor) => sum + factor.score! * factor.weight, 0) / totalWeight,
  );
  const confidence =
    evaluated.length >= 20 && sources.size >= 4
      ? "high"
      : evaluated.length >= 10 && sources.size >= 3
        ? "medium"
        : "low";

  return {
    score,
    confidence,
    evidenceCount: evaluated.length,
    sourceCount: sources.size,
    reasons: [
      `Pontuação calculada com ${evaluated.length} evidências avaliadas.`,
      `${sources.size} fontes independentes contribuíram para o resultado.`,
    ],
    missingEvidence,
    factors,
  };
}

export function calculateReadinessByArea(
  evidence: EvidenceRecord[],
  plannedTopicIds: string[],
  now: string,
): Array<{ area: SkillAreaId; label: string; readiness: ReadinessScore }> {
  return SKILL_AREAS.map((area) => ({
    area: area.id,
    label: area.label,
    readiness: calculateReadiness(
      evidence.filter((item) => item.category === area.id),
      plannedTopicIds.filter((topicId) => getSkillTopic(topicId)?.area === area.id),
      now,
    ),
  }));
}
