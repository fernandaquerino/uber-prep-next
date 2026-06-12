import { describe, expect, it } from "vitest";
import { calculateQuizSessionScore } from "../quiz-scoring";
import type { QuizAnswerRecord } from "@/types/database";

function answer(id: string, score: number | null, submitted = true): QuizAnswerRecord {
  return {
    id,
    sessionId: "s1",
    questionId: id,
    answer: null,
    isSubmitted: submitted,
    isCorrect: score === null ? null : score === 1,
    score,
    timeSeconds: 0,
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
  };
}

describe("calculateQuizSessionScore", () => {
  it("does not count unanswered as incorrect", () => {
    const score = calculateQuizSessionScore([answer("a", 1), answer("b", 0.5)], 4);
    expect(score.correct).toBe(1);
    expect(score.partial).toBe(1);
    expect(score.incorrect).toBe(0);
    expect(score.unanswered).toBe(2);
    expect(score.percentage).toBe(38);
  });
});
