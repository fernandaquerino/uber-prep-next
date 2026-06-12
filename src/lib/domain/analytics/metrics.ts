import { SKILL_AREAS } from "@/lib/data/skill-topics";
import type { EvidenceRecord, ModuleMetric, WeeklyEvolutionPoint } from "./analytics.types";

function weekStart(iso: string): string {
  const date = new Date(iso);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function evaluatedRate(items: EvidenceRecord[]): number | null {
  const valid = items.filter(
    (item) =>
      item.value !== undefined &&
      ["success", "failure", "review", "mock_gap", "mock_strength"].includes(item.kind),
  );
  if (valid.length === 0) return null;
  return valid.reduce((sum, item) => sum + item.value!, 0) / valid.length;
}

export function calculateRetention(evidence: EvidenceRecord[]): number | null {
  const reviews = evidence.filter(
    (item) =>
      item.source === "review" &&
      item.value !== undefined &&
      (item.kind === "review" || item.kind === "failure") &&
      !item.description?.startsWith("Revisão atrasada"),
  );
  if (reviews.length < 2) return null;
  return Math.round((reviews.reduce((sum, item) => sum + item.value!, 0) / reviews.length) * 100);
}

export function buildWeeklyEvolution(evidence: EvidenceRecord[]): WeeklyEvolutionPoint[] {
  const grouped = new Map<string, EvidenceRecord[]>();
  for (const item of evidence) {
    const key = weekStart(item.occurredAt);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([start, items]) => ({
      weekStart: start,
      evidenceCount: items.length,
      studySeconds: items
        .filter((item) => item.kind === "time")
        .reduce((sum, item) => sum + (item.value ?? 0), 0),
      successRate: evaluatedRate(items),
    }));
}

export function buildTimeByCategory(evidence: EvidenceRecord[]) {
  return SKILL_AREAS.map((area) => ({
    category: area.id,
    seconds: evidence
      .filter((item) => item.category === area.id && item.kind === "time")
      .reduce((sum, item) => sum + (item.value ?? 0), 0),
  })).filter((item) => item.seconds > 0);
}

export function buildModuleMetrics(evidence: EvidenceRecord[]): ModuleMetric[] {
  const metrics: Array<{ source: EvidenceRecord["source"]; label: string; detail: string }> = [
    { source: "plan", label: "Plano", detail: "blocos e confiança registrados" },
    { source: "review", label: "Revisões", detail: "resultados e atrasos" },
    { source: "flashcard", label: "Flashcards", detail: "cartões praticados" },
    { source: "quiz", label: "Quizzes", detail: "respostas avaliadas" },
    { source: "playground", label: "Playground", detail: "soluções e testes" },
    { source: "timer", label: "Timer", detail: "sessões oficiais" },
    { source: "mock", label: "Mocks", detail: "forças e gaps avaliados" },
    { source: "note", label: "Notas", detail: "notas associadas" },
    { source: "resource", label: "Recursos", detail: "recursos estudados" },
    { source: "technical_english", label: "Inglês", detail: "práticas registradas" },
  ];
  return metrics.map((metric) => {
    const items = evidence.filter((item) => item.source === metric.source);
    return {
      id: metric.source,
      label: metric.label,
      value: items.length > 0 ? String(items.length) : "Sem dados",
      detail: metric.detail,
      hasData: items.length > 0,
    };
  });
}
