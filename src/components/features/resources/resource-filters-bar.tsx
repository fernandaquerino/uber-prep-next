"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResourceFilters, ResourceSortKey } from "@/lib/domain/resources";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_STATUS_LABELS,
  RESOURCE_DIFFICULTY_LABELS,
} from "@/lib/domain/resources";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";

interface ResourceFiltersBarProps {
  filters: ResourceFilters;
  sortKey: ResourceSortKey;
  allCategories: string[];
  allTags: string[];
  onFiltersChange: (filters: ResourceFilters) => void;
  onSortChange: (key: ResourceSortKey) => void;
}

const RESOURCE_TYPES = [
  "article",
  "video",
  "course",
  "documentation",
  "book",
  "exercise",
  "repo",
  "cheatsheet",
  "other",
] as const;

const RESOURCE_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const RESOURCE_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "saved_for_later",
] as const;

const SORT_OPTIONS: Record<ResourceSortKey, string> = {
  recent: "Mais recentes",
  title: "Título A-Z",
  difficulty: "Dificuldade",
  status: "Status",
  estimated: "Duração",
  last_opened: "Última abertura",
};

export function ResourceFiltersBar({
  filters,
  sortKey,
  allCategories,
  allTags,
  onFiltersChange,
  onSortChange,
}: ResourceFiltersBarProps) {
  const hasActiveFilters =
    !!filters.query ||
    !!filters.category ||
    !!filters.type ||
    !!filters.difficulty ||
    !!filters.status ||
    !!filters.tag ||
    filters.isFavorite;

  function clearFilters() {
    onFiltersChange({ lifecycleStatus: filters.lifecycleStatus });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recurso..."
            value={filters.query ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value || undefined })}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select
          value={filters.category ?? "_all"}
          onValueChange={(v) => {
            if (!v) return;
            onFiltersChange({ ...filters, category: v === "_all" ? undefined : v });
          }}
        >
          <SelectTrigger className="h-9 text-sm w-36">
            <SelectValue>
              {(v) => (!v || v === "_all" ? "Categoria" : getCategoryLabel(String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {getCategoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type ?? "_all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, type: v === "_all" ? undefined : (v as never) })
          }
        >
          <SelectTrigger className="h-9 text-sm w-36">
            <SelectValue>
              {(v) => (!v || v === "_all" ? "Tipo" : (RESOURCE_TYPE_LABELS[v as keyof typeof RESOURCE_TYPE_LABELS] ?? String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos tipos</SelectItem>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {RESOURCE_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty ?? "_all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, difficulty: v === "_all" ? undefined : (v as never) })
          }
        >
          <SelectTrigger className="h-9 text-sm w-36">
            <SelectValue>
              {(v) => (!v || v === "_all" ? "Dificuldade" : (RESOURCE_DIFFICULTY_LABELS[v as keyof typeof RESOURCE_DIFFICULTY_LABELS] ?? String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {RESOURCE_DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {RESOURCE_DIFFICULTY_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status ?? "_all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, status: v === "_all" ? undefined : (v as never) })
          }
        >
          <SelectTrigger className="h-9 text-sm w-36">
            <SelectValue>
              {(v) => (!v || v === "_all" ? "Status" : (RESOURCE_STATUS_LABELS[v as keyof typeof RESOURCE_STATUS_LABELS] ?? String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos status</SelectItem>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {RESOURCE_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => onSortChange(v as ResourceSortKey)}>
          <SelectTrigger className="h-9 text-sm w-44">
            <SelectValue>
              {(v) => (!v ? "Ordenar" : (SORT_OPTIONS[v as ResourceSortKey] ?? String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_OPTIONS) as ResourceSortKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORT_OPTIONS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-sm">
            <X className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() =>
            onFiltersChange({
              ...filters,
              isFavorite: filters.isFavorite ? undefined : true,
            })
          }
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            filters.isFavorite
              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
        >
          ⭐ Favoritos
        </button>
        {allTags.slice(0, 8).map((tag) => (
          <button
            key={tag}
            onClick={() =>
              onFiltersChange({ ...filters, tag: filters.tag === tag ? undefined : tag })
            }
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              filters.tag === tag
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
