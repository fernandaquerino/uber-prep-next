import { describe, it, expect } from "vitest";
import { buildReviewQueue } from "../review-queue";
import type { ReviewRecord } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";

const today = "2026-06-11" as CalendarDate;

function makeReview(
  id: string,
  scheduledFor: string,
  overrides: Partial<ReviewRecord> = {},
): ReviewRecord {
  return {
    id,
    sourceType: "plan",
    sourceId: `block-${id}`,
    status: "scheduled",
    scheduledFor,
    cycleIndex: 0,
    history: [],
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildReviewQueue", () => {
  it("excludes future reviews", () => {
    const reviews = [makeReview("r1", today), makeReview("r2", "2026-06-15")];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue.map((q) => q.reviewId)).toEqual(["r1"]);
  });

  it("excludes completed reviews", () => {
    const reviews = [makeReview("r1", today), makeReview("r2", today, { status: "completed" })];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue.map((q) => q.reviewId)).toEqual(["r1"]);
  });

  it("excludes cancelled reviews", () => {
    const reviews = [makeReview("r1", today), makeReview("r2", today, { status: "cancelled" })];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue.map((q) => q.reviewId)).toEqual(["r1"]);
  });

  it("includes both today and overdue reviews", () => {
    const reviews = [makeReview("r1", today), makeReview("r2", "2026-06-08")];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue).toHaveLength(2);
  });

  it("sorts overdue before due today (both high prio)", () => {
    const reviews = [
      makeReview("r1", today), // daysOverdue=0, medium
      makeReview("r2", "2026-06-04", { reason: "low_confidence" }), // daysOverdue=7, high
    ];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue[0].reviewId).toBe("r2");
  });

  it("resolves title from effective schedule", () => {
    const reviews = [makeReview("r1", today, { sourceId: "block-abc" })];
    const fakeDay: EffectiveScheduledDay = {
      date: today,
      weekday: "thursday",
      availableMinutes: 480,
      isRestDay: false,
      totalEstimatedMinutes: 60,
      remainingMinutes: 480,
      capacityStatus: "available",
      items: [
        {
          blockId: "block-abc",
          planDayId: "day-1",
          planDaySequence: 1,
          title: "Contains Duplicate",
          category: "algo",
          estimatedMinutes: 45,
          type: "exercicio",
          originalScheduledDate: today,
          scheduledDate: today,
          executionStatus: "pending",
          timingStatus: "today",
          isOverdue: false,
          isRescheduled: false,
        },
      ],
    };
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [fakeDay], today });
    expect(queue[0].title).toBe("Contains Duplicate");
    expect(queue[0].category).toBe("algo");
  });

  it("stable sort by id when all factors equal", () => {
    const reviews = [makeReview("z-id", today), makeReview("a-id", today)];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue[0].reviewId).toBe("a-id");
    expect(queue[1].reviewId).toBe("z-id");
  });

  it("attaches daysOverdue correctly", () => {
    const reviews = [makeReview("r1", "2026-06-08")];
    const queue = buildReviewQueue({ reviews, effectiveSchedule: [], today });
    expect(queue[0].daysOverdue).toBe(3);
  });
});
