import { describe, it, expect } from "vitest";
import { getReviewPriority } from "../review-priority";
import type { ReviewRecord } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";

const today = "2026-06-11" as CalendarDate;

function makeReview(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    id: "rev-1",
    sourceType: "plan",
    sourceId: "block-1",
    status: "scheduled",
    scheduledFor: today,
    cycleIndex: 0,
    history: [],
    createdAt: "2026-06-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    ...overrides,
  };
}

describe("getReviewPriority", () => {
  it("due today with no history → medium", () => {
    const r = makeReview({ scheduledFor: today });
    expect(getReviewPriority(r, today)).toBe("medium");
  });

  it("3 days overdue → high", () => {
    const r = makeReview({ scheduledFor: "2026-06-08" as CalendarDate });
    expect(getReviewPriority(r, today)).toBe("high");
  });

  it("8 days overdue → critical", () => {
    const r = makeReview({ scheduledFor: "2026-06-03" as CalendarDate });
    expect(getReviewPriority(r, today)).toBe("critical");
  });

  it("3 failures (again) → critical regardless of days", () => {
    const r = makeReview({
      scheduledFor: today,
      history: [
        { date: "2026-06-01", result: "again" },
        { date: "2026-06-02", result: "again" },
        { date: "2026-06-03", result: "again" },
      ],
    });
    expect(getReviewPriority(r, today)).toBe("critical");
  });

  it("last result again → high", () => {
    const r = makeReview({ scheduledFor: today, lastResult: "again" });
    expect(getReviewPriority(r, today)).toBe("high");
  });

  it("low_confidence reason → high", () => {
    const r = makeReview({ scheduledFor: today, reason: "low_confidence" });
    expect(getReviewPriority(r, today)).toBe("high");
  });

  it("stuck reason and due today → medium", () => {
    const r = makeReview({ scheduledFor: today, reason: "stuck" });
    expect(getReviewPriority(r, today)).toBe("medium");
  });

  it("stuck reason and 4 days overdue → critical", () => {
    const r = makeReview({ scheduledFor: "2026-06-07" as CalendarDate, reason: "stuck" });
    expect(getReviewPriority(r, today)).toBe("critical");
  });

  it("high_difficulty reason → medium", () => {
    const r = makeReview({ scheduledFor: today, reason: "high_difficulty" });
    expect(getReviewPriority(r, today)).toBe("medium");
  });

  it("future review → low", () => {
    const r = makeReview({ scheduledFor: "2026-06-15" as CalendarDate });
    expect(getReviewPriority(r, today)).toBe("low");
  });
});
