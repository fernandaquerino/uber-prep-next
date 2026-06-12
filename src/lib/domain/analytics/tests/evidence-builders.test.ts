// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildEvidenceRecords, type EvidenceSourceData } from "../evidence-builders";

function emptyData(): EvidenceSourceData {
  return {
    plan: {
      id: "test-plan",
      title: "Test",
      version: 1,
      days: [
        {
          id: "day-1",
          sequence: 1,
          title: "Arrays",
          blocks: [
            {
              id: "block-1",
              title: "HashMap e Arrays",
              category: "algo",
              estimatedMinutes: 60,
              type: "exercicio",
            },
          ],
        },
      ],
    },
    planProgress: [],
    reviews: [],
    flashcards: [],
    quizQuestions: [],
    quizAnswers: [],
    playgroundSolutions: [],
    timerSessions: [],
    mockEvidence: [],
    notes: [],
    resources: [],
    resourceProgress: [],
    technicalEnglishItems: [],
    technicalEnglishPractices: [],
  };
}

describe("buildEvidenceRecords", () => {
  it("maps plan completion to canonical topics", () => {
    const data = emptyData();
    data.planProgress.push({
      id: "progress-1",
      blockId: "block-1",
      status: "completed",
      completedAt: "2026-06-11T12:00:00.000Z",
      createdAt: "2026-06-11T10:00:00.000Z",
      updatedAt: "2026-06-11T12:00:00.000Z",
    });

    const result = buildEvidenceRecords(data, "2026-06-12");

    expect(result.plannedTopicIds).toContain("arrays-hashing");
    expect(result.evidence.some((item) => item.topicId === "arrays-hashing")).toBe(true);
  });
});
