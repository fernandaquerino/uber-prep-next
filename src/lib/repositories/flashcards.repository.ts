import type { FlashcardRecord, FlashcardStatus } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface FlashcardsRepository {
  findById(id: string): Promise<FlashcardRecord | undefined>;
  list(): Promise<FlashcardRecord[]>;
  listActive(): Promise<FlashcardRecord[]>;
  listArchived(): Promise<FlashcardRecord[]>;
  listByStatus(status: FlashcardStatus): Promise<FlashcardRecord[]>;
  listDue(today: string): Promise<FlashcardRecord[]>;
  upsert(record: FlashcardRecord): Promise<void>;
  bulkAdd(records: FlashcardRecord[]): Promise<void>;
  bulkUpsert(records: FlashcardRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  existsById(id: string): Promise<boolean>;
}

export function createFlashcardsRepository(db: UberPrepDatabase): FlashcardsRepository {
  async function findById(id: string): Promise<FlashcardRecord | undefined> {
    try {
      return await db.flashcards.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get flashcard ${id}`, err);
    }
  }

  async function list(): Promise<FlashcardRecord[]> {
    try {
      return await db.flashcards.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list flashcards", err);
    }
  }

  async function listByStatus(status: FlashcardStatus): Promise<FlashcardRecord[]> {
    try {
      return await db.flashcards.where("status").equals(status).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list flashcards by status ${status}`, err);
    }
  }

  async function listDue(today: string): Promise<FlashcardRecord[]> {
    try {
      return await db.flashcards
        .filter(
          (c) =>
            c.lifecycleStatus !== "archived" &&
            c.status !== "known" &&
            (!c.nextReview || c.nextReview <= today),
        )
        .toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list due flashcards", err);
    }
  }

  async function listActive(): Promise<FlashcardRecord[]> {
    try {
      return await db.flashcards
        .filter((c) => c.lifecycleStatus !== "archived")
        .toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list active flashcards", err);
    }
  }

  async function listArchived(): Promise<FlashcardRecord[]> {
    try {
      return await db.flashcards
        .where("lifecycleStatus")
        .equals("archived")
        .toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list archived flashcards", err);
    }
  }

  async function upsert(record: FlashcardRecord): Promise<void> {
    try {
      await db.flashcards.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert flashcard ${record.id}`, err);
    }
  }

  async function bulkAdd(records: FlashcardRecord[]): Promise<void> {
    try {
      await db.flashcards.bulkAdd(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk add flashcards", err);
    }
  }

  async function bulkUpsert(records: FlashcardRecord[]): Promise<void> {
    try {
      await db.flashcards.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert flashcards", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.flashcards.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete flashcard ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.flashcards.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear flashcards", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.flashcards.count();
    } catch (err) {
      throw new DatabaseError("Failed to count flashcards", err);
    }
  }

  async function existsById(id: string): Promise<boolean> {
    try {
      return (await db.flashcards.get(id)) !== undefined;
    } catch (err) {
      throw new DatabaseError(`Failed to check flashcard existence ${id}`, err);
    }
  }

  return {
    findById,
    list,
    listActive,
    listArchived,
    listByStatus,
    listDue,
    upsert,
    bulkAdd,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
    existsById,
  };
}
