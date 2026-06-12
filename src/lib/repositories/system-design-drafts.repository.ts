import type { SystemDesignDraft } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export function createSystemDesignDraftsRepository(db: UberPrepDatabase) {
  async function findByTemplateId(templateId: string): Promise<SystemDesignDraft | undefined> {
    try {
      return await db.systemDesignDrafts.where("templateId").equals(templateId).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get draft for template ${templateId}`, err);
    }
  }

  async function list(): Promise<SystemDesignDraft[]> {
    try {
      return await db.systemDesignDrafts.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list system design drafts", err);
    }
  }

  async function upsert(record: SystemDesignDraft): Promise<void> {
    try {
      await db.systemDesignDrafts.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert draft ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.systemDesignDrafts.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete draft ${id}`, err);
    }
  }

  return { findByTemplateId, list, upsert, delete: delete_ };
}
