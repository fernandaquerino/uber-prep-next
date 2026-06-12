import { getSkillTopic } from "@/lib/data/skill-topics";
import type { EvidenceRecord, RiskTopic, SkillTopicAnalytics } from "./analytics.types";

export function getRiskTopics(
  skills: SkillTopicAnalytics[],
  evidence: EvidenceRecord[],
  plannedTopicIds: string[],
): RiskTopic[] {
  const planned = new Set(plannedTopicIds);
  return skills
    .filter((skill) => planned.has(skill.topicId) && skill.state === "at_risk")
    .map((skill) => {
      const items = evidence.filter((item) => item.topicId === skill.topicId);
      const failures = items.filter((item) => item.kind === "failure").length;
      const gaps = items.filter((item) => item.kind === "mock_gap").length;
      const overdue = items.filter((item) =>
        item.description?.startsWith("Revisão atrasada"),
      ).length;
      const lowConfidence = skill.confidence !== null && skill.confidence < 40;
      const score = Math.min(
        100,
        failures * 18 + gaps * 25 + overdue * 20 + (lowConfidence ? 20 : 0),
      );
      const reasons = [
        failures > 0
          ? `${failures} falha${failures === 1 ? "" : "s"} registrada${failures === 1 ? "" : "s"}`
          : "",
        gaps > 0
          ? `${gaps} gap${gaps === 1 ? "" : "s"} identificado${gaps === 1 ? "" : "s"} em mock`
          : "",
        overdue > 0
          ? `${overdue} revisão${overdue === 1 ? "" : "ões"} atrasada${overdue === 1 ? "" : "s"}`
          : "",
        lowConfidence ? "Confiança registrada abaixo de 40%." : "",
      ].filter(Boolean);
      const definition = getSkillTopic(skill.topicId);
      return {
        topicId: skill.topicId,
        area: skill.area,
        label: skill.label,
        severity: score >= 75 ? "critical" : score >= 50 ? "high" : "medium",
        score,
        reasons,
        evidenceIds: items
          .filter((item) => item.kind === "failure" || item.kind === "mock_gap")
          .map((item) => item.id),
        recommendedAction:
          overdue > 0
            ? `Concluir a revisão atrasada de ${skill.label}.`
            : `Refazer uma atividade avaliada de ${definition?.label ?? skill.label}.`,
      } satisfies RiskTopic;
    })
    .sort((a, b) => b.score - a.score);
}
