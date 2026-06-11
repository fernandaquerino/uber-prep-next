import type { ChecklistItemRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ChecklistRepository {
  findById(id: string): Promise<ChecklistItemRecord | undefined>;
  list(): Promise<ChecklistItemRecord[]>;
  listByPhase(phase: string): Promise<ChecklistItemRecord[]>;
  upsert(record: ChecklistItemRecord): Promise<void>;
  bulkUpsert(records: ChecklistItemRecord[]): Promise<void>;
  setChecked(
    id: string,
    checked: boolean,
    evidence: string | null,
    updatedAt: string,
  ): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createChecklistRepository(db: UberPrepDatabase): ChecklistRepository {
  async function findById(id: string): Promise<ChecklistItemRecord | undefined> {
    try {
      return await db.checklistItems.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get checklist item ${id}`, err);
    }
  }

  async function list(): Promise<ChecklistItemRecord[]> {
    try {
      return await db.checklistItems.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list checklist items", err);
    }
  }

  async function listByPhase(phase: string): Promise<ChecklistItemRecord[]> {
    try {
      return await db.checklistItems.where("phase").equals(phase).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list checklist items for phase ${phase}`, err);
    }
  }

  async function upsert(record: ChecklistItemRecord): Promise<void> {
    try {
      await db.checklistItems.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert checklist item ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: ChecklistItemRecord[]): Promise<void> {
    try {
      await db.checklistItems.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert checklist items", err);
    }
  }

  async function setChecked(
    id: string,
    checked: boolean,
    evidence: string | null,
    updatedAt: string,
  ): Promise<void> {
    try {
      await db.checklistItems.update(id, { checked, evidence, updatedAt });
    } catch (err) {
      throw new DatabaseError(`Failed to update checklist item ${id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.checklistItems.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete checklist item ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.checklistItems.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear checklist items", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.checklistItems.count();
    } catch (err) {
      throw new DatabaseError("Failed to count checklist items", err);
    }
  }

  return {
    findById,
    list,
    listByPhase,
    upsert,
    bulkUpsert,
    setChecked,
    delete: delete_,
    clear,
    count,
  };
}
