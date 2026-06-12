import { describe, it, expect } from "vitest";
import { getDaysOverdue, isDueToday, buildFlashcardListItem } from "../flashcard-selectors";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { FlashcardRecord, ReviewRecord } from "@/types/database";

// CalendarDate brand used for today constant

const today: CalendarDate = "2026-06-11" as CalendarDate;

function makeCard(overrides: Partial<FlashcardRecord> = {}): FlashcardRecord {
  return {
    id: "card-1",
    front: "What is a closure?",
    back: "A function that captures lexical scope.",
    category: "js",
    tags: [],
    status: "pending",
    lifecycleStatus: "active",
    source: "user",
    nextReview: null,
    knownAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    reviews: [],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeReview(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    id: "flashcard-review:card-1",
    sourceType: "flashcard",
    sourceId: "card-1",
    status: "due",
    scheduledFor: today,
    cycleIndex: 1,
    lastResult: "good",
    lastRating: "good",
    history: [{ date: "2026-06-10", result: "good" }],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
    ...overrides,
  } as ReviewRecord;
}

describe("getDaysOverdue", () => {
  it("returns 0 when no next review", () => {
    expect(getDaysOverdue(null, today)).toBe(0);
  });

  it("returns 0 when review is today", () => {
    expect(getDaysOverdue("2026-06-11", today)).toBe(0);
  });

  it("returns 0 when review is in the future", () => {
    expect(getDaysOverdue("2026-06-15", today)).toBe(0);
  });

  it("returns days overdue when review is past", () => {
    expect(getDaysOverdue("2026-06-08", today)).toBe(3);
  });
});

describe("isDueToday", () => {
  it("returns false when no next review", () => {
    expect(isDueToday(null, today)).toBe(false);
  });

  it("returns true when review date is today", () => {
    expect(isDueToday("2026-06-11", today)).toBe(true);
  });

  it("returns true when review is overdue", () => {
    expect(isDueToday("2026-06-08", today)).toBe(true);
  });

  it("returns false when review is in future", () => {
    expect(isDueToday("2026-06-15", today)).toBe(false);
  });
});

describe("buildFlashcardListItem", () => {
  it("sets learningState 'new' when no review", () => {
    const item = buildFlashcardListItem(makeCard(), undefined, today);
    expect(item.learningState).toBe("new");
    expect(item.reviewCount).toBe(0);
  });

  it("sets learningState from review", () => {
    const review = makeReview({ cycleIndex: 1 });
    const item = buildFlashcardListItem(makeCard(), review, today);
    expect(item.learningState).toBe("learning");
  });

  it("sets mastered when cycleIndex >= 4", () => {
    const review = makeReview({ cycleIndex: 4, scheduledFor: "2026-07-11" });
    const item = buildFlashcardListItem(makeCard(), review, today);
    expect(item.learningState).toBe("mastered");
  });

  it("calculates daysOverdue from review scheduledFor", () => {
    const review = makeReview({ scheduledFor: "2026-06-08" });
    const item = buildFlashcardListItem(makeCard(), review, today);
    expect(item.daysOverdue).toBe(3);
    expect(item.isDueToday).toBe(true);
  });

  it("nextReviewDate is null when review is completed", () => {
    const review = makeReview({ status: "completed" });
    const item = buildFlashcardListItem(makeCard(), review, today);
    expect(item.nextReviewDate).toBeNull();
  });
});
