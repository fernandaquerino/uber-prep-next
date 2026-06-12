import { describe, expect, it } from "vitest";
import type { TechnicalEnglishRecord } from "@/types/database";
import {
  filterTechnicalEnglish,
  computeTechnicalEnglishStats,
  collectTechnicalEnglishMeta,
} from "../technical-english-filters";

function makeItem(
  id: string,
  overrides: Partial<TechnicalEnglishRecord> = {},
): TechnicalEnglishRecord {
  return {
    id,
    type: "phrase",
    scenario: "coding",
    title: `Item ${id}`,
    content: `Content ${id}`,
    topicIds: [],
    tags: [],
    isFavorite: false,
    sourceType: "seed",
    lifecycleStatus: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterTechnicalEnglish", () => {
  const items = [
    makeItem("1", { scenario: "coding", type: "phrase" }),
    makeItem("2", { scenario: "behavioral", type: "template", isFavorite: true }),
    makeItem("3", { scenario: "system_design", tags: ["scale"] }),
    makeItem("4", { lifecycleStatus: "archived" }),
  ];

  it("excludes archived items by default", () => {
    const result = filterTechnicalEnglish(items, {});
    expect(result.map((i) => i.id)).not.toContain("4");
  });

  it("filters by scenario", () => {
    const result = filterTechnicalEnglish(items, { scenario: "behavioral" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by type", () => {
    const result = filterTechnicalEnglish(items, { type: "template" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters favorites", () => {
    const result = filterTechnicalEnglish(items, { isFavorite: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by tag", () => {
    const result = filterTechnicalEnglish(items, { tag: "scale" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by text query", () => {
    const result = filterTechnicalEnglish(items, { query: "content 1" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

describe("computeTechnicalEnglishStats", () => {
  it("counts correctly", () => {
    const items = [
      makeItem("1"),
      makeItem("2", { isFavorite: true }),
      makeItem("3", { lifecycleStatus: "archived" }),
    ];
    const practicedIds = new Set(["1"]);
    const stats = computeTechnicalEnglishStats(items, practicedIds);
    expect(stats.total).toBe(2);
    expect(stats.practiced).toBe(1);
    expect(stats.favorites).toBe(1);
  });
});

describe("collectTechnicalEnglishMeta", () => {
  it("collects unique tags and scenarios", () => {
    const items = [
      makeItem("1", { scenario: "coding", tags: ["a", "b"] }),
      makeItem("2", { scenario: "behavioral", tags: ["b", "c"] }),
    ];
    const { allTags, allScenarios } = collectTechnicalEnglishMeta(items);
    expect(allTags).toEqual(["a", "b", "c"]);
    expect(allScenarios).toContain("coding");
    expect(allScenarios).toContain("behavioral");
  });
});
