// @vitest-environment node

import { describe, expect, it } from "vitest";
import { buildWeeklyReportMarkdown, type WeeklyReport } from "@/lib/domain/reports";

const report = {
  weekNumber: 3,
  weekStart: "2026-06-22",
  weekEnd: "2026-06-28",
  status: "past",
  isEmpty: false,
  metrics: {
    plannedBlocks: 8,
    completedBlocks: 6,
    overdueBlocks: 2,
    plannedMinutes: 480,
    actualSeconds: 14400,
    completedReviews: 4,
    quizAnswers: 5,
    quizAccuracy: 80,
    flashcardsReviewed: 10,
    mocksCompleted: 1,
    playgroundPractices: 2,
    resourcesStudied: 3,
    englishPractices: 2,
    notesUpdated: 1,
    evidenceCount: 30,
  },
  timerByCategory: [{ category: "algo", seconds: 7200 }],
  readiness: {
    score: 72,
    confidence: "medium",
    evidenceCount: 12,
    sourceCount: 3,
    reasons: [],
    missingEvidence: [],
    factors: [],
  },
  readinessByArea: [],
  skills: [],
  strengths: [],
  risks: [],
  recommendations: [
    {
      id: "next",
      title: "Revisar Big O",
      reason: "Uma revisão está atrasada.",
      href: "/revisar",
      priority: 1,
    },
  ],
  reflection: {
    content: "Boa semana.",
    wins: "Mais confiança.",
    blockers: "Tempo.",
    whatWorked: "Timer.",
    whatToAdjust: "Dormir cedo.",
  },
  comparison: null,
  generatedAt: "2026-06-29T00:00:00.000Z",
} satisfies WeeklyReport;

describe("buildWeeklyReportMarkdown", () => {
  it("exports title, metrics, reflection and next steps", () => {
    const markdown = buildWeeklyReportMarkdown(report);
    expect(markdown).toContain("# Relatório semanal — Semana 3");
    expect(markdown).toContain("| Quiz accuracy | 80% |");
    expect(markdown).toContain("**O que evoluiu:** Mais confiança.");
    expect(markdown).toContain("**Revisar Big O:** Uma revisão está atrasada.");
  });
});
