import { describe, expect, it, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import type { UberPrepDatabase } from "@/lib/db/db";
import {
  createResourcesRepository,
  createResourceProgressRepository,
} from "../resources.repository";
import type { ResourceRecord } from "@/types/database";

function makeResource(id: string): ResourceRecord {
  const now = new Date().toISOString();
  return {
    id,
    title: `Resource ${id}`,
    type: "article",
    category: "algo",
    topicIds: [],
    tags: ["free"],
    isFavorite: false,
    sourceType: "manual",
    lifecycleStatus: "active",
    linkedPlanBlockIds: [],
    linkedNoteIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

describe("createResourcesRepository", () => {
  let db: UberPrepDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it("upserts and retrieves a resource", async () => {
    const repo = createResourcesRepository(db);
    const r = makeResource("r1");
    await repo.upsert(r);
    const found = await repo.findById("r1");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Resource r1");
  });

  it("lists resources ordered by updatedAt desc", async () => {
    const repo = createResourcesRepository(db);
    const r1 = { ...makeResource("r1"), updatedAt: "2024-01-01T00:00:00.000Z" };
    const r2 = { ...makeResource("r2"), updatedAt: "2024-06-01T00:00:00.000Z" };
    await repo.upsert(r1);
    await repo.upsert(r2);
    const list = await repo.list();
    expect(list[0].id).toBe("r2");
  });

  it("bulk upserts without duplicating", async () => {
    const repo = createResourcesRepository(db);
    const resources = [makeResource("a"), makeResource("b"), makeResource("c")];
    await repo.bulkUpsert(resources);
    expect(await repo.count()).toBe(3);
    await repo.bulkUpsert(resources);
    expect(await repo.count()).toBe(3);
  });

  it("deletes a resource", async () => {
    const repo = createResourcesRepository(db);
    await repo.upsert(makeResource("del1"));
    await repo.delete("del1");
    expect(await repo.findById("del1")).toBeUndefined();
  });

  it("clears all resources", async () => {
    const repo = createResourcesRepository(db);
    await repo.bulkUpsert([makeResource("1"), makeResource("2")]);
    await repo.clear();
    expect(await repo.count()).toBe(0);
  });
});

describe("createResourceProgressRepository", () => {
  let db: UberPrepDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it("upserts and finds by resourceId", async () => {
    const progressRepo = createResourceProgressRepository(db);
    const now = new Date().toISOString();
    await progressRepo.upsert({
      id: "pr1",
      resourceId: "r1",
      status: "in_progress",
      progressPercent: 30,
      createdAt: now,
      updatedAt: now,
    });
    const found = await progressRepo.findByResourceId("r1");
    expect(found).toBeDefined();
    expect(found?.status).toBe("in_progress");
  });

  it("returns undefined for missing resourceId", async () => {
    const progressRepo = createResourceProgressRepository(db);
    const found = await progressRepo.findByResourceId("nonexistent");
    expect(found).toBeUndefined();
  });
});
