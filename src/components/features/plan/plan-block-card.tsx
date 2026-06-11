"use client";

import type { EffectiveScheduledBlock, PlanBlockExecutionStatus } from "@/lib/domain/progress";
import { Badge } from "@/components/ui/badge";
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
import { formatMinutes, getCategoryLabel, getStatusLabel, formatCalendarDate, getCategoryMeta } from "./plan-utils";
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

const STATUS_COLORS: Record<PlanBlockExecutionStatus, string> = {
  pending: "border-l-border",
  in_progress: "border-l-blue-500",
  completed: "border-l-green-500",
  stuck: "border-l-amber-500",
  skipped: "border-l-muted-foreground",
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
  const categoryMeta = getCategoryMeta(block.category);

  return (
    <article
      className={cn(
        "rounded-lg border border-l-4 p-3 transition-colors",
        STATUS_COLORS[executionStatus],
        isCompleted && "opacity-70",
      )}
      aria-label={`${block.title} — ${getStatusLabel(executionStatus)}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={onOpen}
              className="text-left text-sm font-medium hover:underline"
              aria-label={`Abrir detalhes do bloco: ${block.title}`}
            >
              {block.title}
            </button>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px]" 
                style={
                  categoryMeta
                    ? {
                        backgroundColor: `${categoryMeta.color}20`,
                        borderColor: `${categoryMeta.color}60`,
                        color: categoryMeta.color,
                      }
                    : undefined
                }>
                {getCategoryLabel(block.category)}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {formatMinutes(block.estimatedMinutes)}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangleIcon className="mr-0.5 h-2.5 w-2.5" aria-hidden />
                  Atrasado
                </Badge>
              )}
              {isRescheduled && (
                <Badge variant="outline" className="text-[10px]">
                  <CalendarIcon className="mr-0.5 h-2.5 w-2.5" aria-hidden />
                  Reagendado
                </Badge>
              )}
            </div>
            {isRescheduled && (
              <p className="text-muted-foreground text-xs">
                Original: {formatCalendarDate(block.originalScheduledDate, "short")} →{" "}
                {formatCalendarDate(block.scheduledDate, "short")}
              </p>
            )}
            {block.actualMinutes !== undefined && (
              <p className="text-muted-foreground text-xs">
                Real: {formatMinutes(block.actualMinutes)}
                {block.difficulty !== undefined && ` · Dificuldade ${block.difficulty}/5`}
                {block.confidence !== undefined && ` · Confiança ${block.confidence}/5`}
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
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] text-green-600 dark:text-green-400">
          <CheckIcon className="mr-0.5 h-2.5 w-2.5" aria-hidden />
          Concluído
        </Badge>
        <button
          onClick={onReturnToPending}
          className="text-muted-foreground hover:text-foreground text-xs underline"
          aria-label="Desfazer conclusão"
        >
          Desfazer
        </button>
      </div>
    );
  }

  if (status === "skipped") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-[10px]">
          <SkipForwardIcon className="mr-0.5 h-2.5 w-2.5" aria-hidden />
          Pulado
        </Badge>
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
