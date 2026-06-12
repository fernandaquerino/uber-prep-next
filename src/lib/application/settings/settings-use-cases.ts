import type { SettingsRecord, TimerSettingsRecord } from "@/types/database";
import type { UpdateSettingsInput, TimerSettingsInput } from "@/lib/domain/settings";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { createSettingsRepository } from "@/lib/repositories/settings.repository";
import { createTimerRepository } from "@/lib/repositories/timer.repository";
import { createDefaultTimerSettings } from "@/lib/application/timer/timer-helpers";
import { DATABASE_VERSION } from "@/lib/db/constants";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSettings(db: UberPrepDatabase): Promise<SettingsRecord> {
  return createSettingsRepository(db).getWithDefaults();
}

export async function getTimerSettings(db: UberPrepDatabase): Promise<TimerSettingsRecord> {
  const repo = createTimerRepository(db);
  const existing = await repo.getSettings();
  if (existing) return existing;
  const defaults = createDefaultTimerSettings(new Date().toISOString());
  await repo.upsertSettings(defaults);
  return defaults;
}

export async function getAllSettings(db: UberPrepDatabase) {
  const [settings, timerSettings] = await Promise.all([
    getSettings(db),
    getTimerSettings(db),
  ]);
  return { settings, timerSettings };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function updateSettings(
  db: UberPrepDatabase,
  input: UpdateSettingsInput,
): Promise<SettingsRecord> {
  return createSettingsRepository(db).update(input);
}

export async function updateTimerSettings(
  db: UberPrepDatabase,
  input: Partial<TimerSettingsInput>,
): Promise<TimerSettingsRecord> {
  const repo = createTimerRepository(db);
  const existing = await getTimerSettings(db);
  const updated: TimerSettingsRecord = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await repo.upsertSettings(updated);
  return updated;
}

// ─── Storage diagnostics ──────────────────────────────────────────────────────

export type StorageDiagnostics = {
  appVersion: string;
  schemaVersion: number;
  seedsRun: string[];
  tableCounts: Record<string, number>;
  estimatedBytes: number | null;
  lastExportedAt: string | null;
};

export async function getStorageDiagnostics(db: UberPrepDatabase): Promise<StorageDiagnostics> {
  const [
    settingsCount,
    planProgressCount,
    reviewsCount,
    flashcardsCount,
    quizAttemptsCount,
    timerSessionsCount,
    mocksCount,
    notesCount,
    resourcesCount,
    technicalEnglishCount,
    metadata,
  ] = await Promise.all([
    db.settings.count(),
    db.planProgress.count(),
    db.reviews.count(),
    db.flashcards.count(),
    db.quizAttempts.count(),
    db.timerSessions.count(),
    db.mocks.count(),
    db.notes.count(),
    db.resources.count(),
    db.technicalEnglishItems.count(),
    db.metadata.get("app-metadata"),
  ]);

  let estimatedBytes: number | null = null;
  if (typeof navigator !== "undefined" && "storage" in navigator) {
    try {
      const estimate = await navigator.storage.estimate();
      estimatedBytes = estimate.usage ?? null;
    } catch {
      // not available in all browsers
    }
  }

  return {
    appVersion: "0.1.0",
    schemaVersion: DATABASE_VERSION,
    seedsRun: metadata?.seedsRun ?? [],
    tableCounts: {
      settings: settingsCount,
      planProgress: planProgressCount,
      reviews: reviewsCount,
      flashcards: flashcardsCount,
      quizAttempts: quizAttemptsCount,
      timerSessions: timerSessionsCount,
      mocks: mocksCount,
      notes: notesCount,
      resources: resourcesCount,
      technicalEnglish: technicalEnglishCount,
    },
    estimatedBytes,
    lastExportedAt: null,
  };
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export type ResetModule =
  | "settings"
  | "plan"
  | "reviews"
  | "flashcards"
  | "quizzes"
  | "timer"
  | "mocks"
  | "notes"
  | "resources"
  | "all";

export async function resetModule(db: UberPrepDatabase, module: ResetModule): Promise<void> {
  switch (module) {
    case "settings":
      await db.settings.clear();
      await db.timerSettings.clear();
      break;
    case "plan":
      await db.planProgress.clear();
      await db.progressEvents.clear();
      await db.scheduleOverrides.clear();
      break;
    case "reviews":
      await db.reviews.clear();
      break;
    case "flashcards":
      await db.flashcards.clear();
      break;
    case "quizzes":
      await db.quizAttempts.clear();
      await db.quizReviews.clear();
      break;
    case "timer":
      await db.timerSessions.clear();
      await db.activeTimer.clear();
      break;
    case "mocks":
      await db.mocks.clear();
      await db.mockAudio.clear();
      await db.checklistItems.clear();
      break;
    case "notes":
      await db.notes.clear();
      await db.weeklyReflections.clear();
      await db.learningJournal.clear();
      break;
    case "resources":
      await db.resources.clear();
      await db.resourceProgress.clear();
      await db.technicalEnglishItems.clear();
      await db.technicalEnglishPractices.clear();
      break;
    case "all":
      await Promise.all([
        db.settings.clear(),
        db.timerSettings.clear(),
        db.planProgress.clear(),
        db.progressEvents.clear(),
        db.scheduleOverrides.clear(),
        db.reviews.clear(),
        db.flashcards.clear(),
        db.quizAttempts.clear(),
        db.quizReviews.clear(),
        db.timerSessions.clear(),
        db.activeTimer.clear(),
        db.mocks.clear(),
        db.mockAudio.clear(),
        db.checklistItems.clear(),
        db.notes.clear(),
        db.weeklyReflections.clear(),
        db.learningJournal.clear(),
        db.playgroundSolutions.clear(),
        db.resources.clear(),
        db.resourceProgress.clear(),
        db.technicalEnglishItems.clear(),
        db.technicalEnglishPractices.clear(),
        db.metadata.clear(),
      ]);
      break;
  }
}
