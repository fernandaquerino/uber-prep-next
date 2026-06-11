import { describe, it, expect } from "vitest";
import {
  isReviewDue,
  isReviewOverdue,
  getDaysOverdue,
  getReviewTimingStatus,
  isReviewActive,
} from "../review-selectors";
import type { ReviewRecord } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";

const today = "2026-06-11" as CalendarDate;

function makeReview(
  scheduledFor: string,
  status: ReviewRecord["status"] = "scheduled",
): ReviewRecord {
  return {
    id: "r1",
    sourceType: "plan",
    sourceId: "b1",
    status,
    scheduledFor,
    cycleIndex: 0,
    history: [],
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  };
}

describe("isReviewActive", () => {
  it("scheduled and due are active", () => {
    expect(isReviewActive(makeReview(today, "scheduled"))).toBe(true);
    expect(isReviewActive(makeReview(today, "due"))).toBe(true);
  });

  it("completed, dismissed, cancelled are not active", () => {
    expect(isReviewActive(makeReview(today, "completed"))).toBe(false);
    expect(isReviewActive(makeReview(today, "dismissed"))).toBe(false);
    expect(isReviewActive(makeReview(today, "cancelled"))).toBe(false);
  });
});

describe("isReviewDue", () => {
  it("due today → true", () => {
    expect(isReviewDue(makeReview(today), today)).toBe(true);
  });

  it("past date → true", () => {
    expect(isReviewDue(makeReview("2026-06-08"), today)).toBe(true);
  });

  it("future date → false", () => {
    expect(isReviewDue(makeReview("2026-06-15"), today)).toBe(false);
  });

  it("completed review → false", () => {
    expect(isReviewDue(makeReview(today, "completed"), today)).toBe(false);
  });
});

describe("isReviewOverdue", () => {
  it("past date → true", () => {
    expect(isReviewOverdue(makeReview("2026-06-08"), today)).toBe(true);
  });

  it("today → false (due today, not overdue)", () => {
    expect(isReviewOverdue(makeReview(today), today)).toBe(false);
  });

  it("future → false", () => {
    expect(isReviewOverdue(makeReview("2026-06-15"), today)).toBe(false);
  });
});

describe("getDaysOverdue", () => {
  it("today → 0", () => {
    expect(getDaysOverdue(makeReview(today), today)).toBe(0);
  });

  it("3 days ago → 3", () => {
    expect(getDaysOverdue(makeReview("2026-06-08"), today)).toBe(3);
  });

  it("future → 0 (not negative)", () => {
    expect(getDaysOverdue(makeReview("2026-06-15"), today)).toBe(0);
  });
});

describe("getReviewTimingStatus", () => {
  it("today → due_today", () => {
    expect(getReviewTimingStatus(makeReview(today), today)).toBe("due_today");
  });

  it("past → overdue", () => {
    expect(getReviewTimingStatus(makeReview("2026-06-08"), today)).toBe("overdue");
  });

  it("future → upcoming", () => {
    expect(getReviewTimingStatus(makeReview("2026-06-15"), today)).toBe("upcoming");
  });
});
