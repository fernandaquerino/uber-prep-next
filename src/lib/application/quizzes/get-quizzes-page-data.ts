import type { UberPrepDatabase } from "@/lib/db/schema";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { QuizAnswerRecord, QuizQuestionRecord, QuizSessionRecord } from "@/types/database";
import { getQuizTopicMetrics, getWeakQuizTopics } from "@/lib/domain/quizzes";

export type QuizzesPageData = {
  today: CalendarDate;
  questions: QuizQuestionRecord[];
  answers: QuizAnswerRecord[];
  sessions: QuizSessionRecord[];
  inProgressSessions: QuizSessionRecord[];
  markedQuestionIds: Set<string>;
  answeredQuestionIds: Set<string>;
  wrongQuestionIds: Set<string>;
  dueQuestionIds: Set<string>;
  summary: {
    activeQuestions: number;
    answeredQuestions: number;
    accuracy: number | null;
    dueReviews: number;
    wrongQuestions: number;
    markedQuestions: number;
    completedSessions: number;
    insufficientSample: boolean;
  };
  metrics: ReturnType<typeof getQuizTopicMetrics>;
  weakTopics: ReturnType<typeof getWeakQuizTopics>;
};

export async function getQuizzesPageData(
  db: UberPrepDatabase,
  today: CalendarDate,
): Promise<QuizzesPageData> {
  const [questions, answers, sessions, markedQuestions, reviews] = await Promise.all([
    db.quizQuestions.toArray(),
    db.quizAnswers.toArray(),
    db.quizSessions.orderBy("updatedAt").reverse().toArray(),
    db.quizMarkedQuestions.toArray(),
    db.reviews.where("sourceType").equals("quiz").toArray(),
  ]);

  const submitted = answers.filter((answer) => answer.isSubmitted);
  const answeredQuestionIds = new Set(submitted.map((answer) => answer.questionId));
  const wrongQuestionIds = new Set(
    submitted.filter((answer) => (answer.score ?? 0) < 1).map((answer) => answer.questionId),
  );
  const dueQuestionIds = new Set(
    reviews
      .filter(
        (review) =>
          (review.status === "scheduled" || review.status === "due") &&
          review.scheduledFor <= today,
      )
      .map((review) => review.sourceId),
  );
  const markedQuestionIds = new Set(markedQuestions.map((item) => item.questionId));
  const scoreTotal = submitted.reduce((sum, answer) => sum + (answer.score ?? 0), 0);
  const activeQuestions = questions.filter((question) => question.lifecycleStatus === "active");
  const completedSessions = sessions.filter((session) => session.status === "completed");
  const metrics = getQuizTopicMetrics(questions, answers);

  return {
    today,
    questions,
    answers,
    sessions,
    inProgressSessions: sessions.filter((session) => session.status === "in_progress"),
    markedQuestionIds,
    answeredQuestionIds,
    wrongQuestionIds,
    dueQuestionIds,
    summary: {
      activeQuestions: activeQuestions.length,
      answeredQuestions: answeredQuestionIds.size,
      accuracy: submitted.length >= 3 ? scoreTotal / submitted.length : null,
      dueReviews: dueQuestionIds.size,
      wrongQuestions: wrongQuestionIds.size,
      markedQuestions: markedQuestionIds.size,
      completedSessions: completedSessions.length,
      insufficientSample: submitted.length < 3,
    },
    metrics,
    weakTopics: getWeakQuizTopics(metrics),
  };
}
