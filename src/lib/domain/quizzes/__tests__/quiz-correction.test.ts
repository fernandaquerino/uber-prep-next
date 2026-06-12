import { describe, expect, it } from "vitest";
import {
  correctMultipleChoiceAnswer,
  correctQuizAnswer,
  correctSingleChoiceAnswer,
  correctTrueFalseAnswer,
} from "../quiz-correction";
import type { QuizQuestionRecord } from "@/types/database";

const baseQuestion: QuizQuestionRecord = {
  id: "q-test",
  prompt: "Pergunta",
  type: "single_choice",
  category: "js",
  difficulty: "easy",
  topicIds: ["Set"],
  tags: ["set"],
  sourceType: "seed",
  lifecycleStatus: "active",
  createdAt: "2026-06-11T00:00:00.000Z",
  updatedAt: "2026-06-11T00:00:00.000Z",
};

describe("quiz correction", () => {
  it("corrects single choice answers", () => {
    expect(correctSingleChoiceAnswer("a", "a").score).toBe(1);
    expect(correctSingleChoiceAnswer("b", "a").score).toBe(0);
  });

  it("corrects multiple choice only with exact set", () => {
    expect(correctMultipleChoiceAnswer(["b", "a"], ["a", "b"]).score).toBe(1);
    expect(correctMultipleChoiceAnswer(["a"], ["a", "b"]).score).toBe(0);
  });

  it("corrects true false answers", () => {
    expect(correctTrueFalseAnswer(true, true).isCorrect).toBe(true);
    expect(correctTrueFalseAnswer(false, true).isCorrect).toBe(false);
  });

  it("requires self assessment for open questions", () => {
    const result = correctQuizAnswer(
      { ...baseQuestion, type: "open_text" },
      { kind: "text", value: "x" },
    );
    expect(result.requiresSelfAssessment).toBe(true);
    expect(result.score).toBeNull();
  });

  it("scores self assessment separately from objective correction", () => {
    const result = correctQuizAnswer(
      { ...baseQuestion, type: "interview" },
      { kind: "text", value: "long answer" },
      "partial",
    );
    expect(result.requiresSelfAssessment).toBe(false);
    expect(result.score).toBe(0.5);
  });
});
