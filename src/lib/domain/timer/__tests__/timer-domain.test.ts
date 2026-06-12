import { describe, expect, it } from "vitest";
import type { TimerSessionRecord } from "@/types/database";
import {
  buildTimerSessionFromActive,
  createActiveTimerRecord,
  formatTimerDuration,
  getActiveTimerElapsedSeconds,
  getCountdownRemainingSeconds,
  getTimerDailySummary,
  getTimerWeeklySummary,
  pauseActiveTimer,
  resumeActiveTimer,
  shouldRequireLongSessionDecision,
} from "@/lib/domain/timer";

const START = "2026-06-11T12:00:00.000Z";

describe("timer domain", () => {
  it("calcula tempo decorrido por timestamps, não por ticks persistidos", () => {
    const active = createActiveTimerRecord(
      {
        mode: "countdown",
        sourceType: "plan_block",
        sourceId: "block-1",
        category: "js",
        title: "Closure",
        targetDurationSeconds: 25 * 60,
      },
      START,
    );

    expect(getActiveTimerElapsedSeconds(active, "2026-06-11T12:10:10.000Z")).toBe(610);
    expect(getCountdownRemainingSeconds(active, "2026-06-11T12:10:10.000Z")).toBe(890);
  });

  it("pausa e retoma preservando o acumulado", () => {
    const active = createActiveTimerRecord(
      {
        mode: "stopwatch",
        sourceType: "review",
        sourceId: "review-1",
        category: "algo",
        title: "Revisão de heap",
      },
      START,
    );

    const paused = pauseActiveTimer(active, "2026-06-11T12:05:00.000Z");
    const resumed = resumeActiveTimer(paused, "2026-06-11T12:07:00.000Z");

    expect(paused.accumulatedSeconds).toBe(300);
    expect(resumed.pausedAt).toBeUndefined();
    expect(getActiveTimerElapsedSeconds(resumed, "2026-06-11T12:10:00.000Z")).toBe(480);
  });

  it("gera sessão histórica apenas ao concluir ou parar", () => {
    const active = createActiveTimerRecord(
      {
        mode: "countdown",
        sourceType: "quiz_session",
        sourceId: "quiz-1",
        category: "system",
        title: "Quiz System Design",
        targetDurationSeconds: 45 * 60,
        notes: "Sessão planejada",
      },
      START,
    );

    const session = buildTimerSessionFromActive(active, {
      status: "stopped_early",
      endedAt: "2026-06-11T12:30:00.000Z",
    });

    expect(session).toMatchObject({
      sourceType: "quiz_session",
      sourceId: "quiz-1",
      category: "system",
      title: "Quiz System Design",
      status: "stopped_early",
      actualDurationSeconds: 30 * 60,
      targetDurationSeconds: 45 * 60,
      date: "2026-06-11",
      notes: "Sessão planejada",
    });
    expect(session.id).toMatch(/^timer-session:/);
  });

  it("resume tempo oficial por dia e semana ignorando sessões canceladas", () => {
    const sessions: TimerSessionRecord[] = [
      makeSession("1", "2026-06-08", 25 * 60, "completed"),
      makeSession("2", "2026-06-11", 45 * 60, "completed"),
      makeSession("3", "2026-06-11", 10 * 60, "stopped_early"),
      makeSession("4", "2026-06-11", 90 * 60, "cancelled"),
      makeSession("5", "2026-06-15", 60 * 60, "completed"),
    ];

    expect(getTimerDailySummary(sessions, "2026-06-11")).toEqual({
      totalSeconds: 55 * 60,
      sessionCount: 2,
      averageSessionSeconds: Math.round((55 * 60) / 2),
    });
    expect(getTimerWeeklySummary(sessions, "2026-06-08", "2026-06-14")).toMatchObject({
      totalSeconds: 80 * 60,
      sessionCount: 3,
    });
  });

  it("formata durações compactas e detecta sessões longas restauradas", () => {
    const active = createActiveTimerRecord(
      {
        mode: "stopwatch",
        sourceType: "manual",
        category: "general",
        title: "Estudo livre",
      },
      START,
    );

    expect(formatTimerDuration(65)).toBe("01:05");
    expect(formatTimerDuration(3661)).toBe("1h 01m");
    expect(shouldRequireLongSessionDecision(active, "2026-06-11T17:00:01.000Z", 4 * 60 * 60)).toBe(
      true,
    );
  });
});

function makeSession(
  id: string,
  date: string,
  seconds: number,
  status: TimerSessionRecord["status"],
): TimerSessionRecord {
  return {
    id,
    sourceType: "manual",
    category: "general",
    title: `Sessão ${id}`,
    mode: "stopwatch",
    status,
    actualDurationSeconds: seconds,
    startedAt: `${date}T12:00:00.000Z`,
    endedAt: `${date}T12:30:00.000Z`,
    date,
    createdAt: `${date}T12:30:00.000Z`,
    updatedAt: `${date}T12:30:00.000Z`,
  };
}
