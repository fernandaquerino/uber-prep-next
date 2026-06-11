import { z } from "zod";

// Zod schemas for legacy localStorage data.
// Strategy: tolerant parsing — strip unknown fields, use defaults for optional,
// flag but don't discard records with critical invalid fields.

// ─── Block progress ───────────────────────────────────────────────────────────

const legacyBlockStatusSchema = z
  .enum(["pending", "in_progress", "done", "stuck", "skipped", "rescheduled"])
  .catch("pending");

export const legacyBlockProgressSchema = z
  .object({
    status: legacyBlockStatusSchema.optional(),
    patternUsed: z.string().optional(),
    difficulty: z.number().optional(),
    actualMinutes: z.number().optional(),
    completedAt: z.string().optional(),
  })
  .strip();

// ─── Review entry ─────────────────────────────────────────────────────────────

export const legacyReviewEntrySchema = z
  .object({
    blockKey: z.string(),
    blockLabel: z.string().optional(),
    leetcode: z.string().nullish(),
    nextReview: z.string().nullable(),
    cycleIndex: z.number().default(0),
    doneAt: z.string().optional(),
    reason: z.string().optional(),
    history: z.array(z.string()).default([]),
    selfRatings: z.array(z.object({ date: z.string(), result: z.string() })).optional(),
    lastRating: z.string().optional(),
  })
  .strip();

// ─── Mock ─────────────────────────────────────────────────────────────────────

export const legacyMockSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    date: z.string(),
    type: z.string(),
    question: z.string(),
    solution: z.string().optional(),
    feedback: z.string().optional(),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    nextSteps: z.string().optional(),
    rubric: z.record(z.string(), z.number()).optional(),
    readinessScore: z.number().optional(),
    hasAudio: z.boolean().default(false),
    createdAt: z.union([z.number(), z.string()]).optional(),
  })
  .strip();

// ─── Playground solution ──────────────────────────────────────────────────────

export const legacyPlaygroundSolutionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string().optional(),
    language: z.string().optional(),
    code: z.string().optional(),
    output: z.string().optional(),
    notes: z.string().optional(),
    category: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strip();

// ─── Journal entry ────────────────────────────────────────────────────────────

