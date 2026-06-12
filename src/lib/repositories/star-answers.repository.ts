import type { StarAnswer } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export function createStarAnswersRepository(db: UberPrepDatabase) {
  async function findByQuestionId(questionId: string): Promise<StarAnswer | undefined> {
    try {
      return await db.starAnswers.where("questionId").equals(questionId).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get star answer for question ${questionId}`, err);
    }
  }

  async function list(): Promise<StarAnswer[]> {
    try {
      return await db.starAnswers.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list star answers", err);
    }
  }

  async function upsert(record: StarAnswer): Promise<void> {
    try {
      await db.starAnswers.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert star answer ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.starAnswers.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete star answer ${id}`, err);
    }
  }

  return { findByQuestionId, list, upsert, delete: delete_ };
}
