"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { useTechnicalEnglish } from "@/hooks/use-technical-english";
import { useTechnicalEnglishActions } from "@/hooks/use-technical-english-actions";
import { filterTechnicalEnglish, TECH_ENGLISH_SCENARIO_LABELS } from "@/lib/domain/technical-english";
import type { TechnicalEnglishFilters } from "@/lib/domain/technical-english";
import type { TechnicalEnglishRecord } from "@/types/database";
import { TechnicalEnglishCard } from "./technical-english-card";
import { PracticeDialog } from "./practice-dialog";

const SCENARIOS = [
  "intro",
  "coding",
  "system_design",
  "behavioral",
  "pair_programming",
  "clarifying",
  "tradeoffs",
  "feedback",
  "general",
] as const;

export function TechnicalEnglishTab() {
  const { data, isLoading, error, refresh } = useTechnicalEnglish();
  const actions = useTechnicalEnglishActions(refresh);

  const [filters, setFilters] = useState<TechnicalEnglishFilters>({ lifecycleStatus: "active" });
  const [practiceItem, setPracticeItem] = useState<TechnicalEnglishRecord | null>(null);

  const practicedIds = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.practices.map((p) => p.itemId));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterTechnicalEnglish(data.items, filters);
  }, [data, filters]);

  if (isLoading) return <LoadingState label="Carregando inglês técnico..." />;
  if (error) return <ErrorState description={error} onRetry={refresh} />;
  if (!data) return null;

  const stats = data.stats;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stats.total} itens · {stats.practiced} praticados · {stats.favorites} favoritos
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar frase, template..."
            value={filters.query ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value || undefined }))}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select
          value={filters.scenario ?? "_all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, scenario: v === "_all" ? undefined : (v as never) }))
          }
        >
          <SelectTrigger className="h-9 text-sm w-44">
            <SelectValue>
              {(v) => (!v || v === "_all" ? "Cenário" : (TECH_ENGLISH_SCENARIO_LABELS[v as keyof typeof TECH_ENGLISH_SCENARIO_LABELS] ?? String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos cenários</SelectItem>
            {SCENARIOS.map((s) => (
              <SelectItem key={s} value={s}>
                {TECH_ENGLISH_SCENARIO_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() =>
            setFilters((f) => ({ ...f, isFavorite: f.isFavorite ? undefined : true }))
          }
          className={`text-xs px-2 py-1.5 rounded border transition-colors ${
            filters.isFavorite
              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
        >
          ⭐ Favoritos
        </button>
      </div>

      {/* Scenario chips */}
      <div className="flex gap-1.5 flex-wrap">
        {SCENARIOS.map((s) => (
          <button
            key={s}
            onClick={() =>
              setFilters((f) => ({ ...f, scenario: f.scenario === s ? undefined : s }))
            }
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filters.scenario === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            {TECH_ENGLISH_SCENARIO_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum item encontrado"
          description="Tente ajustar os filtros ou adicione uma nova frase."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <TechnicalEnglishCard
              key={item.id}
              item={item}
              isPracticed={practicedIds.has(item.id)}
              onToggleFavorite={actions.toggleFavorite}
              onPractice={(id) => {
                const found = data.items.find((i) => i.id === id);
                if (found) setPracticeItem(found);
              }}
              onMarkForReview={async (id) => {
                await actions.markForReview(id);
                toast.success("Adicionado à fila de revisão.");
              }}
            />
          ))}
        </div>
      )}

      <PracticeDialog
        item={practiceItem}
        open={!!practiceItem}
        onClose={() => setPracticeItem(null)}
        onSave={async (itemId, response) => {
          await actions.savePractice(itemId, response);
          toast.success("Prática salva!");
        }}
      />
    </div>
  );
}
