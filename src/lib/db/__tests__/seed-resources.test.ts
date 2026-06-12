import { describe, expect, it, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import type { UberPrepDatabase } from "@/lib/db/db";
import { runSeeds } from "../seed";

describe("resource and technical english seeds", () => {
  let db: UberPrepDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it("seeds resources and is idempotent", async () => {
    await runSeeds(db);
    const count1 = await db.resources.count();
    expect(count1).toBeGreaterThan(0);

    await runSeeds(db);
    const count2 = await db.resources.count();
    expect(count2).toBe(count1);
  });

  it("seeds technical english items and is idempotent", async () => {
    await runSeeds(db);
    const count1 = await db.technicalEnglishItems.count();
    expect(count1).toBeGreaterThan(0);

    await runSeeds(db);
    const count2 = await db.technicalEnglishItems.count();
    expect(count2).toBe(count1);
  });

  it("does not overwrite manually edited seed items", async () => {
    await runSeeds(db);

    const item = await db.technicalEnglishItems.toCollection().first();
    if (!item) return;

    await db.technicalEnglishItems.put({ ...item, title: "Custom title" });
    await runSeeds(db);

    const updated = await db.technicalEnglishItems.get(item.id);
    expect(updated?.title).toBe("Custom title");
  });
});
