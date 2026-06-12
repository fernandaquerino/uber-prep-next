"use client";

import { CategoryBadge } from "@/components/features/plan/category-badge";
import { Button } from "@/components/ui/button";
import type { ReviewQueueItemViewModel } from "@/lib/presentation/reviews/review-view-model";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Timer } from "lucide-react";
import { useTimerActions } from "@/hooks/use-timer-actions";

const PRIORITY_COLORS = {
  critical: "border-l-destructive",
  high: "border-l-amber-500",
  medium: "border-l-blue-500",
  low: "border-l-border",
};

type Props = {
  item: ReviewQueueItemViewModel;
  onOpen: (item: ReviewQueueItemViewModel) => void;
};

export function ReviewQueueItem({ item, onOpen }: Props) {
  const timerActions = useTimerActions();
  const colorClass = PRIORITY_COLORS[item.priority];

  function startFocus() {
    void timerActions.start({
      mode: "countdown",
      sourceType: "review",
      sourceId: item.reviewId,
      category: item.category ?? "general",
      title: `Revisar: ${item.title}`,
      targetDurationSeconds: Math.max(60, (item.estimatedMinutes ?? 10) * 60),
    });
  }

  return (
    <li
      className={cn(
        "bg-card flex items-start gap-3 rounded-lg border border-l-4 px-4 py-3",
        colorClass,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.category && <CategoryBadge category={item.category} />}
          {item.typeLabel && (
            <span className="text-muted-foreground text-xs">{item.typeLabel}</span>
          )}
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{item.cycleLabel}</span>
        </div>
        <p className="text-sm leading-snug font-medium">{item.title}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {item.daysOverdue > 0 ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              {item.overdueLabel}
            </span>
          ) : (
            <span className="text-muted-foreground">Devida hoje</span>
          )}
          {item.durationFormatted && (
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {item.durationFormatted}
            </span>
          )}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              item.priority === "critical" && "bg-destructive/10 text-destructive",
              item.priority === "high" &&
                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
              item.priority === "medium" &&
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
              item.priority === "low" && "bg-muted text-muted-foreground",
            )}
          >
            {item.priorityLabel}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={startFocus}
          aria-label={`Iniciar foco para ${item.title}`}
        >
          <Timer className="h-3.5 w-3.5" aria-hidden />
          Foco
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpen(item)}
          aria-label={`Revisar ${item.title}`}
        >
          Revisar
        </Button>
      </div>
    </li>
  );
}
