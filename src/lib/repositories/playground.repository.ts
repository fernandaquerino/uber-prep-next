import type { PlaygroundSolutionRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface PlaygroundRepository {
  findById(id: string): Promise<PlaygroundSolutionRecord | undefined>;
  list(): Promise<PlaygroundSolutionRecord[]>;
  listByLanguage(language: string): Promise<PlaygroundSolutionRecord[]>;
  upsert(record: PlaygroundSolutionRecord): Promise<void>;
  bulkUpsert(records: PlaygroundSolutionRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createPlaygroundRepository(db: UberPrepDatabase): PlaygroundRepository {
  async function findById(id: string): Promise<PlaygroundSolutionRecord | undefined> {
    try {
      return await db.playgroundSolutions.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get playground solution ${id}`, err);
    }
  }

  async function list(): Promise<PlaygroundSolutionRecord[]> {
    try {
      return await db.playgroundSolutions.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list playground solutions", err);
    }
  }

  async function listByLanguage(language: string): Promise<PlaygroundSolutionRecord[]> {
    try {
      return await db.playgroundSolutions.where("language").equals(language).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list playground solutions for language ${language}`, err);
    }
  }

  async function upsert(record: PlaygroundSolutionRecord): Promise<void> {
    try {
      await db.playgroundSolutions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert playground solution ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: PlaygroundSolutionRecord[]): Promise<void> {
    try {
      await db.playgroundSolutions.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert playground solutions", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.playgroundSolutions.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete playground solution ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.playgroundSolutions.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear playground solutions", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.playgroundSolutions.count();
    } catch (err) {
      throw new DatabaseError("Failed to count playground solutions", err);
    }
  }

  return { findById, list, listByLanguage, upsert, bulkUpsert, delete: delete_, clear, count };
}
