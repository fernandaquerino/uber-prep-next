import type { UberPrepDatabase } from "./schema";
import { AUDIO_MIGRATION_MAX_BYTES, METADATA_ID, SETTINGS_ID } from "./constants";
import {
  legacyChecklistDataSchema,
  legacyFlashcardsDataSchema,
  legacyProgressDataSchema,
  legacyQuizzesDataSchema,
  legacyTimerSessionsSchema,
  legacyThemeSchema,
} from "@/lib/validation/legacy.schemas";
import { LEGACY_STORAGE_KEYS, MOCK_AUDIO_KEY_PREFIX } from "@/types/legacy";
import type {
  ChecklistItemRecord,
  FlashcardRecord,
  FlashcardStatus,
  LearningJournalRecord,
  MetadataRecord,
  MigrationIssue,
  MigrationReport,
  MockAudioRecord,
  MockRecord,
  MockType,
  NoteRecord,
  PlanProgressRecord,
  PlaygroundSolutionRecord,
  QuizAttemptRecord,
  QuizReviewRecord,
  ReviewRecord,
  ReviewHistoryEntry,
  SettingsRecord,
  TimerSessionRecord,
  WeeklyReflectionRecord,
} from "@/types/database";
import { DATABASE_VERSION } from "./constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function safeId(value: string | number | undefined, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Audio migration ──────────────────────────────────────────────────────────

