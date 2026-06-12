import type { UberPrepDatabase } from "@/lib/db/schema";
import type { CalendarDate } from "@/lib/domain/schedule";
import {
  applyQuizQuestionFilters,
  buildDeterministicDailyQuestionIds,
  type QuizQuestionFilters,
} from "@/lib/domain/quizzes";
import type { QuizSessionConfigRecord, QuizSessionRecord, QuizSessionType } from "@/types/database";

function sessionId(): string {
  return `quiz-session:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

export type CreateQuizSessionInput = {
  type: QuizSessionType;
  today: CalendarDate;
  limit?: number;
  filters?: QuizQuestionFilters;
  questionIds?: string[];
};

export async function createQuizSession(
  db: UberPrepDatabase,
  input: CreateQuizSessionInput,
): Promise<QuizSessionRecord> {
  if (input.type === "daily") {
    const existing = await db.quizSessions
      .where("dailyDate")
      .equals(input.today)
      .filter((session) => session.status === "in_progress")
      .first();
    if (existing) return existing;
  }

  const questions = await db.quizQuestions.toArray();
  const submittedAnswers = await db.quizAnswers.filter((answer) => answer.isSubmitted).toArray();
  const reviews = await db.reviews.where("sourceType").equals("quiz").toArray();
  const marked = await db.quizMarkedQuestions.toArray();
  const answeredQuestionIds = new Set(submittedAnswers.map((answer) => answer.questionId));
  const wrongQuestionIds = new Set(
    submittedAnswers.filter((answer) => (answer.score ?? 0) < 1).map((answer) => answer.questionId),
  );
  const dueQuestionIds = new Set(
    reviews
      .filter(
        (review) =>
          (review.status === "scheduled" || review.status === "due") &&
          review.scheduledFor <= input.today,
      )
      .map((review) => review.sourceId),
  );
  const markedQuestionIds = new Set(marked.map((item) => item.questionId));

  let questionIds: string[];
  if (input.questionIds?.length) {
    questionIds = input.questionIds;
  } else if (input.type === "daily") {
    const priority = [
      ...Array.from(dueQuestionIds),
      ...Array.from(wrongQuestionIds),
      ...Array.from(markedQuestionIds),
    ];
    questionIds = buildDeterministicDailyQuestionIds(
      questions,
      input.today,
      input.limit ?? 10,
      priority,
    );
  } else {
    const filtered = applyQuizQuestionFilters(questions, input.filters ?? {}, {
      answeredQuestionIds,
      wrongQuestionIds,
      dueQuestionIds,
      markedQuestionIds,
    });
    questionIds = filtered.slice(0, input.limit ?? 10).map((question) => question.id);
  }

  const now = new Date().toISOString();
  const config: QuizSessionConfigRecord = {
    type: input.type,
    questionLimit: input.limit ?? questionIds.length,
    category: input.filters?.category,
    difficulty: input.filters?.difficulty,
    questionType: input.filters?.type,
    group: input.filters?.group,
    week: input.filters?.week,
    tag: input.filters?.tag,
    feedbackMode: "immediate",
  };
  const record: QuizSessionRecord = {
    id: sessionId(),
    type: input.type,
    status: "in_progress",
    dailyDate: input.type === "daily" ? input.today : undefined,
    questionIds,
    currentIndex: 0,
    config,
    startedAt: now,
    updatedAt: now,
    elapsedSeconds: 0,
  };

  await db.quizSessions.put(record);
  return record;
}
