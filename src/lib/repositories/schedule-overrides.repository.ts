import type { ScheduleOverrideRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ScheduleOverridesRepository {
  findById(id: string): Promise<ScheduleOverrideRecord | undefined>;
  list(): Promise<ScheduleOverrideRecord[]>;
  listByBlockId(blockId: string): Promise<ScheduleOverrideRecord[]>;
  listByActionGroupId(actionGroupId: string): Promise<ScheduleOverrideRecord[]>;
  add(record: ScheduleOverrideRecord): Promise<void>;
  bulkAdd(records: ScheduleOverrideRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  clear(): Promise<void>;
}

export function createScheduleOverridesRepository(
  db: UberPrepDatabase,
): ScheduleOverridesRepository {
  async function findById(id: string): Promise<ScheduleOverrideRecord | undefined> {
    try {
      return await db.scheduleOverrides.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get schedule override ${id}`, err);
    }
  }

  async function list(): Promise<ScheduleOverrideRecord[]> {
    try {
      return await db.scheduleOverrides.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list schedule overrides", err);
    }
  }

  async function listByBlockId(blockId: string): Promise<ScheduleOverrideRecord[]> {
    try {
      return await db.scheduleOverrides.where("blockId").equals(blockId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list schedule overrides for block ${blockId}`, err);
    }
  }

  async function listByActionGroupId(actionGroupId: string): Promise<ScheduleOverrideRecord[]> {
    try {
      return await db.scheduleOverrides.where("actionGroupId").equals(actionGroupId).toArray();
    } catch (err) {
      throw new DatabaseError(
        `Failed to list schedule overrides for action group ${actionGroupId}`,
        err,
      );
    }
  }

  async function add(record: ScheduleOverrideRecord): Promise<void> {
    try {
      await db.scheduleOverrides.add(record);
    } catch (err) {
      throw new DatabaseError(`Failed to add schedule override ${record.id}`, err);
    }
  }

  async function bulkAdd(records: ScheduleOverrideRecord[]): Promise<void> {
    try {
      await db.scheduleOverrides.bulkAdd(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk add schedule overrides", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.scheduleOverrides.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete schedule override ${id}`, err);
    }
  }

  async function bulkDelete(ids: string[]): Promise<void> {
    try {
      await db.scheduleOverrides.bulkDelete(ids);
    } catch (err) {
      throw new DatabaseError("Failed to bulk delete schedule overrides", err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.scheduleOverrides.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear schedule overrides", err);
    }
  }

  return {
    findById,
    list,
    listByBlockId,
    listByActionGroupId,
    add,
    bulkAdd,
    delete: delete_,
    bulkDelete,
    clear,
  };
}
