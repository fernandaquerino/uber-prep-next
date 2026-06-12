import { describe, expect, it } from "vitest";
import { buildDeterministicDailyQuestionIds } from "../quiz-daily";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { QuizQuestionRecord } from "@/types/database";

function question(id: string): QuizQuestionRecord {
  return {
    id,
    prompt: id,
    type: "single_choice",
    category: "js",
    difficulty: "easy",
    topicIds: [id],
    tags: [],
    sourceType: "seed",
    lifecycleStatus: "active",
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
  };
}

describe("buildDeterministicDailyQuestionIds", () => {
  it("returns stable ids for the same date", () => {
    const questions = ["a", "b", "c", "d"].map(question);
    const date = "2026-06-11" as CalendarDate;
    expect(buildDeterministicDailyQuestionIds(questions, date, 3)).toEqual(
      buildDeterministicDailyQuestionIds(questions, date, 3),
    );
  });

  it("prioritizes due/error/marked ids without duplicates", () => {
    const questions = ["a", "b", "c", "d"].map(question);
    const result = buildDeterministicDailyQuestionIds(questions, "2026-06-11" as CalendarDate, 3, [
      "c",
      "c",
      "missing",
    ]);
    expect(result[0]).toBe("c");
    expect(new Set(result).size).toBe(result.length);
  });
});
