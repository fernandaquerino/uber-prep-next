"use client";

import type { CurrentStudyState } from "@/lib/domain/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { formatMinutes, getCategoryLabel, getCategoryMeta } from "./plan-utils";

type PlanCurrentItemProps = {
  currentStudyState: CurrentStudyState;
  onStartBlock: (blockId: string) => void;
  onOpenBlock: (blockId: string) => void;
};

export function PlanCurrentItem({
  currentStudyState,
  onStartBlock,
  onOpenBlock,
}: PlanCurrentItemProps) {
  const { currentItem, overdueItems, isPlanCompleted } = currentStudyState;

  if (isPlanCompleted) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <CheckCircle2Icon
          className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Plano finalizado!
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Todos os blocos foram resolvidos.
          </p>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  const isOverdue = currentItem.isOverdue;
  const isInProgress = currentItem.executionStatus === "in_progress";
  const categoryMeta = getCategoryMeta(currentItem.category);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Estudo atual</h2>
        {overdueItems.length > 0 && (
          <span className="text-destructive flex items-center gap-1 text-xs" role="alert">
            <AlertTriangleIcon className="h-3.5 w-3.5" aria-hidden />
            {overdueItems.length} atrasado{overdueItems.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onOpenBlock(currentItem.blockId)}
            className="text-left text-sm font-medium hover:underline"
            aria-label={`Abrir detalhes: ${currentItem.title}`}
          >
            {currentItem.title}
          </button>
          <div className="flex flex-wrap gap-1.5">
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
              {getCategoryLabel(currentItem.category)}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {formatMinutes(currentItem.estimatedMinutes)}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px]">
                Atrasado
              </Badge>
            )}
            {isInProgress && (
              <Badge variant="default" className="text-[10px]">
                Em andamento
              </Badge>
            )}
          </div>
        </div>

        {!isInProgress && currentItem.executionStatus === "pending" && (
          <Button
            size="sm"
            onClick={() => onStartBlock(currentItem.blockId)}
            aria-label={`Iniciar bloco: ${currentItem.title}`}
          >
            <PlayIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Iniciar
          </Button>
        )}
        {isInProgress && (
          <Button
            size="sm"
            onClick={() => onOpenBlock(currentItem.blockId)}
            aria-label={`Continuar bloco: ${currentItem.title}`}
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
