import { describe, it, expect } from "vitest";
import { calculateMockScore, formatMockScore, getRubricStats } from "../mock-score";
import type { MockRubricResult, RubricRating } from "@/types/database";

function makeRubricResult(ratings: RubricRating[]): MockRubricResult {
  return {
    rubricDefinitionId: "rubric-coding",
    version: 1,
    criteria: ratings.map((r, i) => ({ id: `c${i}`, label: `Criterion ${i}`, rating: r })),
    score: null,
  };
}

describe("calculateMockScore", () => {
  it("returns null when all criteria are 0 (not evaluated)", () => {
    const result = makeRubricResult([0, 0, 0]);
    expect(calculateMockScore(result)).toBeNull();
  });

  it("excludes criteria with rating 0 from average", () => {
    // Only [4, 4] are evaluated — avg = 4, score = 4/5*100 = 80
    const result = makeRubricResult([0, 4, 4, 0]);
    expect(calculateMockScore(result)).toBe(80);
  });

  it("calculates correct score for all 5s", () => {
    const result = makeRubricResult([5, 5, 5, 5]);
    expect(calculateMockScore(result)).toBe(100);
  });

  it("calculates correct score for partial evaluation", () => {
    // [3, 4] evaluated — avg = 3.5, score = 3.5/5*100 = 70
    const result = makeRubricResult([3, 4]);
    expect(calculateMockScore(result)).toBe(70);
  });

  it("rounds to nearest integer", () => {
    // [1, 2] evaluated — avg = 1.5, score = 1.5/5*100 = 30
    const result = makeRubricResult([1, 2]);
    expect(calculateMockScore(result)).toBe(30);
  });

  it("calculates correctly with single evaluated criterion", () => {
    // [5] — avg = 5, score = 100
    const result = makeRubricResult([0, 5]);
    expect(calculateMockScore(result)).toBe(100);
  });
});

describe("formatMockScore", () => {
  it("returns 'Não avaliado' for null", () => {
    expect(formatMockScore(null)).toBe("Não avaliado");
  });
  it("returns 'Não avaliado' for undefined", () => {
    expect(formatMockScore(undefined)).toBe("Não avaliado");
  });
  it("returns formatted percent string", () => {
    expect(formatMockScore(80)).toBe("80%");
  });
  it("returns '0%' for zero", () => {
    expect(formatMockScore(0)).toBe("0%");
  });
});

describe("getRubricStats", () => {
  it("returns correct counts and average", () => {
    const criteria = [
      { rating: 0 as RubricRating },
      { rating: 4 as RubricRating },
      { rating: 4 as RubricRating },
    ];
    const stats = getRubricStats(criteria);
    expect(stats.total).toBe(3);
    expect(stats.evaluatedCount).toBe(2);
    expect(stats.notEvaluatedCount).toBe(1);
    expect(stats.average).toBe(4);
    expect(stats.scorePercent).toBe(80);
  });

  it("returns null average when nothing evaluated", () => {
    const criteria = [{ rating: 0 as RubricRating }];
    const stats = getRubricStats(criteria);
    expect(stats.average).toBeNull();
    expect(stats.scorePercent).toBeNull();
  });
});
