"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlashcardFilters } from "@/lib/domain/flashcards/flashcard-filters";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "all", label: "Todas as categorias" },
  { value: "algo", label: "Algoritmos" },
  { value: "system", label: "System Design" },
  { value: "js", label: "JavaScript" },
  { value: "fe_coding", label: "Frontend Coding" },
  { value: "react", label: "React" },
  { value: "mock", label: "Mock" },
  { value: "behavioral", label: "Behavioral" },
  { value: "english", label: "Inglês" },
  { value: "general", label: "Geral" },
];

const LEARNING_STATES = [
  { value: "all", label: "Todos os estados" },
  { value: "new", label: "Novos" },
  { value: "learning", label: "Aprendendo" },
  { value: "reviewing", label: "Revisando" },
  { value: "mastered", label: "Dominados" },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mais recentes" },
  { value: "createdAt_asc", label: "Mais antigos" },
  { value: "nextReview_asc", label: "Próxima revisão" },
  { value: "front_asc", label: "Ordem alfabética" },
];

type Props = {
  filters: FlashcardFilters;
  onFiltersChange: (f: Partial<FlashcardFilters>) => void;
  onReset: () => void;
  allTags: string[];
};

export function FlashcardFiltersBar({ filters, onFiltersChange, onReset, allTags }: Props) {
  const sortValue = `${filters.sortField ?? "createdAt"}_${filters.sortDirection ?? "desc"}`;

  function handleSort(value: string | null) {
    if (!value) return;
    const [field, direction] = value.split("_") as [string, string];
    onFiltersChange({
      sortField: field as FlashcardFilters["sortField"],
      sortDirection: direction as FlashcardFilters["sortDirection"],
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" aria-hidden />
          <Input
            placeholder="Buscar flashcards…"
            value={filters.query ?? ""}
            onChange={(e) => onFiltersChange({ query: e.target.value })}
            className="pl-8"
            aria-label="Buscar flashcards"
          />
        </div>

        <Select
          value={filters.category ?? "all"}
          onValueChange={(v) => {
            if (!v) return;
            onFiltersChange({ category: v === "all" ? undefined : v });
          }}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filtrar por categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.learningState ?? "all"}
          onValueChange={(v) => {
            if (!v) return;
            onFiltersChange({
              learningState: v === "all" ? undefined : (v as FlashcardFilters["learningState"]),
            });
          }}
        >
          <SelectTrigger className="w-[170px]" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEARNING_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortValue} onValueChange={handleSort}>
          <SelectTrigger className="w-[170px]" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={filters.lifecycleStatus === "archived" ? "secondary" : "outline"}
          size="sm"
          onClick={() =>
            onFiltersChange({
              lifecycleStatus: filters.lifecycleStatus === "archived" ? undefined : "archived",
              includeArchived: filters.lifecycleStatus === "archived" ? undefined : true,
              learningState: undefined,
              isDue: undefined,
            })
          }
          aria-pressed={filters.lifecycleStatus === "archived"}
        >
          Arquivados
        </Button>

        {(filters.query ||
          filters.category ||
          filters.learningState ||
          filters.isDue ||
          filters.tag ||
          filters.lifecycleStatus) && (
          <Button variant="ghost" size="sm" onClick={onReset} aria-label="Limpar filtros">
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" aria-hidden />
            Limpar
          </Button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-muted-foreground self-center text-xs">Tags:</span>
          {allTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => onFiltersChange({ tag: filters.tag === tag ? undefined : tag })}
              className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                filters.tag === tag
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
              aria-pressed={filters.tag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
