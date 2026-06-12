import type { UberPrepDatabase } from "@/lib/db/schema";

export async function markQuestion(db: UberPrepDatabase, questionId: string): Promise<void> {
  await db.quizMarkedQuestions.put({
    id: `quiz-mark:${questionId}`,
    questionId,
    createdAt: new Date().toISOString(),
  });
}

export async function unmarkQuestion(db: UberPrepDatabase, questionId: string): Promise<void> {
  await db.quizMarkedQuestions.delete(`quiz-mark:${questionId}`);
}
