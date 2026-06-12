import type {
  QuizAnswerRecord,
  QuizAttemptRecord,
  QuizMarkedQuestionRecord,
  QuizQuestionRecord,
  QuizReviewRecord,
  QuizSessionRecord,
} from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface QuizzesRepository {
  // Questions
  findQuestionById(id: string): Promise<QuizQuestionRecord | undefined>;
  listQuestions(): Promise<QuizQuestionRecord[]>;
  upsertQuestion(record: QuizQuestionRecord): Promise<void>;
  bulkUpsertQuestions(records: QuizQuestionRecord[]): Promise<void>;

  // Sessions
  findSessionById(id: string): Promise<QuizSessionRecord | undefined>;
  listSessions(): Promise<QuizSessionRecord[]>;
  listInProgressSessions(): Promise<QuizSessionRecord[]>;
  upsertSession(record: QuizSessionRecord): Promise<void>;

  // Answers
  findAnswer(sessionId: string, questionId: string): Promise<QuizAnswerRecord | undefined>;
  listAnswersBySession(sessionId: string): Promise<QuizAnswerRecord[]>;
  listAnswers(): Promise<QuizAnswerRecord[]>;
  upsertAnswer(record: QuizAnswerRecord): Promise<void>;

  // Marked questions
  listMarkedQuestions(): Promise<QuizMarkedQuestionRecord[]>;
  markQuestion(record: QuizMarkedQuestionRecord): Promise<void>;
  unmarkQuestion(questionId: string): Promise<void>;

  // Attempts
  findAttemptById(id: string): Promise<QuizAttemptRecord | undefined>;
  listAttempts(): Promise<QuizAttemptRecord[]>;
  addAttempt(record: QuizAttemptRecord): Promise<void>;
  bulkAddAttempts(records: QuizAttemptRecord[]): Promise<void>;
  bulkUpsertAttempts(records: QuizAttemptRecord[]): Promise<void>;
  clearAttempts(): Promise<void>;
  countAttempts(): Promise<number>;

  // Reviews
  findReviewById(id: string): Promise<QuizReviewRecord | undefined>;
  listReviews(): Promise<QuizReviewRecord[]>;
  listDueReviews(today: string): Promise<QuizReviewRecord[]>;
  upsertReview(record: QuizReviewRecord): Promise<void>;
  bulkUpsertReviews(records: QuizReviewRecord[]): Promise<void>;
  clearReviews(): Promise<void>;
  countReviews(): Promise<number>;
}

