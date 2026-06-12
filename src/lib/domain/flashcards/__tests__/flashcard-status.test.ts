import { describe, it, expect } from "vitest";
import { getLearningState } from "../flashcard-status";
import type { FlashcardReviewSummary } from "../flashcard.types";

describe("getLearningState", () => {
  it("returns 'new' when summary is null", () => {
    expect(getLearningState(null)).toBe("new");
  });

  it("returns 'new' when historyLength is 0", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 0, historyLength: 0 };
    expect(getLearningState(summary)).toBe("new");
  });

  it("returns 'learning' when cycleIndex is 0", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 0, lastResult: "good", historyLength: 1 };
    expect(getLearningState(summary)).toBe("learning");
  });

  it("returns 'learning' when cycleIndex is 1", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 1, lastResult: "good", historyLength: 2 };
    expect(getLearningState(summary)).toBe("learning");
  });

  it("returns 'learning' when last result was 'again' regardless of cycleIndex", () => {
    const summary: FlashcardReviewSummary = {
      cycleIndex: 3,
      lastResult: "again",
      historyLength: 4,
    };
    expect(getLearningState(summary)).toBe("learning");
  });

  it("returns 'reviewing' when cycleIndex is 2", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 2, lastResult: "good", historyLength: 3 };
    expect(getLearningState(summary)).toBe("reviewing");
  });

  it("returns 'reviewing' when cycleIndex is 3", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 3, lastResult: "good", historyLength: 4 };
    expect(getLearningState(summary)).toBe("reviewing");
  });

  it("returns 'mastered' when cycleIndex >= 4", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 4, lastResult: "easy", historyLength: 5 };
    expect(getLearningState(summary)).toBe("mastered");
  });

  it("returns 'mastered' when cycleIndex is 5", () => {
    const summary: FlashcardReviewSummary = { cycleIndex: 5, lastResult: "easy", historyLength: 6 };
    expect(getLearningState(summary)).toBe("mastered");
  });
});
