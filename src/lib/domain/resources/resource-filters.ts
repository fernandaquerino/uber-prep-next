import type { ResourceRecord, ResourceProgressRecord } from "@/types/database";
import type { ResourceFilters, ResourceSortKey, ResourceWithProgress } from "./resource.types";

export function filterResources(
  items: ResourceWithProgress[],
  filters: ResourceFilters,
): ResourceWithProgress[] {
  return items.filter(({ resource, progress }) => {
    const lc = filters.lifecycleStatus ?? "active";
    if (resource.lifecycleStatus !== lc) return false;

    if (filters.isFavorite !== undefined && resource.isFavorite !== filters.isFavorite)
      return false;

    if (filters.category && resource.category !== filters.category) return false;

    if (filters.type && resource.type !== filters.type) return false;

    if (filters.difficulty && resource.difficulty !== filters.difficulty) return false;

    if (filters.topicId && !resource.topicIds.includes(filters.topicId)) return false;

    if (filters.tag && !resource.tags.includes(filters.tag)) return false;

    if (filters.status) {
      const effectiveStatus = progress?.status ?? "not_started";
      if (effectiveStatus !== filters.status) return false;
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const inTitle = resource.title.toLowerCase().includes(q);
      const inDesc = resource.description?.toLowerCase().includes(q) ?? false;
      const inTags = resource.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }

    return true;
  });
}

export function sortResources(
  items: ResourceWithProgress[],
  sortKey: ResourceSortKey,
): ResourceWithProgress[] {
  const copy = [...items];
  switch (sortKey) {
    case "title":
      return copy.sort((a, b) => a.resource.title.localeCompare(b.resource.title));
    case "difficulty": {
      const order = { beginner: 0, intermediate: 1, advanced: 2, undefined: 3 };
      return copy.sort(
        (a, b) =>
          (order[a.resource.difficulty ?? "undefined"] ?? 3) -
          (order[b.resource.difficulty ?? "undefined"] ?? 3),
      );
    }
    case "status": {
      const order = {
        in_progress: 0,
        not_started: 1,
        saved_for_later: 2,
        completed: 3,
        archived: 4,
        undefined: 5,
      };
      return copy.sort(
        (a, b) =>
          (order[a.progress?.status ?? "undefined"] ?? 5) -
          (order[b.progress?.status ?? "undefined"] ?? 5),
      );
    }
    case "estimated":
      return copy.sort(
        (a, b) => (a.resource.estimatedMinutes ?? 0) - (b.resource.estimatedMinutes ?? 0),
      );
    case "last_opened":
      return copy.sort((a, b) => {
        const ta = a.progress?.lastOpenedAt ?? "";
        const tb = b.progress?.lastOpenedAt ?? "";
        return tb.localeCompare(ta);
      });
    case "recent":
    default:
      return copy.sort((a, b) => b.resource.updatedAt.localeCompare(a.resource.updatedAt));
  }
}

export function collectResourceMeta(resources: ResourceRecord[]): {
  allTags: string[];
  allCategories: string[];
  allTopicIds: string[];
} {
  const tags = new Set<string>();
  const categories = new Set<string>();
  const topicIds = new Set<string>();

  for (const r of resources) {
    r.tags.forEach((t) => tags.add(t));
    categories.add(r.category);
    r.topicIds.forEach((id) => topicIds.add(id));
  }

  return {
    allTags: Array.from(tags).sort(),
    allCategories: Array.from(categories).sort(),
    allTopicIds: Array.from(topicIds).sort(),
  };
}

export function computeResourceStats(
  items: ResourceWithProgress[],
): import("./resource.types").ResourceStats {
  const active = items.filter((i) => i.resource.lifecycleStatus === "active");
  return {
    total: active.length,
    completed: active.filter((i) => i.progress?.status === "completed").length,
    inProgress: active.filter((i) => i.progress?.status === "in_progress").length,
    notStarted: active.filter((i) => !i.progress || i.progress.status === "not_started").length,
    favorites: active.filter((i) => i.resource.isFavorite).length,
  };
}

export function mergeResourceProgress(
  resources: ResourceRecord[],
  progressList: ResourceProgressRecord[],
): ResourceWithProgress[] {
  const progressMap = new Map(progressList.map((p) => [p.resourceId, p]));
  return resources.map((resource) => ({
    resource,
    progress: progressMap.get(resource.id),
  }));
}