export function createQuizzesRepository(db: UberPrepDatabase): QuizzesRepository {
  async function findQuestionById(id: string): Promise<QuizQuestionRecord | undefined> {
    try {
      return await db.quizQuestions.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get quiz question ${id}`, err);
    }
  }

  async function listQuestions(): Promise<QuizQuestionRecord[]> {
    try {
      return await db.quizQuestions.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list quiz questions", err);
    }
  }

  async function upsertQuestion(record: QuizQuestionRecord): Promise<void> {
    try {
      await db.quizQuestions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert quiz question ${record.id}`, err);
    }
  }

  async function bulkUpsertQuestions(records: QuizQuestionRecord[]): Promise<void> {
    try {
      await db.quizQuestions.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert quiz questions", err);
    }
  }

  async function findSessionById(id: string): Promise<QuizSessionRecord | undefined> {
    try {
      return await db.quizSessions.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get quiz session ${id}`, err);
    }
  }

  async function listSessions(): Promise<QuizSessionRecord[]> {
    try {
      return await db.quizSessions.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list quiz sessions", err);
    }
  }

  async function listInProgressSessions(): Promise<QuizSessionRecord[]> {
    try {
      return await db.quizSessions.where("status").equals("in_progress").toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list in-progress quiz sessions", err);
    }
  }

  async function upsertSession(record: QuizSessionRecord): Promise<void> {
    try {
      await db.quizSessions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert quiz session ${record.id}`, err);
    }
  }

  async function findAnswer(
    sessionId: string,
    questionId: string,
  ): Promise<QuizAnswerRecord | undefined> {
    try {
      return await db.quizAnswers
        .where("sessionId")
        .equals(sessionId)
        .filter((answer) => answer.questionId === questionId)
        .first();
    } catch (err) {
      throw new DatabaseError(`Failed to get answer for ${sessionId}/${questionId}`, err);
    }
  }

  async function listAnswersBySession(sessionId: string): Promise<QuizAnswerRecord[]> {
    try {
      return await db.quizAnswers.where("sessionId").equals(sessionId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list answers for session ${sessionId}`, err);
    }
  }

  async function listAnswers(): Promise<QuizAnswerRecord[]> {
    try {
      return await db.quizAnswers.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list quiz answers", err);
    }
  }

  async function upsertAnswer(record: QuizAnswerRecord): Promise<void> {
    try {
      await db.quizAnswers.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert quiz answer ${record.id}`, err);
    }
  }

  async function listMarkedQuestions(): Promise<QuizMarkedQuestionRecord[]> {
    try {
      return await db.quizMarkedQuestions.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list marked quiz questions", err);
    }
  }

  async function markQuestion(record: QuizMarkedQuestionRecord): Promise<void> {
    try {
      await db.quizMarkedQuestions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to mark quiz question ${record.questionId}`, err);
    }
  }

  async function unmarkQuestion(questionId: string): Promise<void> {
    try {
      await db.quizMarkedQuestions.delete(`quiz-mark:${questionId}`);
    } catch (err) {
      throw new DatabaseError(`Failed to unmark quiz question ${questionId}`, err);
    }
  }

  // ── Attempts ────────────────────────────────────────────────────────────────

  async function findAttemptById(id: string): Promise<QuizAttemptRecord | undefined> {
    try {
      return await db.quizAttempts.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get quiz attempt ${id}`, err);
    }
  }

  async function listAttempts(): Promise<QuizAttemptRecord[]> {
    try {
      return await db.quizAttempts.orderBy("createdAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list quiz attempts", err);
    }
  }

  async function addAttempt(record: QuizAttemptRecord): Promise<void> {
    try {
      await db.quizAttempts.add(record);
    } catch (err) {
      throw new DatabaseError(`Failed to add quiz attempt ${record.id}`, err);
    }
  }

  async function bulkAddAttempts(records: QuizAttemptRecord[]): Promise<void> {
    try {
      await db.quizAttempts.bulkAdd(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk add quiz attempts", err);
    }
  }

  async function bulkUpsertAttempts(records: QuizAttemptRecord[]): Promise<void> {
    try {
      await db.quizAttempts.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert quiz attempts", err);
    }
  }

  async function clearAttempts(): Promise<void> {
    try {
      await db.quizAttempts.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear quiz attempts", err);
    }
  }

  async function countAttempts(): Promise<number> {
    try {
      return await db.quizAttempts.count();
    } catch (err) {
      throw new DatabaseError("Failed to count quiz attempts", err);
    }
  }

  // ── Reviews ─────────────────────────────────────────────────────────────────

  async function findReviewById(id: string): Promise<QuizReviewRecord | undefined> {
    try {
      return await db.quizReviews.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get quiz review ${id}`, err);
    }
  }

  async function listReviews(): Promise<QuizReviewRecord[]> {
    try {
      return await db.quizReviews.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list quiz reviews", err);
    }
  }

  async function listDueReviews(today: string): Promise<QuizReviewRecord[]> {
    try {
      return await db.quizReviews
        .filter((r) => Boolean(r.nextReview && r.nextReview <= today))
        .toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list due quiz reviews", err);
    }
  }

  async function upsertReview(record: QuizReviewRecord): Promise<void> {
    try {
      await db.quizReviews.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert quiz review ${record.id}`, err);
    }
  }

  async function bulkUpsertReviews(records: QuizReviewRecord[]): Promise<void> {
    try {
      await db.quizReviews.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert quiz reviews", err);
    }
  }

  async function clearReviews(): Promise<void> {
    try {
      await db.quizReviews.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear quiz reviews", err);
    }
  }

  async function countReviews(): Promise<number> {
    try {
      return await db.quizReviews.count();
    } catch (err) {
      throw new DatabaseError("Failed to count quiz reviews", err);
    }
  }

  return {
    findQuestionById,
    listQuestions,
    upsertQuestion,
    bulkUpsertQuestions,
    findSessionById,
    listSessions,
    listInProgressSessions,
    upsertSession,
    findAnswer,
    listAnswersBySession,
    listAnswers,
    upsertAnswer,
    listMarkedQuestions,
    markQuestion,
    unmarkQuestion,
    findAttemptById,
    listAttempts,
    addAttempt,
    bulkAddAttempts,
    bulkUpsertAttempts,
    clearAttempts,
    countAttempts,
    findReviewById,
    listReviews,
    listDueReviews,
    upsertReview,
    bulkUpsertReviews,
    clearReviews,
    countReviews,
  };
}
