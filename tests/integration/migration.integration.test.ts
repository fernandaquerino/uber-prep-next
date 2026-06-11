import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { runLegacyMigration } from "@/lib/db/migrations";
import { LEGACY_STORAGE_KEYS } from "@/types/legacy";
import { METADATA_ID } from "@/lib/db/constants";
import {
  LEGACY_PROGRESS_FIXTURE,
  LEGACY_FLASHCARDS_FIXTURE,
  LEGACY_QUIZZES_FIXTURE,
  LEGACY_TIMER_SESSIONS_FIXTURE,
  LEGACY_CHECKLIST_FIXTURE,
} from "../fixtures/legacy-fixtures";
import type { UberPrepDatabase } from "@/lib/db/db";

// Stub localStorage with fixture data
function setLocalStorage(data: Record<string, string>) {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data[key] ?? null,
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: Object.keys(data).length,
    key: (i: number) => Object.keys(data)[i] ?? null,
  });
}

let db: UberPrepDatabase;

beforeEach(() => {
  db = createTestDatabase();
  // Initialize metadata so migration can persist results
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runLegacyMigration", () => {
  it("returns success with no sources when localStorage is empty", async () => {
    setLocalStorage({});
    const report = await runLegacyMigration(db);
    expect(report.status).toBe("success");
    expect(report.sourcesFound).toHaveLength(0);
  });

  it("migrates plan progress from legacy progress data", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    const report = await runLegacyMigration(db);
    expect(report.sourcesFound).toContain("progress");
    const blocks = await db.planProgress.toArray();
    expect(blocks.length).toBeGreaterThan(0);
    const completedBlock = blocks.find((b) => b.legacyBlockKey === "w1-d1-b0");
    expect(completedBlock?.status).toBe("completed");
  });

  it("migrates reviews from legacy progress data", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    await runLegacyMigration(db);
    const reviews = await db.reviews.toArray();
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].sourceType).toBe("plan");
  });

  it("migrates mocks from legacy progress data", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    await runLegacyMigration(db);
    const mocks = await db.mocks.toArray();
    expect(mocks.length).toBe(1);
    expect(mocks[0].id).toBe("mock-1");
    expect(mocks[0].type).toBe("Coding");
  });

  it("migrates flashcards", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.flashcards]: LEGACY_FLASHCARDS_FIXTURE });
    await runLegacyMigration(db);
    const flashcards = await db.flashcards.toArray();
    expect(flashcards.length).toBe(2);
    const userCard = flashcards.find((c) => c.id === "fc-user-1");
    expect(userCard?.source).toBe("migrated");
    expect(userCard?.status).toBe("review");
  });

  it("migrates quiz attempts and reviews", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.quizzes]: LEGACY_QUIZZES_FIXTURE });
    await runLegacyMigration(db);
    const attempts = await db.quizAttempts.toArray();
    const quizReviews = await db.quizReviews.toArray();
    expect(attempts.length).toBe(1);
    expect(quizReviews.length).toBe(1);
    expect(quizReviews[0].questionId).toBe("q1");
  });

  it("migrates timer sessions", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.timerSessions]: LEGACY_TIMER_SESSIONS_FIXTURE });
    await runLegacyMigration(db);
    const sessions = await db.timerSessions.toArray();
    expect(sessions.length).toBe(2);
    expect(sessions.find((s) => s.id === "timer-1")).toBeDefined();
  });

  it("migrates checklist items", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.checklist]: LEGACY_CHECKLIST_FIXTURE });
    await runLegacyMigration(db);
    const items = await db.checklistItems.toArray();
    expect(items.length).toBe(3);
    const checked = items.find((i) => i.id === "checklist-phase1-item1");
    expect(checked?.checked).toBe(true);
    expect(checked?.evidence).toBe("Completed all easy LeetCode problems");
  });

  it("is idempotent — second run returns same completed report", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    const report1 = await runLegacyMigration(db);
    expect(report1.status).toBe("success");

    const report2 = await runLegacyMigration(db);
    expect(report2.status).toBe("success");

    // No new records added on second run
    const progressCount = await db.planProgress.count();
    expect(progressCount).toBe(2);
  });

  it("existing DB records are preserved on conflict", async () => {
    // Pre-populate a record with different data
    const now = new Date().toISOString();
    await db.planProgress.put({
      id: "block-w1-d1-b0",
      blockId: "w1-d1-b0",
      legacyBlockKey: "w1-d1-b0",
      status: "in_progress",
      createdAt: now,
      updatedAt: now,
    });

    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    const report = await runLegacyMigration(db);

    const block = await db.planProgress.get("block-w1-d1-b0");
    expect(block?.status).toBe("in_progress"); // existing value preserved
    expect(report.conflicts.length).toBeGreaterThan(0);
  });

  it("persists migration status to metadata", async () => {
    setLocalStorage({ [LEGACY_STORAGE_KEYS.progress]: LEGACY_PROGRESS_FIXTURE });
    await runLegacyMigration(db);
    const meta = await db.metadata.get(METADATA_ID);
    expect(meta?.migrationStatus).toBe("completed");
    expect(meta?.migratedAt).toBeDefined();
    expect(meta?.lastMigrationReport).toBeDefined();
  });
});
