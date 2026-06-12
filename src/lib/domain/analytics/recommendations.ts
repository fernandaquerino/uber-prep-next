import type {
  AnalyticsRecommendation,
  EvidenceRecord,
  ReadinessScore,
  RiskTopic,
  SkillTopicAnalytics,
} from "./analytics.types";

export function buildAnalyticsRecommendations(
  risks: RiskTopic[],
  skills: SkillTopicAnalytics[],
  readiness: ReadinessScore,
  evidence: EvidenceRecord[],
): AnalyticsRecommendation[] {
  const recommendations: AnalyticsRecommendation[] = risks.slice(0, 3).map((risk, index) => ({
    id: `risk:${risk.topicId}`,
    title: risk.recommendedAction,
    reason: risk.reasons.join("; "),
    source: "analytics",
    impact: "Reduz risco em um tópico planejado e melhora retenção.",
    actionLabel: risk.reasons.some((reason) => reason.includes("atrasada"))
      ? "Abrir revisões"
      : "Abrir plano",
    href: risk.reasons.some((reason) => reason.includes("atrasada")) ? "/revisar" : "/plano",
    priority: 100 - index,
  }));

  if (readiness.score === null) {
    const hasQuiz = evidence.some((item) => item.source === "quiz");
    const hasMock = evidence.some((item) => item.source === "mock");
    recommendations.push({
      id: "readiness:evidence",
      title: !hasQuiz
        ? "Faça um quiz avaliado"
        : !hasMock
          ? "Conclua um mock com rubrica"
          : "Registre mais prática avaliada",
      reason: readiness.missingEvidence[0] ?? "Ainda faltam evidências independentes.",
      source: "analytics",
      impact: "Aumenta a confiança da readiness sem inventar pontuação.",
      actionLabel: !hasQuiz ? "Abrir quizzes" : !hasMock ? "Abrir mocks" : "Abrir plano",
      href: !hasQuiz ? "/quizzes" : !hasMock ? "/mocks" : "/plano",
      priority: 70,
    });
  }

  const learning = skills.find((skill) => skill.state === "learning" && skill.evidenceCount > 0);
  if (learning) {
    recommendations.push({
      id: `learning:${learning.topicId}`,
      title: learning.nextAction,
      reason: learning.explanation,
      source: "analytics",
      impact: "Adiciona uma fonte independente para confirmar aprendizado.",
      actionLabel: "Ver plano",
      href: "/plano",
      priority: 50,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
