import type { ResourceRecord, ResourceProgressRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ResourcesRepository {
  findById(id: string): Promise<ResourceRecord | undefined>;
  list(): Promise<ResourceRecord[]>;
  listByCategory(category: string): Promise<ResourceRecord[]>;
  listByTopicId(topicId: string): Promise<ResourceRecord[]>;
  upsert(record: ResourceRecord): Promise<void>;
  bulkUpsert(records: ResourceRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export interface ResourceProgressRepository {
  findByResourceId(resourceId: string): Promise<ResourceProgressRecord | undefined>;
  listAll(): Promise<ResourceProgressRecord[]>;
  upsert(record: ResourceProgressRecord): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createResourcesRepository(db: UberPrepDatabase): ResourcesRepository {
  async function findById(id: string): Promise<ResourceRecord | undefined> {
    try {
      return await db.resources.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get resource ${id}`, err);
    }
  }

  async function list(): Promise<ResourceRecord[]> {
    try {
      return await db.resources.orderBy("updatedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list resources", err);
    }
  }

  async function listByCategory(category: string): Promise<ResourceRecord[]> {
    try {
      return await db.resources.where("category").equals(category).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list resources by category ${category}`, err);
    }
  }

  async function listByTopicId(topicId: string): Promise<ResourceRecord[]> {
    try {
      return await db.resources.where("topicIds").equals(topicId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list resources by topic ${topicId}`, err);
    }
  }

  async function upsert(record: ResourceRecord): Promise<void> {
    try {
      await db.resources.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert resource ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: ResourceRecord[]): Promise<void> {
    try {
      await db.resources.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert resources", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.resources.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete resource ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.resources.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear resources", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.resources.count();
    } catch (err) {
      throw new DatabaseError("Failed to count resources", err);
    }
  }

  return {
    findById,
    list,
    listByCategory,
    listByTopicId,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
  };
}

export function createResourceProgressRepository(db: UberPrepDatabase): ResourceProgressRepository {
  async function findByResourceId(resourceId: string): Promise<ResourceProgressRecord | undefined> {
    try {
      return await db.resourceProgress.where("resourceId").equals(resourceId).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get progress for resource ${resourceId}`, err);
    }
  }

  async function listAll(): Promise<ResourceProgressRecord[]> {
    try {
      return await db.resourceProgress.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list resource progress", err);
    }
  }

  async function upsert(record: ResourceProgressRecord): Promise<void> {
    try {
      await db.resourceProgress.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert resource progress ${record.id}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.resourceProgress.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete resource progress ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.resourceProgress.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear resource progress", err);
    }
  }

  return { findByResourceId, listAll, upsert, delete: delete_, clear };
}
