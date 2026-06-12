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
  planDayId: z.string().optional(),
  planDaySequence: z.number().optional(),
  status: z.enum(["pending", "in_progress", "completed", "stuck", "skipped"]),
  scheduledDate: z.string().optional(),
  originalScheduledDate: z.string().optional(),
  startedAt: z.string().optional(),
  skippedAt: z.string().optional(),
  notes: z.string().optional(),
  patternUsed: z.string().optional(),
  difficulty: z.number().optional(),
  confidence: z.number().optional(),
  actualMinutes: z.number().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const progressEventRecordSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  type: z.enum([
    "created",
    "started",
    "completed",
    "marked_stuck",
    "returned_to_pending",
    "skipped",
    "restored",
    "rescheduled",
    "schedule_shifted",
    "notes_updated",
    "difficulty_updated",
    "confidence_updated",
    "minutes_updated",
    "undone",
  ]),
  occurredAt: z.string(),
  previousProgress: planProgressRecordSchema.optional(),
  nextProgress: planProgressRecordSchema.optional(),
  previousValue: z.unknown().optional(),
  nextValue: z.unknown().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  actionGroupId: z.string().optional(),
  undoneAt: z.string().optional(),
});

export const scheduleOverrideRecordSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  type: z.enum(["reschedule", "shift"]),
  fromDate: z.string(),
  toDate: z.string(),
  createdAt: z.string(),
  actionGroupId: z.string().optional(),
});

export const reviewHistoryEntrySchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  result: z.enum(["good", "again", "hard", "easy"]).optional(),
  previousCycleIndex: z.number().optional(),
  nextCycleIndex: z.number().optional(),
  nextReviewAt: z.string().optional(),
  response: z.string().optional(),
});

export const reviewRecordSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["plan", "flashcard", "quiz", "mock", "manual"]),
  sourceId: z.string(),
  status: z.enum(["scheduled", "due", "completed", "dismissed", "rescheduled", "cancelled"]),
  scheduledFor: z.string(),
  originalScheduledFor: z.string().optional(),
  cycleIndex: z.number(),
  reason: z.string().optional(),
  lastResult: z.enum(["good", "again", "hard", "easy"]).optional(),
  lastRating: z.enum(["good", "again", "hard", "easy"]).optional(),
  history: z.array(reviewHistoryEntrySchema),
  legacyBlockKey: z.string().optional(),
  legacyBlockLabel: z.string().optional(),
  legacyLeetcode: z.string().nullable().optional(),
  doneAt: z.string().optional(),
  markedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  dismissedAt: z.string().optional(),
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

export const activeTimerRecordSchema = z.object({
  id: z.literal("active-timer"),
  mode: z.enum(["countdown", "stopwatch"]),
  status: z.enum(["running", "paused"]),
  sourceType: z.enum([
    "plan_block",
    "review",
    "flashcard_session",
    "quiz_session",
    "playground_solution",
    "mock",
    "manual",
    "general",
  ]),
  sourceId: z.string().optional(),
  category: z.string(),
  title: z.string(),
  targetDurationSeconds: z.number().optional(),
  startedAt: z.string(),
  lastResumedAt: z.string(),
  pausedAt: z.string().optional(),
  accumulatedSeconds: z.number(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const timerSessionRecordSchema = z.object({
  id: z.string(),
  sourceType: z.enum([
    "plan_block",
    "review",
    "flashcard_session",
    "quiz_session",
    "playground_solution",
    "mock",
    "manual",
    "general",
  ]),
  sourceId: z.string().optional(),
  category: z.string(),
  title: z.string(),
  mode: z.enum(["countdown", "stopwatch"]),
  status: z.enum(["completed", "stopped_early", "cancelled"]),
  targetDurationSeconds: z.number().optional(),
  actualDurationSeconds: z.number(),
  startedAt: z.string(),
  endedAt: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const timerSettingsRecordSchema = z.object({
  id: z.literal("timer-settings"),
  defaultMode: z.enum(["countdown", "stopwatch"]),
  defaultPresetSeconds: z.number(),
  soundEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
  confirmBeforeCancel: z.boolean(),
  showCompactTimer: z.boolean(),
  longSessionThresholdSeconds: z.number(),
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
