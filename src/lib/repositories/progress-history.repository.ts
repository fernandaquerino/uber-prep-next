import type { ProgressEventRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ProgressHistoryRepository {
  findById(id: string): Promise<ProgressEventRecord | undefined>;
  list(): Promise<ProgressEventRecord[]>;
  listByBlockId(blockId: string): Promise<ProgressEventRecord[]>;
  listByActionGroupId(actionGroupId: string): Promise<ProgressEventRecord[]>;
  add(record: ProgressEventRecord): Promise<void>;
  bulkAdd(records: ProgressEventRecord[]): Promise<void>;
  clear(): Promise<void>;
}

export function createProgressHistoryRepository(db: UberPrepDatabase): ProgressHistoryRepository {
  async function findById(id: string): Promise<ProgressEventRecord | undefined> {
    try {
      return await db.progressEvents.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get progress event ${id}`, err);
    }
  }

  async function list(): Promise<ProgressEventRecord[]> {
    try {
      return await db.progressEvents.orderBy("occurredAt").toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list progress events", err);
    }
  }

  async function listByBlockId(blockId: string): Promise<ProgressEventRecord[]> {
    try {
      return await db.progressEvents.where("blockId").equals(blockId).sortBy("occurredAt");
    } catch (err) {
      throw new DatabaseError(`Failed to list progress events for block ${blockId}`, err);
    }
  }

  async function listByActionGroupId(actionGroupId: string): Promise<ProgressEventRecord[]> {
    try {
      return await db.progressEvents
        .where("actionGroupId")
        .equals(actionGroupId)
        .sortBy("occurredAt");
    } catch (err) {
      throw new DatabaseError(
        `Failed to list progress events for action group ${actionGroupId}`,
        err,
      );
    }
  }

  async function add(record: ProgressEventRecord): Promise<void> {
    try {
      await db.progressEvents.add(record);
    } catch (err) {
      throw new DatabaseError(`Failed to add progress event ${record.id}`, err);
    }
  }

  async function bulkAdd(records: ProgressEventRecord[]): Promise<void> {
    try {
      await db.progressEvents.bulkAdd(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk add progress events", err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.progressEvents.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear progress events", err);
    }
  }

  return { findById, list, listByBlockId, listByActionGroupId, add, bulkAdd, clear };
}
