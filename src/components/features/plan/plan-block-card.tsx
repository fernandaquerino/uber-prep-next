"use client";

import type { EffectiveScheduledBlock, PlanBlockExecutionStatus } from "@/lib/domain/progress";
import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  CheckIcon,
  SkipForwardIcon,
  RotateCcwIcon,
  AlertTriangleIcon,
  CalendarIcon,
  InfoIcon,
} from "lucide-react";
import { formatMinutes, getStatusLabel, formatCalendarDate } from "./plan-utils";
import { getCategoryVisual, getBlockTypeLabel } from "@/lib/presentation/category-visuals";
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
  skipped: "border-l-muted-foreground/40",
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
  const { executionStatus, isOverdue, isRescheduled, timingStatus } = block;
  const isPast = timingStatus === "past";
  const isCompleted = executionStatus === "completed";
  const isSkipped = executionStatus === "skipped";
  const visual = getCategoryVisual(block.category);

  return (
    <article
      className={cn(
        "rounded-lg border border-l-4 p-3 transition-colors",
        STATUS_BORDER[executionStatus],
        isCompleted && "opacity-70",
        isSkipped && "opacity-50",
      )}
      aria-label={`${block.title} — ${getStatusLabel(executionStatus)}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {block.startTime && (
              <p className="text-muted-foreground mb-0.5 text-[11px] tabular-nums">
                {block.startTime}
              </p>
            )}
            <button
              onClick={onOpen}
              className="text-left text-sm leading-snug font-medium hover:underline"
              aria-label={`Abrir detalhes: ${block.title}`}
            >
              {block.title}
            </button>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  visual.badge,
                )}
              >
                {visual.label}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {getBlockTypeLabel(block.type)}
              </span>
              <span className="text-muted-foreground text-[11px]">·</span>
              <span className="text-muted-foreground text-[11px]">
                {formatMinutes(block.estimatedMinutes)}
              </span>

              {isOverdue && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  <AlertTriangleIcon className="h-2.5 w-2.5" aria-hidden />
                  Atrasado
                </span>
              )}
              {isRescheduled && (
                <span className="inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                  <CalendarIcon className="h-2.5 w-2.5" aria-hidden />
                  Reagendado
                </span>
              )}
            </div>

            {isRescheduled && (
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {formatCalendarDate(block.originalScheduledDate, "short")} →{" "}
                {formatCalendarDate(block.scheduledDate, "short")}
              </p>
            )}
            {block.actualMinutes !== undefined && (
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Real: {formatMinutes(block.actualMinutes)}
                {block.difficulty !== undefined && ` · D ${block.difficulty}/5`}
                {block.confidence !== undefined && ` · C ${block.confidence}/5`}
              </p>
            )}
          </div>

          <button
            onClick={onOpen}
            className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
            aria-label={`Ver detalhes de ${block.title}`}
          >
            <InfoIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <BlockActions
          status={executionStatus}
          isPast={isPast}
          onStart={onStart}
          onComplete={onComplete}
          onStuck={onStuck}
          onReturnToPending={onReturnToPending}
          onSkip={onSkip}
          onRestore={onRestore}
          onReschedule={onReschedule}
        />
      </div>
    </article>
  );
}

type BlockActionsProps = {
  status: PlanBlockExecutionStatus;
  isPast: boolean;
  onStart: () => void;
  onComplete: () => void;
  onStuck: () => void;
  onReturnToPending: () => void;
  onSkip: () => void;
  onRestore: () => void;
  onReschedule: () => void;
};

function BlockActions({
  status,
  onStart,
  onComplete,
  onStuck,
  onReturnToPending,
  onSkip,
  onRestore,
  onReschedule,
}: BlockActionsProps) {
  if (status === "completed") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckIcon className="h-2.5 w-2.5" aria-hidden />
          Concluído
        </span>
        <button
          onClick={onReturnToPending}
          className="text-muted-foreground hover:text-foreground text-[11px] underline"
          aria-label="Desfazer conclusão"
        >
          Desfazer
        </button>
      </div>
    );
  }

  if (status === "skipped") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground inline-flex items-center gap-0.5 text-[10px]">
          <SkipForwardIcon className="h-2.5 w-2.5" aria-hidden />
          Pulado
        </span>
        <Button size="sm" variant="ghost" onClick={onRestore} className="h-5 px-2 text-[10px]">
          <RotateCcwIcon className="mr-0.5 h-2.5 w-2.5" aria-hidden />
          Restaurar
        </Button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" onClick={onStart} className="h-6 px-2 text-xs">
          <PlayIcon className="mr-1 h-3 w-3" aria-hidden />
          Iniciar
        </Button>
        <Button size="sm" variant="outline" onClick={onComplete} className="h-6 px-2 text-xs">
          <CheckIcon className="mr-1 h-3 w-3" aria-hidden />
          Concluir
        </Button>
        <Button size="sm" variant="ghost" onClick={onStuck} className="h-6 px-2 text-xs">
          Travei
        </Button>
        <Button size="sm" variant="ghost" onClick={onReschedule} className="h-6 px-2 text-xs">
          Reagendar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSkip}
          className="h-6 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Pular
        </Button>
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" onClick={onComplete} className="h-6 px-2 text-xs">
          <CheckIcon className="mr-1 h-3 w-3" aria-hidden />
          Concluir
        </Button>
        <Button size="sm" variant="ghost" onClick={onStuck} className="h-6 px-2 text-xs">
          Travei
        </Button>
        <Button size="sm" variant="ghost" onClick={onReturnToPending} className="h-6 px-2 text-xs">
          Pausar
        </Button>
        <Button size="sm" variant="ghost" onClick={onReschedule} className="h-6 px-2 text-xs">
          Reagendar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSkip}
          className="h-6 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Pular
        </Button>
      </div>
    );
  }

  if (status === "stuck") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" onClick={onComplete} className="h-6 px-2 text-xs">
          <CheckIcon className="mr-1 h-3 w-3" aria-hidden />
          Concluir mesmo assim
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReturnToPending}
          className="h-6 px-2 text-xs"
        >
          Retomar
        </Button>
        <Button size="sm" variant="ghost" onClick={onReschedule} className="h-6 px-2 text-xs">
          Reagendar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSkip}
          className="h-6 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Pular
        </Button>
      </div>
    );
  }

  return null;
}
