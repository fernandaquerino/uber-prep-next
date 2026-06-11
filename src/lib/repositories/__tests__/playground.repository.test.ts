import { beforeEach, describe, expect, it } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { createPlaygroundRepository } from "@/lib/repositories/playground.repository";
import type { UberPrepDatabase } from "@/lib/db/db";
import type { PlaygroundSolutionRecord } from "@/types/database";

let db: UberPrepDatabase;
let repo: ReturnType<typeof createPlaygroundRepository>;

const now = "2026-06-11T10:00:00.000Z";

function makeSolution(overrides: Partial<PlaygroundSolutionRecord> = {}): PlaygroundSolutionRecord {
  return {
    id: "solution-1",
    title: "Two Sum",
    language: "javascript",
    code: "function twoSum() {}",
    output: "",
    notes: "{}",
    category: "hashmap",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  db = createTestDatabase();
  repo = createPlaygroundRepository(db);
});

describe("playground repository", () => {
  it("upserts and finds a saved solution", async () => {
    const solution = makeSolution();

    await repo.upsert(solution);

    expect(await repo.findById(solution.id)).toEqual(solution);
  });

  it("lists newest updated solution first", async () => {
    await repo.bulkUpsert([
      makeSolution({ id: "old", updatedAt: "2026-06-10T10:00:00.000Z" }),
      makeSolution({ id: "new", updatedAt: "2026-06-11T10:00:00.000Z" }),
    ]);

    expect((await repo.list()).map((solution) => solution.id)).toEqual(["new", "old"]);
  });

  it("filters by language and deletes records", async () => {
    await repo.bulkUpsert([
      makeSolution({ id: "js", language: "javascript" }),
      makeSolution({ id: "ts", language: "typescript" }),
    ]);

    expect((await repo.listByLanguage("javascript")).map((solution) => solution.id)).toEqual([
      "js",
    ]);

    await repo.delete("js");
    expect(await repo.findById("js")).toBeUndefined();
    expect(await repo.count()).toBe(1);
  });
});
