import { describe, expect, it, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import type { UberPrepDatabase } from "@/lib/db/db";
import { runSeeds } from "../seed";
import { RESOURCES, WEEKS } from "@/lib/data/plan";
import { TECH_ENGLISH_PHRASES } from "@/lib/data/technical-english";

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

  it("seeds the catalog and linked resources from plan.ts", async () => {
    await runSeeds(db);
    const resources = await db.resources.toArray();

    for (const entries of Object.values(RESOURCES)) {
      for (const entry of entries) {
        expect(resources.some((resource) => resource.title === entry.title)).toBe(true);
      }
    }

    const planUrls = WEEKS.flatMap((week) =>
      week.days.flatMap((day) =>
        (
          day.blocks as Array<{
            resource?: string;
            leetcode?: string;
          }>
        )
          .map((block) => block.leetcode ?? block.resource)
          .filter((url): url is string => Boolean(url)),
      ),
    );
    for (const url of new Set(planUrls)) {
      expect(resources.some((resource) => resource.url === url)).toBe(true);
    }
  });

  it("seeds technical english items and is idempotent", async () => {
    await runSeeds(db);
    const count1 = await db.technicalEnglishItems.count();
    expect(count1).toBeGreaterThan(0);

    await runSeeds(db);
    const count2 = await db.technicalEnglishItems.count();
    expect(count2).toBe(count1);
  });

  it("seeds every phrase from technical-english.ts", async () => {
    await runSeeds(db);
    const items = await db.technicalEnglishItems.toArray();

    for (const group of TECH_ENGLISH_PHRASES) {
      for (const phrase of group.phrases) {
        expect(items.some((item) => item.content === phrase.en)).toBe(true);
      }
    }
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
