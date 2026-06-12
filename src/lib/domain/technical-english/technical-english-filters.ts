import type { TechnicalEnglishRecord } from "@/types/database";
import type { TechnicalEnglishFilters } from "./technical-english.types";

export function filterTechnicalEnglish(
  items: TechnicalEnglishRecord[],
  filters: TechnicalEnglishFilters,
): TechnicalEnglishRecord[] {
  return items.filter((item) => {
    const lc = filters.lifecycleStatus ?? "active";
    if (item.lifecycleStatus !== lc) return false;

    if (filters.isFavorite !== undefined && item.isFavorite !== filters.isFavorite) return false;

    if (filters.scenario && item.scenario !== filters.scenario) return false;

    if (filters.type && item.type !== filters.type) return false;

    if (filters.tag && !item.tags.includes(filters.tag)) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inContent = item.content.toLowerCase().includes(q);
      const inTranslation = item.translation?.toLowerCase().includes(q) ?? false;
      if (!inTitle && !inContent && !inTranslation) return false;
    }

    return true;
  });
}

export function collectTechnicalEnglishMeta(items: TechnicalEnglishRecord[]): {
  allTags: string[];
  allScenarios: import("./technical-english.types").TechnicalEnglishScenario[];
} {
  const tags = new Set<string>();
  const scenarios = new Set<import("./technical-english.types").TechnicalEnglishScenario>();

  for (const item of items) {
    item.tags.forEach((t) => tags.add(t));
    scenarios.add(item.scenario);
  }

  return {
    allTags: Array.from(tags).sort(),
    allScenarios: Array.from(scenarios),
  };
}

export function computeTechnicalEnglishStats(
  items: TechnicalEnglishRecord[],
  practicedIds: Set<string>,
): import("./technical-english.types").TechnicalEnglishStats {
  const active = items.filter((i) => i.lifecycleStatus === "active");
  return {
    total: active.length,
    practiced: active.filter((i) => practicedIds.has(i.id)).length,
    favorites: active.filter((i) => i.isFavorite).length,
  };
}
