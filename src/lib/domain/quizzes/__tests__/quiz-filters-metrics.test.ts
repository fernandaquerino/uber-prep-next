import { describe, expect, it } from "vitest";
import { applyQuizQuestionFilters } from "../quiz-filters";
import { getQuizTopicMetrics, getWeakQuizTopics } from "../quiz-metrics";
import type { QuizAnswerRecord, QuizQuestionRecord } from "@/types/database";

function question(id: string, topic = "Set"): QuizQuestionRecord {
  return {
    id,
    prompt: `Pergunta ${id}`,
    type: "single_choice",
    category: "js",
    difficulty: "easy",
    topicIds: [topic],
    tags: [topic.toLowerCase()],
    sourceType: "seed",
    lifecycleStatus: "active",
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
  };
}

function answer(id: string, questionId: string, score: number): QuizAnswerRecord {
  return {
    id,
    sessionId: "s1",
    questionId,
    answer: null,
    isSubmitted: true,
    isCorrect: score === 1,
    score,
    timeSeconds: 10,
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
  };
}

describe("quiz filters and metrics", () => {
  it("filters marked and unanswered questions from context", () => {
    const questions = [question("a"), question("b")];
    expect(
      applyQuizQuestionFilters(
        questions,
        { markedOnly: true },
        { markedQuestionIds: new Set(["b"]) },
      ).map((q) => q.id),
    ).toEqual(["b"]);
    expect(
      applyQuizQuestionFilters(
        questions,
        { unansweredOnly: true },
        { answeredQuestionIds: new Set(["a"]) },
      ).map((q) => q.id),
    ).toEqual(["b"]);
  });

  it("returns null accuracy with less than three answers", () => {
    const metrics = getQuizTopicMetrics([question("a")], [answer("a1", "a", 1)]);
    expect(metrics[0]?.accuracy).toBeNull();
  });

  it("detects weak topics with enough evidence", () => {
    const questions = [question("a"), question("b"), question("c")];
    const metrics = getQuizTopicMetrics(questions, [
      answer("a1", "a", 0),
      answer("b1", "b", 0.5),
      answer("c1", "c", 1),
    ]);
    expect(getWeakQuizTopics(metrics)[0]?.topicId).toBe("Set");
  });
});
