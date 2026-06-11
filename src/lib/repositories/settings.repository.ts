import type { SettingsRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { METADATA_ID, SETTINGS_ID } from "@/lib/db/constants";
import { DatabaseError } from "@/lib/db/errors";

export interface SettingsRepository {
  get(): Promise<SettingsRecord | undefined>;
  upsert(record: SettingsRecord): Promise<void>;
  setStartDate(date: string | null): Promise<void>;
  setTheme(theme: SettingsRecord["theme"]): Promise<void>;
}

export function createSettingsRepository(db: UberPrepDatabase): SettingsRepository {
  async function get(): Promise<SettingsRecord | undefined> {
    try {
      return await db.settings.get(SETTINGS_ID);
    } catch (err) {
      throw new DatabaseError("Failed to get settings", err);
    }
  }

  async function upsert(record: SettingsRecord): Promise<void> {
    try {
      await db.settings.put(record);
    } catch (err) {
      throw new DatabaseError("Failed to upsert settings", err);
    }
  }

  async function setStartDate(date: string | null): Promise<void> {
    const existing = await get();
    if (!existing) throw new DatabaseError("Settings not initialized");
    const now = new Date().toISOString();
    await upsert({ ...existing, startDate: date, updatedAt: now });
  }

  async function setTheme(theme: SettingsRecord["theme"]): Promise<void> {
    const existing = await get();
    if (!existing) throw new DatabaseError("Settings not initialized");
    const now = new Date().toISOString();
    await upsert({ ...existing, theme, updatedAt: now });
  }

  return { get, upsert, setStartDate, setTheme };
}

// Default singleton factory — call with getDb() from outside
export function getSettingsId() {
  return SETTINGS_ID;
}

export function getMetadataId() {
  return METADATA_ID;
}
