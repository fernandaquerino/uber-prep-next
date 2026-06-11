import type { LearningJournalRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface LearningJournalRepository {
  findByDate(date: string): Promise<LearningJournalRecord | undefined>;
  listAll(): Promise<LearningJournalRecord[]>;
  upsert(record: LearningJournalRecord): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createLearningJournalRepository(db: UberPrepDatabase): LearningJournalRepository {
  async function findByDate(date: string): Promise<LearningJournalRecord | undefined> {
    try {
      return await db.learningJournal.where("date").equals(date).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get journal entry for ${date}`, err);
    }
  }

  async function listAll(): Promise<LearningJournalRecord[]> {
    try {
      return await db.learningJournal.orderBy("date").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list journal entries", err);
    }
  }

  async function upsert(record: LearningJournalRecord): Promise<void> {
    try {
      await db.learningJournal.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert journal entry ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.learningJournal.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete journal entry ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.learningJournal.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear learning journal", err);
    }
  }

  return { findByDate, listAll, upsert, delete: delete_, clear };
}
