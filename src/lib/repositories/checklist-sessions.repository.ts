import type { ChecklistSession } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export function createChecklistSessionsRepository(db: UberPrepDatabase) {
  async function findLatest(): Promise<ChecklistSession | undefined> {
    try {
      return await db.checklistSessions.orderBy("createdAt").last();
    } catch (err) {
      throw new DatabaseError("Failed to get latest checklist session", err);
    }
  }

  async function list(): Promise<ChecklistSession[]> {
    try {
      return await db.checklistSessions.orderBy("createdAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list checklist sessions", err);
    }
  }

  async function upsert(record: ChecklistSession): Promise<void> {
    try {
      await db.checklistSessions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert checklist session ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.checklistSessions.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete checklist session ${id}`, err);
    }
  }

  return { findLatest, list, upsert, delete: delete_ };
}
