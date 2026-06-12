import type { TechnicalEnglishRecord, TechnicalEnglishPracticeRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface TechnicalEnglishRepository {
  findById(id: string): Promise<TechnicalEnglishRecord | undefined>;
  list(): Promise<TechnicalEnglishRecord[]>;
  listByScenario(scenario: string): Promise<TechnicalEnglishRecord[]>;
  upsert(record: TechnicalEnglishRecord): Promise<void>;
  bulkUpsert(records: TechnicalEnglishRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export interface TechnicalEnglishPracticeRepository {
  findByItemId(itemId: string): Promise<TechnicalEnglishPracticeRecord[]>;
  listAll(): Promise<TechnicalEnglishPracticeRecord[]>;
  upsert(record: TechnicalEnglishPracticeRecord): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createTechnicalEnglishRepository(db: UberPrepDatabase): TechnicalEnglishRepository {
  async function findById(id: string): Promise<TechnicalEnglishRecord | undefined> {
    try {
      return await db.technicalEnglishItems.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get technical english item ${id}`, err);
    }
  }

  async function list(): Promise<TechnicalEnglishRecord[]> {
    try {
      return await db.technicalEnglishItems.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list technical english items", err);
    }
  }

  async function listByScenario(scenario: string): Promise<TechnicalEnglishRecord[]> {
    try {
      return await db.technicalEnglishItems.where("scenario").equals(scenario).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list items by scenario ${scenario}`, err);
    }
  }

  async function upsert(record: TechnicalEnglishRecord): Promise<void> {
    try {
      await db.technicalEnglishItems.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert technical english item ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: TechnicalEnglishRecord[]): Promise<void> {
    try {
      await db.technicalEnglishItems.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert technical english items", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.technicalEnglishItems.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete technical english item ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.technicalEnglishItems.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear technical english items", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.technicalEnglishItems.count();
    } catch (err) {
      throw new DatabaseError("Failed to count technical english items", err);
    }
  }

  return { findById, list, listByScenario, upsert, bulkUpsert, delete: delete_, clear, count };
}

export function createTechnicalEnglishPracticeRepository(
  db: UberPrepDatabase,
): TechnicalEnglishPracticeRepository {
  async function findByItemId(itemId: string): Promise<TechnicalEnglishPracticeRecord[]> {
    try {
      return await db.technicalEnglishPractices.where("itemId").equals(itemId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to get practices for item ${itemId}`, err);
    }
  }

  async function listAll(): Promise<TechnicalEnglishPracticeRecord[]> {
    try {
      return await db.technicalEnglishPractices.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list technical english practices", err);
    }
  }

  async function upsert(record: TechnicalEnglishPracticeRecord): Promise<void> {
    try {
      await db.technicalEnglishPractices.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert practice ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.technicalEnglishPractices.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete practice ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.technicalEnglishPractices.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear technical english practices", err);
    }
  }

  return { findByItemId, listAll, upsert, delete: delete_, clear };
}
