import type { UberPrepDatabase } from "./schema";
import {
  METADATA_ID,
  SEED_ID_FLASHCARDS,
  SEED_ID_METADATA,
  SEED_ID_SETTINGS,
  SETTINGS_ID,
} from "./constants";
import { DATABASE_VERSION } from "./constants";
import { INITIAL_FLASHCARDS } from "@/lib/data/initial-flashcards";
import type { MetadataRecord, SettingsRecord } from "@/types/database";

export async function runSeeds(db: UberPrepDatabase): Promise<void> {
  await seedMetadata(db);
  await seedSettings(db);
  await seedFlashcards(db);
}

async function hasSeedRun(db: UberPrepDatabase, seedId: string): Promise<boolean> {
  const meta = await db.metadata.get(METADATA_ID);
  return meta?.seedsRun.includes(seedId) ?? false;
}

async function markSeedRun(db: UberPrepDatabase, seedId: string): Promise<void> {
  const meta = await db.metadata.get(METADATA_ID);
  if (!meta) return;
  const already = meta.seedsRun.includes(seedId);
  if (already) return;
  await db.metadata.put({
    ...meta,
    seedsRun: [...meta.seedsRun, seedId],
    updatedAt: new Date().toISOString(),
  });
}

async function seedMetadata(db: UberPrepDatabase): Promise<void> {
  const existing = await db.metadata.get(METADATA_ID);
  if (existing) {
    await markSeedRun(db, SEED_ID_METADATA);
    return;
  }

  const now = new Date().toISOString();
  const record: MetadataRecord = {
    id: METADATA_ID,
    schemaVersion: DATABASE_VERSION,
    migrationStatus: "none",
    migratedAt: null,
    backupVersion: 1,
    seedsRun: [SEED_ID_METADATA],
    createdAt: now,
    updatedAt: now,
  };
  await db.metadata.put(record);
}

async function seedSettings(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_SETTINGS)) return;

  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) {
    await markSeedRun(db, SEED_ID_SETTINGS);
    return;
  }

  const now = new Date().toISOString();
  const record: SettingsRecord = {
    id: SETTINGS_ID,
    startDate: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: "system",
    createdAt: now,
    updatedAt: now,
  };
  await db.settings.put(record);
  await markSeedRun(db, SEED_ID_SETTINGS);
}

async function seedFlashcards(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_FLASHCARDS)) return;

  const existing = await db.flashcards.count();
  if (existing > 0) {
    await markSeedRun(db, SEED_ID_FLASHCARDS);
    return;
  }

  await db.transaction("rw", db.flashcards, async () => {
    await db.flashcards.bulkAdd(INITIAL_FLASHCARDS);
  });
  await markSeedRun(db, SEED_ID_FLASHCARDS);
}
