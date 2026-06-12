// @vitest-environment node

import { describe, expect, it } from "vitest";
import type { EvidenceRecord } from "@/lib/domain/analytics";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import {
  buildWeeklyReport,
  compareWeeklyReports,
  type WeeklyReportWeek,
} from "@/lib/domain/reports";

function week(
  weekNumber: number,
  status: WeeklyReportWeek["status"],
  executionStatus: "pending" | "completed" = "pending",
): WeeklyReportWeek {
  const start = weekNumber === 1 ? "2026-06-08" : "2026-06-15";
  const end = weekNumber === 1 ? "2026-06-14" : "2026-06-21";
  const days: EffectiveScheduledDay[] = [
    {
      date: start as EffectiveScheduledDay["date"],
      weekday: "monday",
      availableMinutes: 480,
      isRestDay: false,
      totalEstimatedMinutes: 60,
      remainingMinutes: 420,
      capacityStatus: "available",
      items: [
        {
          blockId: `block-${weekNumber}`,
          planDayId: `day-${weekNumber}`,
          planDaySequence: weekNumber,
          title: "Big O",
          category: "algo",
          estimatedMinutes: 60,
          type: "study",
          originalScheduledDate: start as EffectiveScheduledDay["date"],
          scheduledDate: start as EffectiveScheduledDay["date"],
          executionStatus,
          timingStatus: status === "future" ? "future" : "past",
          isOverdue: status === "past" && executionStatus === "pending",
          isRescheduled: false,
          completedAt: executionStatus === "completed" ? `${start}T12:00:00.000Z` : undefined,
        },
      ],
    },
  ];
  return { weekNumber, weekStart: start, weekEnd: end, status, days };
}

function evidence(
  id: string,
  occurredAt: string,
  source: EvidenceRecord["source"],
  kind: EvidenceRecord["kind"],
  value?: number,
): EvidenceRecord {
  return {
    id,
    source,
    sourceId: id,
    category: "algo",
    topicId: "big-o",
    kind,
    value,
    weight: 1,
    occurredAt,
  };
}

describe("buildWeeklyReport", () => {
  it("builds current week metrics from period evidence and cumulative readiness", () => {
    const report = buildWeeklyReport({
      week: week(2, "current", "completed"),
      today: "2026-06-18",
      plannedTopicIds: ["big-o"],
      allEvidence: [
        evidence("old-quiz", "2026-06-10T12:00:00Z", "quiz", "success", 1),
        evidence("review", "2026-06-16T12:00:00Z", "review", "review", 0.8),
        evidence("quiz", "2026-06-17T12:00:00Z", "quiz", "success", 0.75),
        evidence("mock", "2026-06-18T12:00:00Z", "mock", "mock_strength", 1),
        evidence("time", "2026-06-18T12:00:00Z", "timer", "time", 3600),
      ],
      reflection: {
        id: "reflection:week-2",
        weekNumber: 2,
        wins: "Melhorei Big O",
        createdAt: "2026-06-18T00:00:00Z",
        updatedAt: "2026-06-18T00:00:00Z",
      },
    });

    expect(report.status).toBe("current");
    expect(report.metrics.completedBlocks).toBe(1);
    expect(report.metrics.actualSeconds).toBe(3600);
    expect(report.metrics.quizAccuracy).toBe(75);
    expect(report.metrics.evidenceCount).toBe(4);
    expect(report.readiness.score).not.toBeNull();
    expect(report.reflection.wins).toBe("Melhorei Big O");
  });

  it("keeps a future week planned without inventing execution metrics", () => {
    const report = buildWeeklyReport({
      week: week(2, "future"),
      today: "2026-06-12",
      plannedTopicIds: ["big-o"],
      allEvidence: [],
    });

    expect(report.status).toBe("future");
    expect(report.metrics.plannedBlocks).toBe(1);
    expect(report.metrics.actualSeconds).toBe(0);
    expect(report.metrics.quizAccuracy).toBeNull();
    expect(report.readiness.score).toBeNull();
    expect(report.isEmpty).toBe(true);
  });

  it("marks pending blocks from a past week as overdue and recommends recovery", () => {
    const report = buildWeeklyReport({
      week: week(1, "past"),
      today: "2026-06-18",
      plannedTopicIds: ["big-o"],
      allEvidence: [],
    });

    expect(report.metrics.overdueBlocks).toBe(1);
    expect(report.recommendations[0]?.id).toBe("recover-overdue");
  });

  it("compares two weeks without converting missing accuracy into zero", () => {
    const previous = buildWeeklyReport({
      week: week(1, "past", "completed"),
      today: "2026-06-18",
      plannedTopicIds: ["big-o"],
      allEvidence: [evidence("old", "2026-06-10T12:00:00Z", "timer", "time", 1800)],
    });
    const current = buildWeeklyReport({
      week: week(2, "current", "completed"),
      today: "2026-06-18",
      plannedTopicIds: ["big-o"],
      allEvidence: [evidence("new", "2026-06-16T12:00:00Z", "timer", "time", 3600)],
    });

    expect(compareWeeklyReports(current, previous)).toMatchObject({
      completedBlocksDelta: 0,
      actualSecondsDelta: 1800,
      quizAccuracyDelta: null,
    });
  });
});
