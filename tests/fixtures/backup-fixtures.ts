// Fixtures for backup import/export tests.

import type { BackupFile } from "@/types/backup";
import { BACKUP_APP_ID, BACKUP_VERSION } from "@/types/backup";
import { withSettingsDefaults } from "@/lib/domain/settings";

export const MINIMAL_BACKUP: BackupFile = {
  app: BACKUP_APP_ID,
  backupVersion: BACKUP_VERSION,
  schemaVersion: 1,
  exportedAt: "2025-01-15T12:00:00.000Z",
  audioNote: "Audio recordings are not included in text backups.",
  audioCount: 0,
  data: {
    settings: [
      withSettingsDefaults({
        id: "app-settings",
        startDate: "2025-01-01",
        timezone: "America/Sao_Paulo",
        theme: "dark",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      }),
    ],
    planProgress: [
      {
        id: "block-w1-d1-b0",
        blockId: "w1-d1-b0",
        status: "completed",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-10T00:00:00.000Z",
      },
    ],
    progressEvents: [],
    scheduleOverrides: [],
    reviews: [],
    flashcards: [],
    quizQuestions: [],
    quizSessions: [],
    quizAnswers: [],
    quizMarkedQuestions: [],
    quizAttempts: [],
    quizReviews: [],
    activeTimer: [],
    timerSessions: [],
    timerSettings: [],
    mocks: [],
    mockEvidence: [],
    starAnswers: [],
    systemDesignDrafts: [],
    fullInterviewSessions: [],
    fullInterviewSteps: [],
    checklistSessions: [],
    notes: [],
    noteVersions: [],
    noteLinks: [],
    weeklyReflections: [],
    weeklyReportSnapshots: [],
    learningJournal: [],
    playgroundSolutions: [],
    checklistItems: [],
    resources: [],
    resourceProgress: [],
    technicalEnglishItems: [],
    technicalEnglishPractices: [],
    metadata: [
      {
        id: "app-metadata",
        schemaVersion: 1,
        migrationStatus: "completed",
        migratedAt: "2025-01-15T00:00:00.000Z",
        backupVersion: 1,
        seedsRun: ["seed:initial-flashcards:v1"],
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-15T00:00:00.000Z",
      },
    ],
  },
};

export const INVALID_BACKUP_WRONG_APP = {
  app: "other-app",
  backupVersion: 1,
  schemaVersion: 1,
  exportedAt: "2025-01-15T12:00:00.000Z",
  audioNote: "",
  audioCount: 0,
  data: {},
};

export const INVALID_BACKUP_WRONG_VERSION = {
  ...MINIMAL_BACKUP,
  backupVersion: 999,
};
