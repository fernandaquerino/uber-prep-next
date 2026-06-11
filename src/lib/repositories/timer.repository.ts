import type { TimerSessionRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface TimerRepository {
  findById(id: string): Promise<TimerSessionRecord | undefined>;
  list(): Promise<TimerSessionRecord[]>;
  listByDate(date: string): Promise<TimerSessionRecord[]>;
  add(record: TimerSessionRecord): Promise<void>;
  bulkUpsert(records: TimerSessionRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export function createTimerRepository(db: UberPrepDatabase): TimerRepository {
  async function findById(id: string): Promise<TimerSessionRecord | undefined> {
    try {
      return await db.timerSessions.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get timer session ${id}`, err);
    }
  }

  async function list(): Promise<TimerSessionRecord[]> {
    try {
      return await db.timerSessions.orderBy("startedAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list timer sessions", err);
    }
  }

  async function listByDate(date: string): Promise<TimerSessionRecord[]> {
    try {
      return await db.timerSessions.filter((s) => s.date === date).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list timer sessions for date ${date}`, err);
    }
  }

  async function add(record: TimerSessionRecord): Promise<void> {
    try {
      await db.timerSessions.add(record);
    } catch (err) {
      throw new DatabaseError(`Failed to add timer session ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: TimerSessionRecord[]): Promise<void> {
    try {
      await db.timerSessions.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert timer sessions", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.timerSessions.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete timer session ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.timerSessions.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear timer sessions", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.timerSessions.count();
    } catch (err) {
      throw new DatabaseError("Failed to count timer sessions", err);
    }
  }

  return { findById, list, listByDate, add, bulkUpsert, delete: delete_, clear, count };
}
