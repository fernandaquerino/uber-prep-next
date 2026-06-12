import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { createFlashcardsRepository } from "@/lib/repositories/flashcards.repository";
import type { FlashcardRecord } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/db";

let db: UberPrepDatabase;
let repo: ReturnType<typeof createFlashcardsRepository>;

const now = new Date().toISOString();
const today = now.slice(0, 10);

function makeCard(overrides: Partial<FlashcardRecord> = {}): FlashcardRecord {
  return {
    id: "fc-test-1",
    front: "Front",
    back: "Back",
    category: "algo",
    tags: ["big-o"],
    status: "pending",
    lifecycleStatus: "active",
    source: "initial",
    nextReview: null,
    knownAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    reviews: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  db = createTestDatabase();
  repo = createFlashcardsRepository(db);
});

describe("flashcards repository", () => {
  it("upsert and findById", async () => {
    const card = makeCard();
    await repo.upsert(card);
    const found = await repo.findById("fc-test-1");
    expect(found).toEqual(card);
  });

  it("list returns all cards", async () => {
    await repo.bulkAdd([makeCard({ id: "fc-1" }), makeCard({ id: "fc-2" })]);
    const all = await repo.list();
    expect(all).toHaveLength(2);
  });

  it("listByStatus filters correctly", async () => {
    await repo.bulkAdd([
      makeCard({ id: "fc-1", status: "pending" }),
      makeCard({ id: "fc-2", status: "known" }),
      makeCard({ id: "fc-3", status: "review" }),
    ]);
    const pending = await repo.listByStatus("pending");
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("fc-1");
  });

  it("listDue returns cards due today or earlier", async () => {
    await repo.bulkAdd([
      makeCard({ id: "fc-due", status: "review", nextReview: today }),
      makeCard({ id: "fc-future", status: "review", nextReview: "2099-01-01" }),
      makeCard({ id: "fc-known", status: "known", nextReview: today }),
    ]);
    const due = await repo.listDue(today);
    expect(due.map((c) => c.id)).toContain("fc-due");
    expect(due.map((c) => c.id)).not.toContain("fc-future");
    expect(due.map((c) => c.id)).not.toContain("fc-known");
  });

  it("existsById returns true/false", async () => {
    await repo.upsert(makeCard());
    expect(await repo.existsById("fc-test-1")).toBe(true);
    expect(await repo.existsById("fc-nonexistent")).toBe(false);
  });

  it("delete removes the card", async () => {
    await repo.upsert(makeCard());
    await repo.delete("fc-test-1");
    expect(await repo.findById("fc-test-1")).toBeUndefined();
  });

  it("count returns correct number", async () => {
    await repo.bulkAdd([makeCard({ id: "fc-1" }), makeCard({ id: "fc-2" })]);
    expect(await repo.count()).toBe(2);
  });

  it("clear empties the table", async () => {
    await repo.bulkAdd([makeCard({ id: "fc-1" }), makeCard({ id: "fc-2" })]);
    await repo.clear();
    expect(await repo.count()).toBe(0);
  });
});
