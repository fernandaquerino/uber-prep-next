"use client";

import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { getGridStatusVisual } from "@/lib/presentation/plan-view-models";
import { cn } from "@/lib/utils";

type PlanGridBlockCardProps = {
  block: EffectiveScheduledBlock;
  onOpen: () => void;
};

export function PlanGridBlockCard({ block, onOpen }: PlanGridBlockCardProps) {
  const { executionStatus, isOverdue } = block;
  const isCompleted = executionStatus === "completed";
  const isSkipped = executionStatus === "skipped";
  const visual = getCategoryVisual(block.category);
  const status = getGridStatusVisual(executionStatus, isOverdue);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir detalhes: ${block.title} (${status.label})`}
      className={cn(
        "border-border bg-surface hover:bg-surface-muted hover:border-text-muted w-full rounded-md border border-l-2 px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        visual.border,
      )}
    >
      <p
        className={cn(
          "text-text-primary text-[11px] leading-snug font-semibold",
          (isCompleted || isSkipped) && "text-text-secondary line-through opacity-60",
        )}
      >
        {block.title}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <span className={cn("truncate text-[10px] font-medium", visual.text)}>{visual.label}</span>
        <span className="text-muted shrink-0 font-mono text-[10px]">{block.estimatedMinutes}min</span>
      </div>

      <div className="mt-1.5 flex items-center gap-1">
        <span className={cn("h-[5px] w-[5px] shrink-0 rounded-full", status.dot)} aria-hidden />
        <span className={cn("text-[9px] font-semibold", status.text)}>{status.label}</span>
      </div>
    </button>
  );
}
