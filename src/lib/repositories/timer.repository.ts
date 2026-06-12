import type { ActiveTimerRecord, TimerSettingsRecord, TimerSessionRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";
import { ACTIVE_TIMER_ID, TIMER_SETTINGS_ID } from "@/lib/db/constants";

export interface TimerRepository {
  findById(id: string): Promise<TimerSessionRecord | undefined>;
  list(): Promise<TimerSessionRecord[]>;
  listByDate(date: string): Promise<TimerSessionRecord[]>;
  listByDateRange(startDate: string, endDate: string): Promise<TimerSessionRecord[]>;
  add(record: TimerSessionRecord): Promise<void>;
  upsert(record: TimerSessionRecord): Promise<void>;
  bulkUpsert(records: TimerSessionRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  getActive(): Promise<ActiveTimerRecord | undefined>;
  setActive(record: ActiveTimerRecord): Promise<void>;
  clearActive(): Promise<void>;
  getSettings(): Promise<TimerSettingsRecord | undefined>;
  upsertSettings(record: TimerSettingsRecord): Promise<void>;
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

  async function listByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<TimerSessionRecord[]> {
    try {
      return await db.timerSessions
        .where("date")
        .between(startDate, endDate, true, true)
        .reverse()
        .toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list timer sessions from ${startDate} to ${endDate}`, err);
    }
  }

  async function add(record: TimerSessionRecord): Promise<void> {
    try {
      await db.timerSessions.add(record);
    } catch (err) {
      throw new DatabaseError(`Failed to add timer session ${record.id}`, err);
    }
  }

  async function upsert(record: TimerSessionRecord): Promise<void> {
    try {
      await db.timerSessions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert timer session ${record.id}`, err);
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

  async function getActive(): Promise<ActiveTimerRecord | undefined> {
    try {
      return await db.activeTimer.get(ACTIVE_TIMER_ID);
    } catch (err) {
      throw new DatabaseError("Failed to get active timer", err);
    }
  }

  async function setActive(record: ActiveTimerRecord): Promise<void> {
    try {
      await db.activeTimer.put(record);
    } catch (err) {
      throw new DatabaseError("Failed to set active timer", err);
    }
  }

  async function clearActive(): Promise<void> {
    try {
      await db.activeTimer.delete(ACTIVE_TIMER_ID);
    } catch (err) {
      throw new DatabaseError("Failed to clear active timer", err);
    }
  }

  async function getSettings(): Promise<TimerSettingsRecord | undefined> {
    try {
      return await db.timerSettings.get(TIMER_SETTINGS_ID);
    } catch (err) {
      throw new DatabaseError("Failed to get timer settings", err);
    }
  }

  async function upsertSettings(record: TimerSettingsRecord): Promise<void> {
    try {
      await db.timerSettings.put(record);
    } catch (err) {
      throw new DatabaseError("Failed to upsert timer settings", err);
    }
  }

  return {
    findById,
    list,
    listByDate,
    listByDateRange,
    add,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
    getActive,
    setActive,
    clearActive,
    getSettings,
    upsertSettings,
  };
}
