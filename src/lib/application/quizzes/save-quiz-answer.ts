import type { UberPrepDatabase } from "@/lib/db/schema";
import type { CalendarDate } from "@/lib/domain/schedule";
import { addCalendarDays } from "@/lib/domain/schedule";
import { correctQuizAnswer } from "@/lib/domain/quizzes";
import type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizSelfAssessment,
  ReviewRecord,
  ReviewResult,
} from "@/types/database";
import { calculateNextReviewDate, getNextCycleIndex, isCycleCompleted } from "@/lib/domain/reviews";

function answerId(sessionId: string, questionId: string): string {
  return `quiz-answer:${sessionId}:${questionId}`;
}

function reviewId(questionId: string): string {
  return `quiz-review:${questionId}`;
}

function historyId(): string {
  return `quiz-history:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function reviewResultFromScore(score: number | null): ReviewResult {
  if (score === 1) return "good";
  if (score === 0.5) return "hard";
  return "again";
}

async function upsertQuizReview(
  db: UberPrepDatabase,
  questionId: string,
  score: number | null,
  answeredOn: CalendarDate,
): Promise<void> {
  if (score === null) return;

  const now = new Date().toISOString();
  const id = reviewId(questionId);
  const existing = await db.reviews.get(id);
  const result = reviewResultFromScore(score);
  const currentCycleIndex = existing?.cycleIndex ?? 0;
  const nextCycleIndex = getNextCycleIndex(currentCycleIndex, result);
  const calculatedDate = calculateNextReviewDate({
    completedOn: answeredOn,
    currentCycleIndex,
    result,
  });
  const scheduledFor =
    score === 0
      ? addCalendarDays(answeredOn, 1)
      : score === 0.5
        ? addCalendarDays(answeredOn, 1)
        : calculatedDate;
  const completed = isCycleCompleted(nextCycleIndex);

  const historyEntry = {
    id: historyId(),
    date: now,
    result,
    previousCycleIndex: currentCycleIndex,
    nextCycleIndex,
    nextReviewAt: scheduledFor,
  };

  const record: ReviewRecord = {
    ...(existing ?? {
      id,
      sourceType: "quiz" as const,
      sourceId: questionId,
      originalScheduledFor: scheduledFor ?? answeredOn,
      history: [],
      createdAt: now,
    }),
    status: completed || !scheduledFor ? "completed" : "scheduled",
    scheduledFor: scheduledFor ?? existing?.scheduledFor ?? answeredOn,
    cycleIndex: nextCycleIndex,
    reason: score === 1 ? "future_quiz" : "failed_review",
    lastResult: result,
    lastRating: result,
    doneAt: now,
    history: [...(existing?.history ?? []), historyEntry],
    updatedAt: now,
  };

  await db.reviews.put(record);
}

export type SaveQuizAnswerInput = {
  sessionId: string;
  questionId: string;
  answer: QuizAnswerValue | null;
  draft?: string;
  selfAssessment?: QuizSelfAssessment;
  timeSeconds?: number;
  today: CalendarDate;
};

export async function saveQuizAnswer(
  db: UberPrepDatabase,
  input: SaveQuizAnswerInput,
): Promise<QuizAnswerRecord> {
  const [session, question, existing] = await Promise.all([
    db.quizSessions.get(input.sessionId),
    db.quizQuestions.get(input.questionId),
    db.quizAnswers.get(answerId(input.sessionId, input.questionId)),
  ]);
  if (!session) throw new Error(`Quiz session not found: ${input.sessionId}`);
  if (!question) throw new Error(`Quiz question not found: ${input.questionId}`);

  const correction = correctQuizAnswer(question, input.answer, input.selfAssessment);
  const now = new Date().toISOString();
  const record: QuizAnswerRecord = {
    id: answerId(input.sessionId, input.questionId),
    sessionId: input.sessionId,
    questionId: input.questionId,
    answer: input.answer,
    draft: input.draft,
    isSubmitted: !correction.requiresSelfAssessment,
    isCorrect: correction.isCorrect,
    score: correction.score,
    selfAssessment: input.selfAssessment,
    timeSeconds: input.timeSeconds ?? existing?.timeSeconds ?? 0,
    submittedAt: correction.requiresSelfAssessment ? undefined : now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.transaction("rw", db.quizAnswers, db.quizSessions, db.reviews, async () => {
    await db.quizAnswers.put(record);
    await db.quizSessions.put({
      ...session,
      currentIndex: Math.min(session.currentIndex + 1, Math.max(0, session.questionIds.length - 1)),
      updatedAt: now,
    });
    if (record.isSubmitted) {
      await upsertQuizReview(db, input.questionId, record.score, input.today);
    }
  });

  return record;
}
