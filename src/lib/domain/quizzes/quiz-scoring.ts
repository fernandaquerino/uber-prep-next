import type { QuizAnswerRecord } from "@/types/database";
import type { QuizSessionScore } from "./quiz.types";

export function calculateQuizSessionScore(
  answers: QuizAnswerRecord[],
  totalQuestions: number,
): QuizSessionScore {
  const submitted = answers.filter((answer) => answer.isSubmitted);
  const score = submitted.reduce((sum, answer) => sum + (answer.score ?? 0), 0);
  const correct = submitted.filter((answer) => answer.score === 1).length;
  const partial = submitted.filter((answer) => answer.score === 0.5).length;
  const incorrect = submitted.filter((answer) => answer.score === 0).length;

  return {
    totalQuestions,
    answeredQuestions: submitted.length,
    correct,
    partial,
    incorrect,
    unanswered: Math.max(0, totalQuestions - submitted.length),
    score,
    percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    autoGradedCount: submitted.filter((answer) => answer.selfAssessment === undefined).length,
    selfAssessedCount: submitted.filter((answer) => answer.selfAssessment !== undefined).length,
  };
}
