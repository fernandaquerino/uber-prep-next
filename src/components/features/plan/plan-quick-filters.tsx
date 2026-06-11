"use client";

import { cn } from "@/lib/utils";
import { type QuickFilter, QUICK_FILTER_LABELS } from "@/lib/presentation/plan-view-models";

type QuickFilterCounts = Partial<Record<QuickFilter, number>>;

type PlanQuickFiltersProps = {
  active: QuickFilter;
  counts?: QuickFilterCounts;
  onChange: (filter: QuickFilter) => void;
};

const FILTER_ORDER: QuickFilter[] = ["all", "today", "overdue", "in_progress", "stuck"];

export function PlanQuickFilters({ active, counts, onChange }: PlanQuickFiltersProps) {
  return (
    <div
      className="flex gap-1 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Filtros rápidos da agenda"
    >
      {FILTER_ORDER.map((filter) => {
        const count = counts?.[filter];
        const isActive = active === filter;
        return (
          <button
            key={filter}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {QUICK_FILTER_LABELS[filter]}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-medium",
                  isActive ? "bg-white/90" : "bg-muted text-muted-foreground",
                )}
                aria-label={`(${count})`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
