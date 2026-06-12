import { z } from "zod";
import { BACKUP_APP_ID, BACKUP_VERSION } from "@/types/backup";

export const backupDataSchema = z.object({
  settings: z.array(z.unknown()).default([]),
  planProgress: z.array(z.unknown()).default([]),
  progressEvents: z.array(z.unknown()).default([]),
  scheduleOverrides: z.array(z.unknown()).default([]),
  reviews: z.array(z.unknown()).default([]),
  flashcards: z.array(z.unknown()).default([]),
  quizQuestions: z.array(z.unknown()).default([]),
  quizSessions: z.array(z.unknown()).default([]),
  quizAnswers: z.array(z.unknown()).default([]),
  quizMarkedQuestions: z.array(z.unknown()).default([]),
  quizAttempts: z.array(z.unknown()).default([]),
  quizReviews: z.array(z.unknown()).default([]),
  activeTimer: z.array(z.unknown()).default([]),
  timerSessions: z.array(z.unknown()).default([]),
  timerSettings: z.array(z.unknown()).default([]),
  mocks: z.array(z.unknown()).default([]),
  mockEvidence: z.array(z.unknown()).default([]),
  starAnswers: z.array(z.unknown()).default([]),
  systemDesignDrafts: z.array(z.unknown()).default([]),
  fullInterviewSessions: z.array(z.unknown()).default([]),
  fullInterviewSteps: z.array(z.unknown()).default([]),
  checklistSessions: z.array(z.unknown()).default([]),
  notes: z.array(z.unknown()).default([]),
  noteVersions: z.array(z.unknown()).default([]),
  noteLinks: z.array(z.unknown()).default([]),
  weeklyReflections: z.array(z.unknown()).default([]),
  weeklyReportSnapshots: z.array(z.unknown()).default([]),
  learningJournal: z.array(z.unknown()).default([]),
  playgroundSolutions: z.array(z.unknown()).default([]),
  checklistItems: z.array(z.unknown()).default([]),
  metadata: z.array(z.unknown()).default([]),
  resources: z.array(z.unknown()).default([]),
  resourceProgress: z.array(z.unknown()).default([]),
  technicalEnglishItems: z.array(z.unknown()).default([]),
  technicalEnglishPractices: z.array(z.unknown()).default([]),
});

export const backupFileSchema = z.object({
  app: z.literal(BACKUP_APP_ID),
  backupVersion: z.number().refine((v) => v === BACKUP_VERSION, {
    message: `Unsupported backup version. Expected ${String(BACKUP_VERSION)}.`,
  }),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  audioNote: z.string().optional(),
  audioCount: z.number().default(0),
  data: backupDataSchema,
});

export type BackupFileParsed = z.infer<typeof backupFileSchema>;
