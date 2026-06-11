import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { runSeeds } from "@/lib/db/seed";
import {
  SEED_ID_FLASHCARDS,
  SEED_ID_METADATA,
  SEED_ID_SETTINGS,
  METADATA_ID,
  SETTINGS_ID,
} from "@/lib/db/constants";
import { INITIAL_FLASHCARDS } from "@/lib/data/initial-flashcards";
import type { UberPrepDatabase } from "@/lib/db/db";

let db: UberPrepDatabase;

beforeEach(() => {
  db = createTestDatabase();
});

describe("runSeeds", () => {
  it("seeds metadata on first run", async () => {
    await runSeeds(db);
    const meta = await db.metadata.get(METADATA_ID);
    expect(meta).toBeDefined();
    expect(meta?.id).toBe(METADATA_ID);
    expect(meta?.migrationStatus).toBe("none");
    expect(meta?.seedsRun).toContain(SEED_ID_METADATA);
  });

  it("seeds default settings on first run", async () => {
    await runSeeds(db);
    const settings = await db.settings.get(SETTINGS_ID);
    expect(settings).toBeDefined();
    expect(settings?.theme).toBe("system");
    expect(settings?.startDate).toBeNull();
  });

  it("seeds all initial flashcards", async () => {
    await runSeeds(db);
    const count = await db.flashcards.count();
    expect(count).toBe(INITIAL_FLASHCARDS.length);
  });

  it("is idempotent — second runSeeds does not duplicate flashcards", async () => {
    await runSeeds(db);
    await runSeeds(db);
    const count = await db.flashcards.count();
    expect(count).toBe(INITIAL_FLASHCARDS.length);
  });

  it("marks seeds in seedsRun", async () => {
    await runSeeds(db);
    const meta = await db.metadata.get(METADATA_ID);
    expect(meta?.seedsRun).toContain(SEED_ID_FLASHCARDS);
    expect(meta?.seedsRun).toContain(SEED_ID_SETTINGS);
  });

  it("does not overwrite existing settings", async () => {
    const now = new Date().toISOString();
    await db.metadata.put({
      id: METADATA_ID,
      schemaVersion: 1,
      migrationStatus: "none",
      migratedAt: null,
      backupVersion: 1,
      seedsRun: [],
      createdAt: now,
      updatedAt: now,
    });
    await db.settings.put({
      id: SETTINGS_ID,
      startDate: "2025-01-01",
      timezone: "America/Sao_Paulo",
      theme: "dark",
      createdAt: now,
      updatedAt: now,
    });
    await runSeeds(db);
    const settings = await db.settings.get(SETTINGS_ID);
    expect(settings?.startDate).toBe("2025-01-01");
    expect(settings?.timezone).toBe("America/Sao_Paulo");
  });
});
