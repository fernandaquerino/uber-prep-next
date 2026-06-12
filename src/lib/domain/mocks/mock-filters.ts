import type { MockRecord, MockStatus, MockType } from "@/types/database";

export type MockSortField = "date" | "createdAt" | "updatedAt" | "score" | "type";
export type MockSortDirection = "asc" | "desc";

export type MockFilters = {
  query?: string;
  type?: MockType | "all";
  status?: MockStatus | "all";
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
  sortField?: MockSortField;
  sortDirection?: MockSortDirection;
  hasDraft?: boolean;
};

export function applyMockFilters(mocks: MockRecord[], filters: MockFilters): MockRecord[] {
  let result = [...mocks];

  if (filters.status && filters.status !== "all") {
    result = result.filter((m) => m.status === filters.status);
  }

  if (filters.type && filters.type !== "all") {
    // Normalize comparison (legacy vs new types)
    const normalizeType = (t: string): string =>
      t.toLowerCase().replace(/\s+/g, "_").replace("full_loop", "full_loop");
    const targetNorm = normalizeType(filters.type);
    result = result.filter((m) => normalizeType(m.type) === targetNorm);
  }

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.prompt ?? m.question ?? "").toLowerCase().includes(q) ||
        (m.feedback ?? "").toLowerCase().includes(q),
    );
  }

  if (filters.dateFrom) {
    result = result.filter((m) => m.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    result = result.filter((m) => m.date <= filters.dateTo!);
  }

  if (filters.minScore !== undefined) {
    result = result.filter((m) => {
      const s = m.score ?? m.legacyScore ?? m.readinessScore ?? null;
      return s !== null && s >= filters.minScore!;
    });
  }
  if (filters.maxScore !== undefined) {
    result = result.filter((m) => {
      const s = m.score ?? m.legacyScore ?? m.readinessScore ?? null;
      return s !== null && s <= filters.maxScore!;
    });
  }

  const field = filters.sortField ?? "date";
  const dir = filters.sortDirection ?? "desc";

  result.sort((a, b) => {
    let cmp = 0;
    if (field === "score") {
      const aScore = a.score ?? a.legacyScore ?? a.readinessScore ?? -1;
      const bScore = b.score ?? b.legacyScore ?? b.readinessScore ?? -1;
      cmp = aScore - bScore;
    } else if (field === "type") {
      cmp = a.type.localeCompare(b.type);
    } else {
      const aVal = a[field] ?? "";
      const bVal = b[field] ?? "";
      cmp = aVal.localeCompare(bVal);
    }
    return dir === "asc" ? cmp : -cmp;
  });

  return result;
}
