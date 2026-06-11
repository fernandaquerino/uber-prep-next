import type { NoteRecord, NoteType } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface NotesRepository {
  findById(id: string): Promise<NoteRecord | undefined>;
  list(): Promise<NoteRecord[]>;
  listByType(type: NoteType): Promise<NoteRecord[]>;
  listByCategory(category: string): Promise<NoteRecord[]>;
  listByTopicId(topicId: string): Promise<NoteRecord[]>;
  upsert(record: NoteRecord): Promise<void>;
  bulkUpsert(records: NoteRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createNotesRepository(db: UberPrepDatabase): NotesRepository {
  async function findById(id: string): Promise<NoteRecord | undefined> {
    try {
      return await db.notes.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get note ${id}`, err);
    }
  }

  async function list(): Promise<NoteRecord[]> {
    try {
      return await db.notes.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list notes", err);
    }
  }

  async function listByType(type: NoteType): Promise<NoteRecord[]> {
    try {
      return await db.notes.where("type").equals(type).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list notes by type ${type}`, err);
    }
  }

  async function listByCategory(category: string): Promise<NoteRecord[]> {
    try {
      return await db.notes.where("category").equals(category).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list notes for category ${category}`, err);
    }
  }

  async function listByTopicId(topicId: string): Promise<NoteRecord[]> {
    try {
      return await db.notes.where("topicId").equals(topicId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list notes for topic ${topicId}`, err);
    }
  }

  async function upsert(record: NoteRecord): Promise<void> {
    try {
      await db.notes.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert note ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: NoteRecord[]): Promise<void> {
    try {
      await db.notes.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert notes", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.notes.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete note ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.notes.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear notes", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.notes.count();
    } catch (err) {
      throw new DatabaseError("Failed to count notes", err);
    }
  }

  return {
    findById,
    list,
    listByType,
    listByCategory,
    listByTopicId,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
  };
}