async function migrateAudioForMock(
  db: UberPrepDatabase,
  mockId: string,
  audioFailures: MigrationIssue[],
): Promise<void> {
  const key = `${MOCK_AUDIO_KEY_PREFIX}${mockId}`;
  const raw = readLocalStorage(key);
  if (!raw) return;

  const sizeBytes = raw.length;
  if (sizeBytes > AUDIO_MIGRATION_MAX_BYTES) {
    audioFailures.push({
      source: "mockAudio",
      id: mockId,
      reason: `Audio too large (${sizeBytes} bytes), skipped`,
    });
    return;
  }

  try {
    const mime = raw.match(/^data:([^;]+);base64,/)?.[1] ?? "audio/webm";
    const base64 = raw.replace(/^data:[^;]+;base64,/, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });

    const audioRecord: MockAudioRecord = {
      id: `audio-${mockId}`,
      mockId,
      blob,
      mimeType: mime,
      sizeBytes: blob.size,
      createdAt: nowIso(),
    };
    await db.mockAudio.put(audioRecord);
  } catch (err) {
    audioFailures.push({
      source: "mockAudio",
      id: mockId,
      reason: `Failed to decode audio: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

// ─── Source readers ───────────────────────────────────────────────────────────

async function migrateProgress(
  db: UberPrepDatabase,
  imported: Record<string, number>,
  skipped: Record<string, number>,
  conflicts: MigrationIssue[],
  invalidRecords: MigrationIssue[],
  audioFailures: MigrationIssue[],
): Promise<void> {
  const raw = parseJson(readLocalStorage(LEGACY_STORAGE_KEYS.progress));
  if (!raw) return;

  const result = legacyProgressDataSchema.safeParse(raw);
  if (!result.success) {
    invalidRecords.push({ source: "progress", reason: "Top-level parse failed" });
    return;
  }

  const data = result.data;
  const now = nowIso();

  // Settings — start date and theme
  const legacyThemeRaw = readLocalStorage(LEGACY_STORAGE_KEYS.theme);
  const theme = legacyThemeSchema.parse(legacyThemeRaw ?? "dark");
  const existingSettings = await db.settings.get(SETTINGS_ID);
  if (!existingSettings) {
    const settingsRecord: SettingsRecord = {
      id: SETTINGS_ID,
      startDate: data.startDate ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      theme,
      createdAt: now,
      updatedAt: now,
    };
    await db.settings.put(settingsRecord);
    imported["settings"] = (imported["settings"] ?? 0) + 1;
  } else {
    skipped["settings"] = (skipped["settings"] ?? 0) + 1;
  }

  // Plan progress
  for (const [blockKey, block] of Object.entries(data.blocks)) {
    const id = `block-${blockKey}`;
    const existing = await db.planProgress.get(id);
    if (existing) {
      conflicts.push({ source: "planProgress", id, reason: "existing DB record kept" });
      skipped["planProgress"] = (skipped["planProgress"] ?? 0) + 1;
      continue;
    }

    const legacyStatus = block.status ?? "pending";
    const mappedStatus: PlanProgressRecord["status"] =
      legacyStatus === "done"
        ? "completed"
        : legacyStatus === "rescheduled"
          ? "pending"
          : (legacyStatus as PlanProgressRecord["status"]);

    const record: PlanProgressRecord = {
      id,
      blockId: blockKey,
      legacyBlockKey: blockKey,
      status: mappedStatus,
      notes: data.notes?.[blockKey],
      patternUsed: block.patternUsed,
      difficulty: block.difficulty,
      actualMinutes: block.actualMinutes,
      completedAt: block.completedAt,
      createdAt: now,
      updatedAt: now,
    };
    await db.planProgress.put(record);
    imported["planProgress"] = (imported["planProgress"] ?? 0) + 1;
  }

  // Reviews
  for (const [blockKey, entry] of Object.entries(data.reviews)) {
    const id = `rev-${blockKey}`;
    const existing = await db.reviews.get(id);
    if (existing) {
      conflicts.push({ source: "reviews", id, reason: "existing DB record kept" });
      skipped["reviews"] = (skipped["reviews"] ?? 0) + 1;
      continue;
    }

    const history: ReviewHistoryEntry[] = (entry.history ?? []).map((date) => ({ date }));
    const record: ReviewRecord = {
      id,
      sourceType: "plan",
      sourceId: `block-${blockKey}`,
      status: entry.nextReview ? "scheduled" : "completed",
      scheduledFor: entry.nextReview ?? now.slice(0, 10),
      cycleIndex: entry.cycleIndex,
      reason: entry.reason,
      lastRating: entry.lastRating as ReviewRecord["lastRating"] | undefined,
      history,
      legacyBlockKey: entry.blockKey,
      legacyBlockLabel: entry.blockLabel,
      legacyLeetcode: entry.leetcode ?? null,
      doneAt: entry.doneAt,
      createdAt: now,
      updatedAt: now,
    };
    await db.reviews.put(record);
    imported["reviews"] = (imported["reviews"] ?? 0) + 1;
  }

  // Mocks
  for (let i = 0; i < data.mocks.length; i++) {
    const m = data.mocks[i];
    const id = safeId(m.id, `mock-legacy-${i}`);
    const existing = await db.mocks.get(id);
    if (existing) {
      conflicts.push({ source: "mocks", id, reason: "existing DB record kept" });
      skipped["mocks"] = (skipped["mocks"] ?? 0) + 1;
      continue;
    }

    const VALID_MOCK_TYPES: MockType[] = ["Coding", "System Design", "Behavioral", "Full Loop"];
    const type: MockType = VALID_MOCK_TYPES.includes(m.type as MockType)
      ? (m.type as MockType)
      : "Coding";

    let createdAt = now;
    if (typeof m.createdAt === "string") createdAt = m.createdAt;
    else if (typeof m.createdAt === "number") createdAt = new Date(m.createdAt).toISOString();

    const record: MockRecord = {
      id,
      date: m.date,
      type,
      question: m.question,
      solution: m.solution,
      feedback: m.feedback,
      strengths: m.strengths,
      weaknesses: m.weaknesses,
      nextSteps: m.nextSteps,
      rubric: m.rubric,
      readinessScore: m.readinessScore,
      hasAudio: m.hasAudio,
      createdAt,
    };
    await db.mocks.put(record);
    imported["mocks"] = (imported["mocks"] ?? 0) + 1;

    if (m.hasAudio) {
      await migrateAudioForMock(db, id, audioFailures);
    }
  }

  // Playground
  for (let i = 0; i < data.playground.length; i++) {
    const p = data.playground[i];
    const id = safeId(p.id, `playground-legacy-${i}`);
    const existing = await db.playgroundSolutions.get(id);
    if (existing) {
      conflicts.push({ source: "playgroundSolutions", id, reason: "existing DB record kept" });
      skipped["playgroundSolutions"] = (skipped["playgroundSolutions"] ?? 0) + 1;
      continue;
    }

    const record: PlaygroundSolutionRecord = {
      id,
      title: p.title,
      language: p.language,
      code: p.code,
      output: p.output,
      notes: p.notes,
      category: p.category,
      createdAt: p.createdAt ?? now,
      updatedAt: p.updatedAt ?? now,
    };
    await db.playgroundSolutions.put(record);
    imported["playgroundSolutions"] = (imported["playgroundSolutions"] ?? 0) + 1;
  }

  // Learning journal
  for (const [date, entry] of Object.entries(data.learningJournal)) {
    const id = `journal-${date}`;
    const existing = await db.learningJournal.get(id);
    if (existing) {
      conflicts.push({ source: "learningJournal", id, reason: "existing DB record kept" });
      skipped["learningJournal"] = (skipped["learningJournal"] ?? 0) + 1;
      continue;
    }

    const record: LearningJournalRecord = {
      id,
      date,
      content: entry.content,
      mood: entry.mood,
      blockers: entry.blockers,
      wins: entry.wins,
      createdAt: entry.updatedAt ?? now,
      updatedAt: entry.updatedAt ?? now,
    };
    await db.learningJournal.put(record);
    imported["learningJournal"] = (imported["learningJournal"] ?? 0) + 1;
  }

  // Weekly reflections
  for (const [key, ref] of Object.entries(data.weeklyReflections)) {
    const id = `weekly-${key}`;
    const existing = await db.weeklyReflections.get(id);
    if (existing) {
      conflicts.push({ source: "weeklyReflections", id, reason: "existing DB record kept" });
      skipped["weeklyReflections"] = (skipped["weeklyReflections"] ?? 0) + 1;
      continue;
    }

    const record: WeeklyReflectionRecord = {
      id,
      weekNumber: ref.weekNumber ?? (parseInt(key, 10) || 1),
      content: ref.content,
      rating: ref.rating,
      blockers: ref.blockers,
      wins: ref.wins,
      createdAt: ref.createdAt ?? now,
      updatedAt: ref.updatedAt ?? now,
    };
    await db.weeklyReflections.put(record);
    imported["weeklyReflections"] = (imported["weeklyReflections"] ?? 0) + 1;
  }

  // Topic notes
  for (const [topicId, raw] of Object.entries(data.topicNotes)) {
    const id = `note-topic-${topicId}`;
    const existing = await db.notes.get(id);
    if (existing) {
      conflicts.push({ source: "notes", id, reason: "existing DB record kept" });
      skipped["notes"] = (skipped["notes"] ?? 0) + 1;
      continue;
    }

    const content = typeof raw === "string" ? raw : (raw.text ?? "");
    if (!content) continue;

    const record: NoteRecord = {
      id,
      type: "topic",
      topicId,
      content,
      createdAt: now,
      updatedAt: typeof raw === "object" && raw.updatedAt ? raw.updatedAt : now,
    };
    await db.notes.put(record);
    imported["notes"] = (imported["notes"] ?? 0) + 1;
  }
}

async function migrateFlashcards(
  db: UberPrepDatabase,
  imported: Record<string, number>,
  skipped: Record<string, number>,
  conflicts: MigrationIssue[],
  invalidRecords: MigrationIssue[],
): Promise<void> {
  const raw = parseJson(readLocalStorage(LEGACY_STORAGE_KEYS.flashcards));
  if (!raw) return;

  const result = legacyFlashcardsDataSchema.safeParse(raw);
  if (!result.success) {
    invalidRecords.push({ source: "flashcards", reason: "Top-level parse failed" });
    return;
  }

  const now = nowIso();
  const VALID_STATUSES: FlashcardStatus[] = ["pending", "known", "review"];

  for (const card of result.data.cards) {
    const id = card.id;
    const existing = await db.flashcards.get(id);
    if (existing) {
      conflicts.push({ source: "flashcards", id, reason: "existing DB record kept" });
      skipped["flashcards"] = (skipped["flashcards"] ?? 0) + 1;
      continue;
    }

    const status: FlashcardStatus = VALID_STATUSES.includes(card.status as FlashcardStatus)
      ? (card.status as FlashcardStatus)
      : "pending";

    const reviews = card.reviews.map((r) => ({
      date: r.date,
      result: (r.result === "knew" || r.result === "didnt" ? r.result : "didnt") as
        | "knew"
        | "didnt",
    }));

    const record: FlashcardRecord = {
      id,
      front: card.front,
      back: card.back,
      category: card.category,
      tags: card.tags,
      status,
      source: "migrated",
      nextReview: card.nextReview ?? null,
      knownAt: card.knownAt ?? null,
      lastReviewedAt: card.lastReviewedAt ?? null,
      reviewCount: card.reviewCount,
      reviews,
      createdAt: card.createdAt ?? now,
      updatedAt: now,
    };
    await db.flashcards.put(record);
    imported["flashcards"] = (imported["flashcards"] ?? 0) + 1;
  }
}

async function migrateQuizzes(
  db: UberPrepDatabase,
  imported: Record<string, number>,
  skipped: Record<string, number>,
  conflicts: MigrationIssue[],
  invalidRecords: MigrationIssue[],
): Promise<void> {
  const raw = parseJson(readLocalStorage(LEGACY_STORAGE_KEYS.quizzes));
  if (!raw) return;

  const result = legacyQuizzesDataSchema.safeParse(raw);
  if (!result.success) {
    invalidRecords.push({ source: "quizzes", reason: "Top-level parse failed" });
    return;
  }

  const now = nowIso();
  const data = result.data;

  // Attempts
  for (let i = 0; i < data.attempts.length; i++) {
    const a = data.attempts[i];
    const id = a.id;
    const existing = await db.quizAttempts.get(id);
    if (existing) {
      conflicts.push({ source: "quizAttempts", id, reason: "existing DB record kept" });
      skipped["quizAttempts"] = (skipped["quizAttempts"] ?? 0) + 1;
      continue;
    }

    const record: QuizAttemptRecord = {
      id,
      quizId: a.quizId ?? null,
      dailyDate: a.dailyDate ?? null,
      attemptNumber: a.attemptNumber,
      mode: a.mode,
      questionIds: a.questionIds,
      startedAt: a.startedAt ?? now,
      finishedAt: a.finishedAt ?? now,
      createdAt: a.createdAt ?? now,
      totalQuestions: a.totalQuestions ?? a.total ?? a.questionIds.length,
      correctAnswers: a.correctAnswers ?? a.correct ?? 0,
      wrongAnswers: a.wrongAnswers ?? 0,
      skippedAnswers: a.skippedAnswers ?? 0,
      accuracyPercentage: a.accuracyPercentage ?? a.accuracy ?? 0,
      totalTimeSeconds: a.totalTimeSeconds ?? 0,
      averageTimePerQuestion: a.averageTimePerQuestion ?? a.avgTime ?? 0,
    };
    await db.quizAttempts.put(record);
    imported["quizAttempts"] = (imported["quizAttempts"] ?? 0) + 1;
  }

  // Reviews (keyed by questionId in legacy)
  for (const [questionId, rev] of Object.entries(data.reviews)) {
    const id = `qrev-${questionId}`;
    const existing = await db.quizReviews.get(id);
    if (existing) {
      conflicts.push({ source: "quizReviews", id, reason: "existing DB record kept" });
      skipped["quizReviews"] = (skipped["quizReviews"] ?? 0) + 1;
      continue;
    }

    const record: QuizReviewRecord = {
      id,
      questionId: rev.questionId ?? questionId,
      topic: rev.topic,
      group: rev.group,
      difficulty: rev.difficulty,
      nextReview: rev.nextReview ?? null,
      cycleIndex: rev.cycleIndex,
      history: rev.history,
      lastAnswer: rev.lastAnswer,
      lastRating: rev.lastRating,
      createdAt: rev.createdAt ?? now,
      updatedAt: now,
    };
    await db.quizReviews.put(record);
    imported["quizReviews"] = (imported["quizReviews"] ?? 0) + 1;
  }
}

async function migrateTimerSessions(
  db: UberPrepDatabase,
  imported: Record<string, number>,
  skipped: Record<string, number>,
  conflicts: MigrationIssue[],
  invalidRecords: MigrationIssue[],
): Promise<void> {
  const raw = parseJson(readLocalStorage(LEGACY_STORAGE_KEYS.timerSessions));
  if (!raw) return;

  const result = legacyTimerSessionsSchema.safeParse(raw);
  if (!result.success) {
    invalidRecords.push({ source: "timerSessions", reason: "Top-level parse failed" });
    return;
  }

  const now = nowIso();

  for (let i = 0; i < result.data.length; i++) {
    const s = result.data[i];
    const id = s.id ?? `timer-legacy-${i}`;
    const existing = await db.timerSessions.get(id);
    if (existing) {
      conflicts.push({ source: "timerSessions", id, reason: "existing DB record kept" });
      skipped["timerSessions"] = (skipped["timerSessions"] ?? 0) + 1;
      continue;
    }

    const record: TimerSessionRecord = {
      id,
      category: s.category,
      durationSeconds: s.duration ?? 0,
      presetSeconds: s.preset ?? 0,
      startedAt: s.completedAt ?? now,
      completedAt: s.completedAt ?? now,
      date: s.date ?? (s.completedAt ? s.completedAt.slice(0, 10) : now.slice(0, 10)),
      weekNumber: s.weekNumber,
      status: "completed",
    };
    await db.timerSessions.put(record);
    imported["timerSessions"] = (imported["timerSessions"] ?? 0) + 1;
  }
}

async function migrateChecklist(
  db: UberPrepDatabase,
  imported: Record<string, number>,
  skipped: Record<string, number>,
  conflicts: MigrationIssue[],
  invalidRecords: MigrationIssue[],
): Promise<void> {
  const raw = parseJson(readLocalStorage(LEGACY_STORAGE_KEYS.checklist));
  if (!raw) return;

  const result = legacyChecklistDataSchema.safeParse(raw);
  if (!result.success) {
    invalidRecords.push({ source: "checklist", reason: "Top-level parse failed" });
    return;
  }

  const now = nowIso();
  const { checked, evidence } = result.data;

  for (const [itemId, isChecked] of Object.entries(checked)) {
    const id = `checklist-${itemId}`;
    const existing = await db.checklistItems.get(id);
    if (existing) {
      conflicts.push({ source: "checklistItems", id, reason: "existing DB record kept" });
      skipped["checklistItems"] = (skipped["checklistItems"] ?? 0) + 1;
      continue;
    }

    const phaseParts = itemId.split("-");
    const phase = phaseParts.length > 1 ? phaseParts[0] : "geral";

    const record: ChecklistItemRecord = {
      id,
      phase,
      itemText: itemId,
      checked: isChecked,
      evidence: evidence[itemId] ?? null,
      updatedAt: now,
    };
    await db.checklistItems.put(record);
    imported["checklistItems"] = (imported["checklistItems"] ?? 0) + 1;
  }
}

// ─── Main migration entry point ───────────────────────────────────────────────

export async function runLegacyMigration(db: UberPrepDatabase): Promise<MigrationReport> {
  const startedAt = nowIso();

  // Idempotency check — if already completed, return early
  const meta = await db.metadata.get(METADATA_ID);
  if (meta?.migrationStatus === "completed") {
    return meta.lastMigrationReport ?? buildEmptyReport(startedAt, "success");
  }

  // Check which localStorage sources exist
  const sourcesFound: string[] = [];
  if (readLocalStorage(LEGACY_STORAGE_KEYS.progress)) sourcesFound.push("progress");
  if (readLocalStorage(LEGACY_STORAGE_KEYS.flashcards)) sourcesFound.push("flashcards");
  if (readLocalStorage(LEGACY_STORAGE_KEYS.quizzes)) sourcesFound.push("quizzes");
  if (readLocalStorage(LEGACY_STORAGE_KEYS.timerSessions)) sourcesFound.push("timerSessions");
  if (readLocalStorage(LEGACY_STORAGE_KEYS.checklist)) sourcesFound.push("checklist");

  if (sourcesFound.length === 0) {
    const report = buildEmptyReport(startedAt, "success");
    report.sourcesFound = [];
    await persistMigrationResult(db, "completed", report);
    return report;
  }

  const imported: Record<string, number> = {};
  const skipped: Record<string, number> = {};
  const conflicts: MigrationIssue[] = [];
  const invalidRecords: MigrationIssue[] = [];
  const orphanedRecords: MigrationIssue[] = [];
  const audioFailures: MigrationIssue[] = [];

  try {
    await migrateProgress(db, imported, skipped, conflicts, invalidRecords, audioFailures);
    await migrateFlashcards(db, imported, skipped, conflicts, invalidRecords);
    await migrateQuizzes(db, imported, skipped, conflicts, invalidRecords);
    await migrateTimerSessions(db, imported, skipped, conflicts, invalidRecords);
    await migrateChecklist(db, imported, skipped, conflicts, invalidRecords);

    const hasProblems = invalidRecords.length > 0 || audioFailures.length > 0;
    const status: MigrationReport["status"] = hasProblems ? "partial" : "success";
    const migrationStatus = hasProblems ? "partial" : "completed";

    const report: MigrationReport = {
      startedAt,
      finishedAt: nowIso(),
      status,
      sourcesFound,
      imported,
      skipped,
      conflicts,
      invalidRecords,
      orphanedRecords,
      audioFailures,
    };
    await persistMigrationResult(db, migrationStatus, report);
    return report;
  } catch (err) {
    const report: MigrationReport = {
      startedAt,
      finishedAt: nowIso(),
      status: "failed",
      sourcesFound,
      imported,
      skipped,
      conflicts,
      invalidRecords,
      orphanedRecords,
      audioFailures: [
        ...audioFailures,
        {
          source: "migration",
          reason: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
    };
    await persistMigrationResult(db, "failed", report);
    return report;
  }
}

function buildEmptyReport(startedAt: string, status: MigrationReport["status"]): MigrationReport {
  return {
    startedAt,
    finishedAt: nowIso(),
    status,
    sourcesFound: [],
    imported: {},
    skipped: {},
    conflicts: [],
    invalidRecords: [],
    orphanedRecords: [],
    audioFailures: [],
  };
}

async function persistMigrationResult(
  db: UberPrepDatabase,
  status: MetadataRecord["migrationStatus"],
  report: MigrationReport,
): Promise<void> {
  const now = nowIso();
  const existing = await db.metadata.get(METADATA_ID);
  const base: MetadataRecord = existing ?? {
    id: METADATA_ID,
    schemaVersion: DATABASE_VERSION,
    migrationStatus: status,
    migratedAt: now,
    backupVersion: 1,
    seedsRun: [],
    createdAt: now,
    updatedAt: now,
  };

  await db.metadata.put({
    ...base,
    migrationStatus: status,
    migratedAt: now,
    lastMigrationReport: report,
    updatedAt: now,
  });
}
