import type { SettingsRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { METADATA_ID, SETTINGS_ID } from "@/lib/db/constants";
import { DatabaseError } from "@/lib/db/errors";
import { withSettingsDefaults } from "@/lib/domain/settings";

export interface SettingsRepository {
  get(): Promise<SettingsRecord | undefined>;
  getWithDefaults(): Promise<SettingsRecord>;
  upsert(record: SettingsRecord): Promise<void>;
  update(partial: Partial<Omit<SettingsRecord, "id" | "createdAt">>): Promise<SettingsRecord>;
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

  async function getWithDefaults(): Promise<SettingsRecord> {
    const existing = await get();
    if (!existing) {
      const now = new Date().toISOString();
      const defaults = withSettingsDefaults({ id: SETTINGS_ID, createdAt: now, updatedAt: now });
      await db.settings.put(defaults);
      return defaults;
    }
    // Apply defaults for any fields missing on legacy records
    return withSettingsDefaults(existing as Partial<SettingsRecord> & { id: "app-settings" });
  }

  async function upsert(record: SettingsRecord): Promise<void> {
    try {
      await db.settings.put(record);
    } catch (err) {
      throw new DatabaseError("Failed to upsert settings", err);
    }
  }

  async function update(
    partial: Partial<Omit<SettingsRecord, "id" | "createdAt">>,
  ): Promise<SettingsRecord> {
    const existing = await getWithDefaults();
    const updated: SettingsRecord = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await upsert(updated);
    return updated;
  }

  async function setStartDate(date: string | null): Promise<void> {
    await update({ startDate: date });
  }

  async function setTheme(theme: SettingsRecord["theme"]): Promise<void> {
    await update({ theme });
  }

  return { get, getWithDefaults, upsert, update, setStartDate, setTheme };
}

export function getSettingsId() {
  return SETTINGS_ID;
}

export function getMetadataId() {
  return METADATA_ID;
}
