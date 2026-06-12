import { describe, expect, it } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { createBackupRepository } from "../backup.repository";
import { MINIMAL_BACKUP } from "../../../../tests/fixtures/backup-fixtures";

describe("backup repository", () => {
  it("exports and restores structured quiz and note data", async () => {
    const source = createTestDatabase();
    const now = "2026-06-12T12:00:00.000Z";

    await source.quizSessions.put({
      id: "quiz-session-1",
      type: "daily",
      status: "completed",
      dailyDate: "2026-06-12",
      questionIds: ["question-1"],
      currentIndex: 1,
      config: { type: "daily", feedbackMode: "end_of_session" },
      startedAt: now,
      updatedAt: now,
      completedAt: now,
      elapsedSeconds: 120,
    });
    await source.noteVersions.put({
      id: "note-version-1",
      noteId: "note-1",
      title: "Snapshot",
      content: "Conteúdo preservado",
      reason: "manual",
      createdAt: now,
    });

    const backup = await createBackupRepository(source).export();
    expect(backup.data.quizSessions).toHaveLength(1);
    expect(backup.data.noteVersions).toHaveLength(1);

    const target = createTestDatabase();
    const result = await createBackupRepository(target).import(backup, "replace");

    expect(result.success).toBe(true);
    expect(await target.quizSessions.get("quiz-session-1")).toBeDefined();
    expect(await target.noteVersions.get("note-version-1")).toBeDefined();
  });

  it("accepts an older backup without the newer optional collections", async () => {
    const legacy = structuredClone(MINIMAL_BACKUP) as unknown as Record<string, unknown>;
    const data = legacy.data as Record<string, unknown>;
    delete data.quizSessions;
    delete data.noteVersions;
    delete data.weeklyReportSnapshots;

    const db = createTestDatabase();
    const result = await createBackupRepository(db).import(
      legacy as Parameters<ReturnType<typeof createBackupRepository>["import"]>[0],
      "replace",
    );

    expect(result.success).toBe(true);
    expect(result.counts.quizSessions).toBe(0);
    expect(result.counts.noteVersions).toBe(0);
    expect(await db.settings.count()).toBe(1);
  });

  it("rejects an invalid file before changing existing data", async () => {
    const db = createTestDatabase();
    await db.noteVersions.put({
      id: "kept",
      noteId: "note-1",
      title: "Keep",
      content: "Existing data",
      reason: "manual",
      createdAt: "2026-06-12T12:00:00.000Z",
    });

    await expect(
      createBackupRepository(db).import(
        { ...MINIMAL_BACKUP, app: "invalid" as typeof MINIMAL_BACKUP.app },
        "replace",
      ),
    ).rejects.toThrow("Backup inválido");
    expect(await db.noteVersions.get("kept")).toBeDefined();
  });
});
