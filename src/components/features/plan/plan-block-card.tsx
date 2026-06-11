"use client";

import type { EffectiveScheduledBlock, PlanBlockExecutionStatus } from "@/lib/domain/progress";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { formatMinutes, formatCalendarDate } from "./plan-utils";
import { getBlockTypeLabel, getCategoryVisual } from "@/lib/presentation/category-visuals";
import { getBlockActions } from "@/lib/presentation/plan-view-models";
import { CategoryBadge } from "./category-badge";
import { StatusBadge, OverdueBadge } from "./status-badge";
import { BlockActionsMenu } from "./block-actions-menu";
import { cn } from "@/lib/utils";

type PlanBlockCardProps = {
  block: EffectiveScheduledBlock;
  onStart: () => void;
  onComplete: () => void;
  onStuck: () => void;
  onReturnToPending: () => void;
  onSkip: () => void;
  onRestore: () => void;
  onReschedule: () => void;
  onOpen: () => void;
};

const STATUS_BORDER: Record<PlanBlockExecutionStatus, string> = {
  pending: "border-l-border",
  in_progress: "border-l-blue-500",
  completed: "border-l-green-500",
  stuck: "border-l-amber-500",
  skipped: "border-l-muted-foreground/30",
};

export function PlanBlockCard({
  block,
  onStart,
  onComplete,
  onStuck,
  onReturnToPending,
  onSkip,
  onRestore,
  onReschedule,
  onOpen,
}: PlanBlockCardProps) {
  const { executionStatus, isOverdue, isRescheduled } = block;
  const isCompleted = executionStatus === "completed";
  const isSkipped = executionStatus === "skipped";
  const visual = getCategoryVisual(block.category);
  const actions = getBlockActions(executionStatus);

  function handleAction(id: string) {
    switch (id) {
      case "start":
        onStart();
        break;
      case "complete":
        onComplete();
        break;
      case "stuck":
        onStuck();
        break;
      case "resume":
      case "return_to_pending":
      case "pause":
        onReturnToPending();
        break;
      case "restore":
        onRestore();
        break;
      case "reschedule":
        onReschedule();
        break;
      case "skip":
        onSkip();
        break;
      case "undo_complete":
        onReturnToPending();
        break;
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-l-4 transition-colors",
        `border-l-${visual.dot.replace("bg-", "")}`,
        STATUS_BORDER[executionStatus],
        isCompleted && "opacity-75",
        isSkipped && "opacity-50",
      )}
      aria-label={`${block.title}`}
    >
      {/* Clickable main area — opens details */}
      <button
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="w-full cursor-pointer p-3 pb-2 text-left focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-inset"
        aria-label={`Abrir detalhes: ${block.title}`}
      >
        {block.startTime && (
          <p className="text-muted-foreground mb-1 text-[11px] tabular-nums">{block.startTime}</p>
        )}

        <p className="text-sm leading-snug font-medium">{block.title}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={block.category} />
          <span className="text-muted-foreground text-[11px]">{getBlockTypeLabel(block.type)}</span>
          <span className="text-muted-foreground text-[11px]">·</span>
          <span className="text-muted-foreground text-[11px]">
            {formatMinutes(block.estimatedMinutes)}
          </span>
        </div>

        {/* Status and annotations row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={executionStatus} />
          {isOverdue && <OverdueBadge />}
          {isRescheduled && (
            <span className="text-muted-foreground text-[10px]">
              Reagendado · {formatCalendarDate(block.originalScheduledDate, "short")} →{" "}
              {formatCalendarDate(block.scheduledDate, "short")}
            </span>
          )}
        </div>

        {/* Real time info when completed */}
        {isCompleted && block.actualMinutes !== undefined && (
          <p className="text-muted-foreground mt-1 text-[11px]">
            {formatMinutes(block.actualMinutes)} reais
            {block.difficulty !== undefined && ` · D ${block.difficulty}/5`}
            {block.confidence !== undefined && ` · C ${block.confidence}/5`}
          </p>
        )}
      </button>

      {/* Action row — separate from clickable area */}
      <div className="flex items-center gap-1.5 px-3 pb-3">
        {actions.primary && (
          <Button
            size="sm"
            variant={actions.primary.kind === "primary" ? "default" : "outline"}
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(actions.primary!.id);
            }}
          >
            {actions.primary.id === "complete" && (
              <CheckIcon className="mr-1 h-3 w-3" aria-hidden />
            )}
            {actions.primary.label}
          </Button>
        )}

        {actions.secondary && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(actions.secondary!.id);
            }}
          >
            {actions.secondary.label}
          </Button>
        )}

        {isCompleted && !actions.primary && actions.menu.length > 0 && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
            <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" aria-hidden />
            Concluído
          </span>
        )}

        <span className="flex-1" />

        {actions.menu.length > 0 && (
          <BlockActionsMenu
            actions={actions.menu}
            onAction={(id) => handleAction(id)}
            label="Mais ações para este bloco"
          />
        )}
      </div>
    </article>
  );
}
