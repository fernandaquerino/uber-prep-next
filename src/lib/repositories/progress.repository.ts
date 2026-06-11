import type { PlanProgressRecord, PlanProgressStatus } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ProgressRepository {
  findById(id: string): Promise<PlanProgressRecord | undefined>;
  findByBlockId(blockId: string): Promise<PlanProgressRecord | undefined>;
  list(): Promise<PlanProgressRecord[]>;
  listByStatus(status: PlanProgressStatus): Promise<PlanProgressRecord[]>;
  upsert(record: PlanProgressRecord): Promise<void>;
  bulkUpsert(records: PlanProgressRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createProgressRepository(db: UberPrepDatabase): ProgressRepository {
  async function findById(id: string): Promise<PlanProgressRecord | undefined> {
    try {
      return await db.planProgress.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get progress record ${id}`, err);
    }
  }

  async function list(): Promise<PlanProgressRecord[]> {
    try {
      return await db.planProgress.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list progress records", err);
    }
  }

  async function findByBlockId(blockId: string): Promise<PlanProgressRecord | undefined> {
    try {
      return await db.planProgress.where("blockId").equals(blockId).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get progress record for block ${blockId}`, err);
    }
  }

  async function listByStatus(status: PlanProgressStatus): Promise<PlanProgressRecord[]> {
    try {
      return await db.planProgress.where("status").equals(status).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list progress records by status ${status}`, err);
    }
  }

  async function upsert(record: PlanProgressRecord): Promise<void> {
    try {
      await db.planProgress.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert progress record ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: PlanProgressRecord[]): Promise<void> {
    try {
      await db.planProgress.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert progress records", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.planProgress.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete progress record ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.planProgress.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear progress records", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.planProgress.count();
    } catch (err) {
      throw new DatabaseError("Failed to count progress records", err);
    }
  }

  return {
    findById,
    findByBlockId,
    list,
    listByStatus,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
  };
}
