import { describe, expect, it } from "vitest";
import type { ResourceRecord, ResourceProgressRecord } from "@/types/database";
import {
  filterResources,
  sortResources,
  computeResourceStats,
  mergeResourceProgress,
  collectResourceMeta,
} from "../resource-filters";

function makeResource(id: string, overrides: Partial<ResourceRecord> = {}): ResourceRecord {
  return {
    id,
    title: `Resource ${id}`,
    type: "article",
    category: "algo",
    topicIds: [],
    tags: [],
    isFavorite: false,
    sourceType: "seed",
    lifecycleStatus: "active",
    linkedPlanBlockIds: [],
    linkedNoteIds: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeProgress(
  id: string,
  resourceId: string,
  status: ResourceProgressRecord["status"] = "in_progress",
): ResourceProgressRecord {
  return {
    id,
    resourceId,
    status,
    progressPercent: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("filterResources", () => {
  const items = [
    { resource: makeResource("1", { category: "algo", tags: ["patterns"] }), progress: undefined },
    {
      resource: makeResource("2", { category: "js", type: "video" }),
      progress: makeProgress("p2", "2", "completed"),
    },
    {
      resource: makeResource("3", { category: "algo", isFavorite: true }),
      progress: makeProgress("p3", "3", "in_progress"),
    },
    {
      resource: makeResource("4", { lifecycleStatus: "archived" }),
      progress: undefined,
    },
  ];

  it("filters by lifecycleStatus active by default", () => {
    const result = filterResources(items, { lifecycleStatus: "active" });
    expect(result.map((i) => i.resource.id)).not.toContain("4");
  });

  it("filters by category", () => {
    const result = filterResources(items, { lifecycleStatus: "active", category: "js" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("2");
  });

  it("filters by type", () => {
    const result = filterResources(items, { lifecycleStatus: "active", type: "video" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("2");
  });

  it("filters by tag", () => {
    const result = filterResources(items, { lifecycleStatus: "active", tag: "patterns" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("1");
  });

  it("filters favorites", () => {
    const result = filterResources(items, { lifecycleStatus: "active", isFavorite: true });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("3");
  });

  it("filters by status using progress", () => {
    const result = filterResources(items, { lifecycleStatus: "active", status: "completed" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("2");
  });

  it("filters by query text in title", () => {
    const result = filterResources(items, { lifecycleStatus: "active", query: "resource 2" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("2");
  });
});

describe("sortResources", () => {
  const items = [
    {
      resource: makeResource("a", { title: "Zebra", updatedAt: "2024-01-01T00:00:00.000Z" }),
      progress: undefined,
    },
    {
      resource: makeResource("b", { title: "Apple", updatedAt: "2024-03-01T00:00:00.000Z" }),
      progress: makeProgress("pb", "b", "completed"),
    },
  ];

  it("sorts by title A-Z", () => {
    const result = sortResources(items, "title");
    expect(result[0].resource.id).toBe("b");
    expect(result[1].resource.id).toBe("a");
  });

  it("sorts by recent (updatedAt desc)", () => {
    const result = sortResources(items, "recent");
    expect(result[0].resource.id).toBe("b");
  });
});

describe("computeResourceStats", () => {
  it("counts correctly", () => {
    const items = [
      {
        resource: makeResource("1"),
        progress: makeProgress("p1", "1", "completed"),
      },
      {
        resource: makeResource("2"),
        progress: makeProgress("p2", "2", "in_progress"),
      },
      { resource: makeResource("3"), progress: undefined },
      {
        resource: makeResource("4", { isFavorite: true }),
        progress: undefined,
      },
      {
        resource: makeResource("5", { lifecycleStatus: "archived" }),
        progress: undefined,
      },
    ];
    const stats = computeResourceStats(items);
    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.notStarted).toBe(2);
    expect(stats.favorites).toBe(1);
  });
});

describe("mergeResourceProgress", () => {
  it("merges progress to matching resource", () => {
    const resources = [makeResource("r1"), makeResource("r2")];
    const progressList = [makeProgress("p1", "r1", "completed")];
    const result = mergeResourceProgress(resources, progressList);
    const r1 = result.find((i) => i.resource.id === "r1");
    const r2 = result.find((i) => i.resource.id === "r2");
    expect(r1?.progress?.status).toBe("completed");
    expect(r2?.progress).toBeUndefined();
  });
});

describe("collectResourceMeta", () => {
  it("collects all categories and tags", () => {
    const resources = [
      makeResource("1", { category: "algo", tags: ["free", "video"] }),
      makeResource("2", { category: "js", tags: ["video"] }),
    ];
    const { allCategories, allTags } = collectResourceMeta(resources);
    expect(allCategories).toContain("algo");
    expect(allCategories).toContain("js");
    expect(allTags).toContain("free");
    expect(allTags).toContain("video");
    expect(allTags).toHaveLength(2);
  });
});
