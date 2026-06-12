import type { QuizAnswerRecord, QuizQuestionRecord } from "@/types/database";
import type { QuizTopicMetrics, WeakQuizTopic } from "./quiz.types";

export function getQuizTopicMetrics(
  questions: QuizQuestionRecord[],
  answers: QuizAnswerRecord[],
): QuizTopicMetrics[] {
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const grouped = new Map<string, QuizAnswerRecord[]>();

  for (const answer of answers.filter((item) => item.isSubmitted)) {
    const question = questionById.get(answer.questionId);
    for (const topic of question?.topicIds ?? []) {
      grouped.set(topic, [...(grouped.get(topic) ?? []), answer]);
    }
  }

  return Array.from(grouped.entries()).map(([topicId, topicAnswers]) => {
    const correct = topicAnswers.filter((answer) => answer.score === 1).length;
    const partial = topicAnswers.filter((answer) => answer.score === 0.5).length;
    const incorrect = topicAnswers.filter((answer) => answer.score === 0).length;
    const answered = topicAnswers.length;
    const totalScore = topicAnswers.reduce((sum, answer) => sum + (answer.score ?? 0), 0);
    const totalTime = topicAnswers.reduce((sum, answer) => sum + answer.timeSeconds, 0);

    return {
      topicId,
      answered,
      correct,
      partial,
      incorrect,
      accuracy: answered >= 3 ? totalScore / answered : null,
      averageTimeSeconds: answered > 0 ? Math.round(totalTime / answered) : null,
      confidenceAverage: null,
    };
  });
}

export function getWeakQuizTopics(metrics: QuizTopicMetrics[]): WeakQuizTopic[] {
  return metrics
    .filter((metric) => metric.accuracy !== null && metric.accuracy < 0.7)
    .map((metric) => ({
      topicId: metric.topicId,
      score: Math.round((1 - (metric.accuracy ?? 0)) * 100),
      evidenceCount: metric.answered,
      reasons: [
        `${metric.incorrect} incorreta${metric.incorrect === 1 ? "" : "s"}`,
        metric.partial > 0 ? `${metric.partial} parcial${metric.partial === 1 ? "" : "is"}` : "",
      ].filter(Boolean),
    }))
    .sort((a, b) => b.score - a.score);
}
