import { describe, expect, it } from "vitest";
import { buildStatisticsViewModel } from "./statistics-view-model";
import type { AnalyticsSnapshot } from "@/lib/domain/analytics";
import type { TimerSessionRecord } from "@/types/database";

const analytics: AnalyticsSnapshot = {
  generatedAt: "2026-06-14T12:00:00.000Z",
  evidence: [
    {
      id: "timer-1",
      source: "timer",
      sourceId: "session-1",
      category: "js",
      kind: "time",
      value: 2700,
      weight: 0.15,
      occurredAt: "2026-06-12T12:00:00.000Z",
    },
  ],
  plannedTopicIds: ["event-loop"],
  skills: [
    {
      topicId: "event-loop",
      area: "js",
      label: "Event Loop",
      state: "learning",
      explanation: "",
      evidenceCount: 1,
      sourceCount: 1,
      lastActivityAt: "2026-06-12T12:00:00.000Z",
      knowledge: null,
      retention: null,
      confidence: null,
      recentActivity: 1,
      reviewCount: 0,
      quizCount: 0,
      mockCount: 0,
      timeSeconds: 2700,
      noteCount: 0,
      resourceCount: 0,
      nextAction: "",
    },
  ],
  readiness: {
    score: null,
    confidence: "insufficient_data",
    evidenceCount: 0,
    sourceCount: 0,
    reasons: [],
    missingEvidence: [],
    factors: [],
  },
  readinessByArea: [],
  risks: [],
  strengths: [],
  recommendations: [],
  moduleMetrics: [],
  weeklyEvolution: [],
  timeByCategory: [{ category: "js", seconds: 2700 }],
  retention: null,
};

const session: TimerSessionRecord = {
  id: "session-1",
  sourceType: "plan_block",
  category: "js",
  title: "Event Loop",
  mode: "countdown",
  status: "completed",
  targetDurationSeconds: 3000,
  actualDurationSeconds: 2700,
  startedAt: "2026-06-12T11:15:00.000Z",
  endedAt: "2026-06-12T12:00:00.000Z",
  date: "2026-06-12",
  createdAt: "2026-06-12T11:15:00.000Z",
  updatedAt: "2026-06-12T12:00:00.000Z",
};

describe("buildStatisticsViewModel", () => {
  it("deriva métricas, categorias e histórico das fontes reais", () => {
    const result = buildStatisticsViewModel({
      period: "7d",
      today: "2026-06-14",
      analytics,
      timerSessions: [session],
      quizAnswers: [],
      flashcards: [],
      planProgress: [],
    });

    expect(result.metrics.find((metric) => metric.id === "time")?.value).toBe("45min");
    expect(result.metrics.find((metric) => metric.id === "sessions")?.value).toBe("1");
    expect(result.categories).toEqual([
      expect.objectContaining({ id: "js", seconds: 2700, percentage: 100 }),
    ]);
    expect(result.sessions[0]).toEqual(
      expect.objectContaining({
        title: "Event Loop",
        activity: "Plano",
        focus: "Excelente",
      }),
    );
  });

  it("não transforma ausência de avaliação em desempenho zero", () => {
    const result = buildStatisticsViewModel({
      period: "7d",
      today: "2026-06-14",
      analytics,
      timerSessions: [session],
      quizAnswers: [],
      flashcards: [],
      planProgress: [],
    });

    const accuracy = result.metrics.find((metric) => metric.id === "accuracy");
    expect(accuracy).toMatchObject({ value: "Sem dados", hasData: false, comparison: null });
  });
});
