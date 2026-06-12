import type { UberPrepDatabase } from "@/lib/db/schema";
import { calculateQuizSessionScore } from "@/lib/domain/quizzes";
import type { QuizAttemptRecord } from "@/types/database";

export async function finishQuizSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<QuizAttemptRecord> {
  const session = await db.quizSessions.get(sessionId);
  if (!session) throw new Error(`Quiz session not found: ${sessionId}`);
  const answers = await db.quizAnswers.where("sessionId").equals(sessionId).toArray();
  const score = calculateQuizSessionScore(answers, session.questionIds.length);
  const now = new Date().toISOString();
  const started = new Date(session.startedAt).getTime();
  const finished = new Date(now).getTime();
  const totalTimeSeconds = Math.max(0, Math.round((finished - started) / 1000));

  const attempt: QuizAttemptRecord = {
    id: `quiz-attempt:${sessionId}`,
    quizId: session.id,
    dailyDate: session.dailyDate ?? null,
    attemptNumber: 1,
    mode: session.type,
    questionIds: session.questionIds,
    startedAt: session.startedAt,
    finishedAt: now,
    createdAt: now,
    totalQuestions: score.totalQuestions,
    correctAnswers: score.correct,
    wrongAnswers: score.incorrect,
    skippedAnswers: score.unanswered,
    accuracyPercentage: score.percentage,
    totalTimeSeconds,
    averageTimePerQuestion:
      score.answeredQuestions > 0 ? Math.round(totalTimeSeconds / score.answeredQuestions) : 0,
  };

  await db.transaction("rw", db.quizSessions, db.quizAttempts, async () => {
    await db.quizSessions.put({
      ...session,
      status: "completed",
      completedAt: now,
      updatedAt: now,
      elapsedSeconds: totalTimeSeconds,
    });
    await db.quizAttempts.put(attempt);
  });

  return attempt;
}
