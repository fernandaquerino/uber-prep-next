import { SKILL_AREAS } from "@/lib/data/skill-topics";
import type { WeeklyReport } from "./report.types";

function duration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}min` : `${minutes}min`;
}

function value(value: number | null, suffix = ""): string {
  return value === null ? "Dados insuficientes" : `${value}${suffix}`;
}

export function buildWeeklyReportMarkdown(report: WeeklyReport): string {
  const lines = [
    `# Relatório semanal — Semana ${report.weekNumber}`,
    "",
    `**Período:** ${report.weekStart} a ${report.weekEnd}`,
    `**Status:** ${report.status}`,
    `**Gerado em:** ${report.generatedAt}`,
    "",
    "## Resumo",
    "",
    "| Métrica | Valor |",
    "| --- | ---: |",
    `| Blocos planejados | ${report.metrics.plannedBlocks} |`,
    `| Blocos concluídos | ${report.metrics.completedBlocks} |`,
    `| Atrasos | ${report.metrics.overdueBlocks} |`,
    `| Tempo planejado | ${duration(report.metrics.plannedMinutes * 60)} |`,
    `| Tempo real | ${duration(report.metrics.actualSeconds)} |`,
    `| Revisões feitas | ${report.metrics.completedReviews} |`,
    `| Quiz accuracy | ${value(report.metrics.quizAccuracy, "%")} |`,
    `| Flashcards revisados | ${report.metrics.flashcardsReviewed} |`,
    `| Mocks realizados | ${report.metrics.mocksCompleted} |`,
    `| Readiness | ${value(report.readiness.score, "/100")} |`,
    "",
    "## Tempo por categoria",
    "",
    "| Categoria | Tempo |",
    "| --- | ---: |",
    ...report.timerByCategory.map((item) => {
      const label = SKILL_AREAS.find((area) => area.id === item.category)?.label ?? item.category;
      return `| ${label} | ${duration(item.seconds)} |`;
    }),
    "",
    "## Tópicos fortes",
    "",
    ...(report.strengths.length
      ? report.strengths.map((skill) => `- **${skill.label}:** ${skill.explanation}`)
      : ["- Ainda não há evidências suficientes."]),
    "",
    "## Tópicos de risco",
    "",
    ...(report.risks.length
      ? report.risks.map((risk) => `- **${risk.label}:** ${risk.reasons.join("; ")}`)
      : ["- Nenhum risco consolidado nesta semana."]),
    "",
    "## Reflexão",
    "",
    `- **O que evoluiu:** ${report.reflection.wins || "Não preenchido"}`,
    `- **O que ficou difícil:** ${report.reflection.blockers || "Não preenchido"}`,
    `- **O que funcionou:** ${report.reflection.whatWorked || "Não preenchido"}`,
    `- **O que ajustar:** ${report.reflection.whatToAdjust || "Não preenchido"}`,
    `- **Observações:** ${report.reflection.content || "Não preenchido"}`,
    "",
    "## Próximos passos",
    "",
    ...(report.recommendations.length
      ? report.recommendations.map((item) => `- **${item.title}:** ${item.reason}`)
      : ["- Manter o plano atual."]),
    "",
  ];
  return lines.join("\n");
}
