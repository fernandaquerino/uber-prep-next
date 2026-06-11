import type { ReviewRecord, ReviewStatus, ReviewSourceType } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface ReviewsRepository {
  findById(id: string): Promise<ReviewRecord | undefined>;
  list(): Promise<ReviewRecord[]>;
  listByStatus(status: ReviewStatus): Promise<ReviewRecord[]>;
  listDue(today: string): Promise<ReviewRecord[]>;
  listBySource(sourceType: ReviewSourceType, sourceId: string): Promise<ReviewRecord[]>;
  upsert(record: ReviewRecord): Promise<void>;
  bulkUpsert(records: ReviewRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createReviewsRepository(db: UberPrepDatabase): ReviewsRepository {
  async function findById(id: string): Promise<ReviewRecord | undefined> {
    try {
      return await db.reviews.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get review ${id}`, err);
    }
  }

  async function list(): Promise<ReviewRecord[]> {
    try {
      return await db.reviews.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list reviews", err);
    }
  }

  async function listByStatus(status: ReviewStatus): Promise<ReviewRecord[]> {
    try {
      return await db.reviews.where("status").equals(status).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list reviews by status ${status}`, err);
    }
  }

  async function listDue(today: string): Promise<ReviewRecord[]> {
    try {
      return await db.reviews
        .where("scheduledFor")
        .belowOrEqual(today)
        .filter((r) => r.status === "scheduled" || r.status === "due")
        .toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list due reviews", err);
    }
  }

  async function listBySource(
    sourceType: ReviewSourceType,
    sourceId: string,
  ): Promise<ReviewRecord[]> {
    try {
      return await db.reviews
        .where("sourceType")
        .equals(sourceType)
        .filter((r) => r.sourceId === sourceId)
        .toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list reviews for ${sourceType}/${sourceId}`, err);
    }
  }

  async function upsert(record: ReviewRecord): Promise<void> {
    try {
      await db.reviews.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert review ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: ReviewRecord[]): Promise<void> {
    try {
      await db.reviews.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert reviews", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.reviews.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete review ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.reviews.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear reviews", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.reviews.count();
    } catch (err) {
      throw new DatabaseError("Failed to count reviews", err);
    }
  }

  return {
    findById,
    list,
    listByStatus,
    listDue,
    listBySource,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
  };
}
