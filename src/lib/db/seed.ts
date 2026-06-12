import type { UberPrepDatabase } from "./schema";
import {
  METADATA_ID,
  SEED_ID_FLASHCARDS,
  SEED_ID_METADATA,
  SEED_ID_QUIZ_QUESTIONS,
  SEED_ID_RESOURCES,
  SEED_ID_SETTINGS,
  SEED_ID_TECHNICAL_ENGLISH,
  SEED_ID_TIMER_SETTINGS,
  SETTINGS_ID,
  TIMER_SETTINGS_ID,
} from "./constants";
import { DATABASE_VERSION } from "./constants";
import { INITIAL_FLASHCARDS } from "@/lib/data/initial-flashcards";
import { INITIAL_QUIZ_QUESTIONS } from "@/lib/data/quizzes";
import { INITIAL_RESOURCES } from "@/lib/data/resources-seed";
import { INITIAL_TECHNICAL_ENGLISH_ITEMS } from "@/lib/data/technical-english-items";
import { normalizeLegacyQuizQuestion, validateQuizQuestion } from "@/lib/domain/quizzes";
import type { MetadataRecord, SettingsRecord, TimerSettingsRecord } from "@/types/database";
import { withSettingsDefaults } from "@/lib/domain/settings";

export async function runSeeds(db: UberPrepDatabase): Promise<void> {
  await seedMetadata(db);
  await seedSettings(db);
  await seedTimerSettings(db);
  await seedFlashcards(db);
  await seedQuizQuestions(db);
  await seedResources(db);
  await seedTechnicalEnglish(db);
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
  const detectedTimezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Sao_Paulo";
  const record: SettingsRecord = withSettingsDefaults({
    id: SETTINGS_ID,
    startDate: null,
    timezone: detectedTimezone,
    createdAt: now,
    updatedAt: now,
  });
  await db.settings.put(record);
  await markSeedRun(db, SEED_ID_SETTINGS);
}

async function seedTimerSettings(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_TIMER_SETTINGS)) return;

  const existing = await db.timerSettings.get(TIMER_SETTINGS_ID);
  if (existing) {
    await markSeedRun(db, SEED_ID_TIMER_SETTINGS);
    return;
  }

  const now = new Date().toISOString();
  const record: TimerSettingsRecord = {
    id: TIMER_SETTINGS_ID,
    defaultMode: "countdown",
    defaultPresetSeconds: 45 * 60,
    soundEnabled: true,
    notificationsEnabled: false,
    confirmBeforeCancel: true,
    showCompactTimer: true,
    longSessionThresholdSeconds: 4 * 60 * 60,
    createdAt: now,
    updatedAt: now,
  };
  await db.timerSettings.put(record);
  await markSeedRun(db, SEED_ID_TIMER_SETTINGS);
}

async function seedFlashcards(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_FLASHCARDS)) return;

  const existing = await db.flashcards.count();
  if (existing > 0) {
    await markSeedRun(db, SEED_ID_FLASHCARDS);
    return;
  }

  const now = new Date().toISOString();
  const seeded = INITIAL_FLASHCARDS.map((card) => ({
    ...card,
    status: "pending" as const,
    source: "initial" as const,
    lifecycleStatus: "active" as const,
    knownAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    reviews: [],
    updatedAt: now,
  }));
  await db.transaction("rw", db.flashcards, async () => {
    await db.flashcards.bulkPut(seeded);
  });
  await markSeedRun(db, SEED_ID_FLASHCARDS);
}

async function seedQuizQuestions(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_QUIZ_QUESTIONS)) return;

  const now = new Date().toISOString();
  const normalized = INITIAL_QUIZ_QUESTIONS.map((question) =>
    normalizeLegacyQuizQuestion(question, now),
  ).filter((question) => validateQuizQuestion(question).length === 0);

  await db.transaction("rw", db.quizQuestions, async () => {
    for (const question of normalized) {
      const existing = await db.quizQuestions.get(question.id);
      if (!existing) {
        await db.quizQuestions.put(question);
      }
    }
  });

  await markSeedRun(db, SEED_ID_QUIZ_QUESTIONS);
}

async function seedResources(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_RESOURCES)) return;

  await db.transaction("rw", db.resources, async () => {
    for (const resource of INITIAL_RESOURCES) {
      const existing = await db.resources.get(resource.id);
      if (!existing) {
        await db.resources.put(resource);
      }
    }
  });

  await markSeedRun(db, SEED_ID_RESOURCES);
}

async function seedTechnicalEnglish(db: UberPrepDatabase): Promise<void> {
  if (await hasSeedRun(db, SEED_ID_TECHNICAL_ENGLISH)) return;

  await db.transaction("rw", db.technicalEnglishItems, async () => {
    for (const item of INITIAL_TECHNICAL_ENGLISH_ITEMS) {
      const existing = await db.technicalEnglishItems.get(item.id);
      if (!existing) {
        await db.technicalEnglishItems.put(item);
      }
    }
  });

  await markSeedRun(db, SEED_ID_TECHNICAL_ENGLISH);
}
