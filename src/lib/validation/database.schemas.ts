import { z } from "zod";

// Validation schemas for records read from IndexedDB.
// Used at the database boundary to ensure type safety on reads.

export const settingsRecordSchema = z.object({
  id: z.literal("app-settings"),
  startDate: z.string().nullable(),
  timezone: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const planProgressRecordSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  legacyBlockKey: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "stuck", "skipped", "rescheduled"]),
  scheduledDate: z.string().optional(),
  originalScheduledDate: z.string().optional(),
  notes: z.string().optional(),
  patternUsed: z.string().optional(),
  difficulty: z.number().optional(),
  actualMinutes: z.number().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reviewHistoryEntrySchema = z.object({
  date: z.string(),
  result: z.enum(["good", "again", "hard"]).optional(),
});

export const reviewRecordSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["plan", "flashcard", "quiz", "mock", "manual"]),
  sourceId: z.string(),
  status: z.enum(["scheduled", "due", "completed", "dismissed", "rescheduled"]),
  scheduledFor: z.string(),
  cycleIndex: z.number(),
  reason: z.string().optional(),
  lastRating: z.enum(["good", "again", "hard"]).optional(),
  history: z.array(reviewHistoryEntrySchema),
  legacyBlockKey: z.string().optional(),
  legacyBlockLabel: z.string().optional(),
  legacyLeetcode: z.string().nullable().optional(),
  doneAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const flashcardReviewEntrySchema = z.object({
  date: z.string(),
  result: z.enum(["knew", "didnt"]),
});

export const flashcardRecordSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["pending", "known", "review"]),
  source: z.enum(["initial", "user", "migrated"]),
  nextReview: z.string().nullable(),
  knownAt: z.string().nullable(),
  lastReviewedAt: z.string().nullable(),
  reviewCount: z.number(),
  reviews: z.array(flashcardReviewEntrySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const metadataRecordSchema = z.object({
  id: z.literal("app-metadata"),
  schemaVersion: z.number(),
  migrationStatus: z.enum(["none", "completed", "partial", "failed"]),
  migratedAt: z.string().nullable(),
  backupVersion: z.number(),
  seedsRun: z.array(z.string()),
  lastMigrationReport: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
