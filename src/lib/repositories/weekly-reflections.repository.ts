import type { WeeklyReflectionRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface WeeklyReflectionsRepository {
  findByWeekNumber(weekNumber: number): Promise<WeeklyReflectionRecord | undefined>;
  listAll(): Promise<WeeklyReflectionRecord[]>;
  upsert(record: WeeklyReflectionRecord): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createWeeklyReflectionsRepository(
  db: UberPrepDatabase,
): WeeklyReflectionsRepository {
  async function findByWeekNumber(weekNumber: number): Promise<WeeklyReflectionRecord | undefined> {
    try {
      return await db.weeklyReflections.where("weekNumber").equals(weekNumber).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get reflection for week ${weekNumber}`, err);
    }
  }

  async function listAll(): Promise<WeeklyReflectionRecord[]> {
    try {
      return await db.weeklyReflections.orderBy("weekNumber").toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list weekly reflections", err);
    }
  }

  async function upsert(record: WeeklyReflectionRecord): Promise<void> {
    try {
      await db.weeklyReflections.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert reflection week ${record.weekNumber}`, err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.weeklyReflections.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete reflection ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.weeklyReflections.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear weekly reflections", err);
    }
  }

  return { findByWeekNumber, listAll, upsert, delete: delete_, clear };
}
