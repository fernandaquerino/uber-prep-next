import { z } from "zod";
import { BACKUP_APP_ID, BACKUP_VERSION } from "@/types/backup";

export const backupDataSchema = z.object({
  settings: z.array(z.unknown()),
  planProgress: z.array(z.unknown()),
  reviews: z.array(z.unknown()),
  flashcards: z.array(z.unknown()),
  quizAttempts: z.array(z.unknown()),
  quizReviews: z.array(z.unknown()),
  timerSessions: z.array(z.unknown()),
  mocks: z.array(z.unknown()),
  notes: z.array(z.unknown()),
  weeklyReflections: z.array(z.unknown()),
  learningJournal: z.array(z.unknown()),
  playgroundSolutions: z.array(z.unknown()),
  checklistItems: z.array(z.unknown()),
  metadata: z.array(z.unknown()),
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