export const legacyJournalEntrySchema = z
  .object({
    content: z.string().optional(),
    mood: z.string().optional(),
    blockers: z.string().optional(),
    wins: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strip();

// ─── Weekly reflection ────────────────────────────────────────────────────────

export const legacyWeeklyReflectionSchema = z
  .object({
    weekNumber: z.number().optional(),
    content: z.string().optional(),
    rating: z.number().optional(),
    blockers: z.string().optional(),
    wins: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strip();

// ─── Topic note ───────────────────────────────────────────────────────────────

const legacyTopicNoteSchema = z.union([
  z.string(),
  z.object({ text: z.string().optional(), updatedAt: z.string().optional() }).strip(),
]);

// ─── uber-prep-v2 (main progress) ────────────────────────────────────────────

export const legacyProgressDataSchema = z
  .object({
    blocks: z.record(z.string(), legacyBlockProgressSchema).default({}),
    notes: z.record(z.string(), z.string()).default({}),
    topicNotes: z.record(z.string(), legacyTopicNoteSchema).default({}),
    goals: z.record(z.string(), z.boolean()).default({}),
    reviews: z.record(z.string(), legacyReviewEntrySchema).default({}),
    startDate: z.string().nullable().optional(),
    studyDays: z.array(z.string()).default([]),
    mocks: z.array(legacyMockSchema).default([]),
    playground: z.array(legacyPlaygroundSolutionSchema).default([]),
    learningJournal: z.record(z.string(), legacyJournalEntrySchema).default({}),
    weeklyReflections: z.record(z.string(), legacyWeeklyReflectionSchema).default({}),
    explainWithoutNotes: z
      .record(
        z.string(),
        z.record(
          z.string(),
          z.object({ answer: z.string().optional(), updatedAt: z.string().optional() }).strip(),
        ),
      )
      .default({}),
    systemDesignDrafts: z
      .record(
        z.string(),
        z.object({ answers: z.unknown().optional(), updatedAt: z.string().optional() }).strip(),
      )
      .default({}),
  })
  .strip();

export type LegacyProgressDataParsed = z.infer<typeof legacyProgressDataSchema>;

// ─── uber-prep-flashcards ─────────────────────────────────────────────────────

export const legacyFlashcardReviewSchema = z
  .object({
    date: z.string(),
    result: z.string(),
  })
  .strip();

export const legacyFlashcardSchema = z
  .object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    category: z.string().default("algo"),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().optional(),
    reviews: z.array(legacyFlashcardReviewSchema).default([]),
    nextReview: z.string().nullable().optional(),
    status: z.string().optional(),
    knownAt: z.string().nullable().optional(),
    lastReviewedAt: z.string().nullable().optional(),
    reviewCount: z.number().default(0),
  })
  .strip();

export const legacyFlashcardsDataSchema = z
  .object({
    cards: z.array(legacyFlashcardSchema).default([]),
  })
  .strip();

export type LegacyFlashcardsDataParsed = z.infer<typeof legacyFlashcardsDataSchema>;

// ─── uber-prep-quizzes ────────────────────────────────────────────────────────

export const legacyQuizAttemptSchema = z
  .object({
    id: z.string(),
    quizId: z.string().nullable().optional(),
    dailyDate: z.string().nullable().optional(),
    attemptNumber: z.number().default(1),
    mode: z.string().default("practice"),
    questionIds: z.array(z.string()).default([]),
    startedAt: z.string().optional(),
    finishedAt: z.string().optional(),
    createdAt: z.string().optional(),
    totalQuestions: z.number().optional(),
    correctAnswers: z.number().optional(),
    wrongAnswers: z.number().optional(),
    skippedAnswers: z.number().optional(),
    accuracyPercentage: z.number().optional(),
    total: z.number().optional(),
    correct: z.number().optional(),
    accuracy: z.number().optional(),
    totalTimeSeconds: z.number().optional(),
    averageTimePerQuestion: z.number().optional(),
    avgTime: z.number().optional(),
  })
  .strip();

export const legacyQuizAnswerSchema = z
  .object({
    questionId: z.string(),
    attemptId: z.string().optional(),
    value: z.string().optional(),
    selfScore: z.string().optional(),
    skipped: z.boolean().default(false),
    correct: z.boolean().default(false),
    topic: z.string().optional(),
    group: z.string().optional(),
    difficulty: z.string().optional(),
    type: z.string().optional(),
    answeredAt: z.string().optional(),
    elapsedSeconds: z.number().optional(),
  })
  .strip();

export const legacyQuizReviewSchema = z
  .object({
    questionId: z.string().optional(),
    topic: z.string().optional(),
    group: z.string().optional(),
    difficulty: z.string().optional(),
    nextReview: z.string().nullable().optional(),
    cycleIndex: z.number().default(0),
    createdAt: z.string().optional(),
    history: z.array(z.string()).default([]),
    lastAnswer: z.string().optional(),
    lastRating: z.string().optional(),
  })
  .strip();

export const legacyQuizzesDataSchema = z
  .object({
    attempts: z.array(legacyQuizAttemptSchema).default([]),
    answers: z.array(legacyQuizAnswerSchema).default([]),
    reviews: z.record(z.string(), legacyQuizReviewSchema).default({}),
    customQuestions: z.array(z.unknown()).default([]),
    dailyQuizzes: z.record(z.string(), z.unknown()).default({}),
    markedQuestions: z.record(z.string(), z.boolean()).default({}),
  })
  .strip();

export type LegacyQuizzesDataParsed = z.infer<typeof legacyQuizzesDataSchema>;

// ─── uber-prep-timer-sessions ─────────────────────────────────────────────────

export const legacyTimerSessionSchema = z
  .object({
    id: z.string().optional(),
    category: z.string().default("geral"),
    duration: z.number().optional(),
    preset: z.number().optional(),
    completedAt: z.string().optional(),
    date: z.string().optional(),
    weekNumber: z.number().optional(),
  })
  .strip();

export const legacyTimerSessionsSchema = z.array(legacyTimerSessionSchema);

// ─── uber-prep-active-timer ───────────────────────────────────────────────────

export const legacyActiveTimerSchema = z
  .object({
    preset: z.number().optional(),
    total: z.number().optional(),
    remaining: z.number().optional(),
    running: z.boolean().optional(),
    finished: z.boolean().optional(),
    muted: z.boolean().optional(),
    category: z.string().optional(),
    deadline: z.number().nullable().optional(),
    savedElapsed: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .strip();

// ─── uber-prep-checklist ──────────────────────────────────────────────────────

export const legacyChecklistDataSchema = z
  .object({
    checked: z.record(z.string(), z.boolean()).default({}),
    evidence: z.record(z.string(), z.string()).default({}),
  })
  .strip();

export type LegacyChecklistDataParsed = z.infer<typeof legacyChecklistDataSchema>;

// ─── Theme ────────────────────────────────────────────────────────────────────

export const legacyThemeSchema = z.enum(["light", "dark"]).catch("dark");
