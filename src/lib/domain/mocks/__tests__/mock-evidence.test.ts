import { describe, it, expect } from "vitest";
import { generateMockEvidence, getGapEvidence, getStrengthEvidence } from "../mock-evidence";
import type { MockRecord, MockRubricResult, RubricRating } from "@/types/database";

function makeMock(overrides: Partial<MockRecord> = {}): MockRecord {
  return {
    id: "mock-1",
    date: "2026-06-11",
    type: "coding",
    status: "completed",
    title: "Two Sum",
    prompt: "Given an array…",
    response: "HashMap approach",
    strengths: [],
    weaknesses: [],
    nextSteps: [],
    hasAudio: false,
    createdAt: "2026-06-11T10:00:00.000Z",
    updatedAt: "2026-06-11T10:00:00.000Z",
    ...overrides,
  };
}

function makeRubricResult(ratings: Array<[string, RubricRating]>): MockRubricResult {
  return {
    rubricDefinitionId: "rubric-coding",
    version: 1,
    criteria: ratings.map(([id, rating]) => ({ id, label: id, rating })),
    score: null,
  };
}

describe("generateMockEvidence", () => {
  it("generates no evidence when no rubric and no strengths/weaknesses", () => {
    const mock = makeMock();
    const evidence = generateMockEvidence(mock);
    expect(evidence).toHaveLength(0);
  });

  it("generates strength evidence for criteria rated >= 4", () => {
    const mock = makeMock({
      rubricResult: makeRubricResult([
        ["clarified-requirements", 5],
        ["identified-pattern", 3], // not strong enough
      ]),
    });
    const evidence = generateMockEvidence(mock);
    const strengths = getStrengthEvidence(evidence);
    expect(strengths).toHaveLength(1);
    expect(strengths[0]?.criterionId).toBe("clarified-requirements");
  });

  it("generates gap evidence for criteria rated <= 2", () => {
    const mock = makeMock({
      rubricResult: makeRubricResult([
        ["edge-cases", 1],
        ["thinking-aloud", 2],
        ["correct-implementation", 3], // not a gap
      ]),
    });
    const evidence = generateMockEvidence(mock);
    const gaps = getGapEvidence(evidence);
    expect(gaps).toHaveLength(2);
  });

  it("excludes criteria with rating 0 (not evaluated)", () => {
    const mock = makeMock({
      rubricResult: makeRubricResult([
        ["clarified-requirements", 0],
        ["identified-pattern", 0],
      ]),
    });
    const evidence = generateMockEvidence(mock);
    expect(evidence).toHaveLength(0);
  });

  it("generates evidence from explicit strengths array", () => {
    const mock = makeMock({ strengths: ["Great communication", ""] }); // empty string should be filtered
    const evidence = generateMockEvidence(mock);
    const strengths = getStrengthEvidence(evidence);
    expect(strengths).toHaveLength(1);
    expect(strengths[0]?.description).toBe("Great communication");
    expect(strengths[0]?.kind).toBe("strength");
  });

  it("generates evidence from explicit weaknesses array", () => {
    const mock = makeMock({ weaknesses: ["Edge cases missed"] });
    const evidence = generateMockEvidence(mock);
    const gaps = getGapEvidence(evidence);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]?.kind).toBe("gap");
  });

  it("sets correct area for system_design mocks", () => {
    const mock = makeMock({
      type: "system_design",
      strengths: ["Good architecture"],
    });
    const evidence = generateMockEvidence(mock);
    expect(evidence[0]?.area).toBe("system");
  });

  it("sets correct area for behavioral mocks", () => {
    const mock = makeMock({ type: "behavioral", strengths: ["Clear STAR structure"] });
    const evidence = generateMockEvidence(mock);
    expect(evidence[0]?.area).toBe("behavioral");
  });
});
