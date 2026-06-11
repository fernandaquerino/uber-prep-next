import type { QuizAttemptRecord, QuizReviewRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface QuizzesRepository {
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
