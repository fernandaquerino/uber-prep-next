"use client";

import { useState } from "react";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import type { CalendarDate } from "@/lib/domain/schedule";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, MoonIcon } from "lucide-react";
import {
  formatCalendarDate,
  formatMinutes,
  formatWeekdayLabel,
  getDayProgressStatus,
} from "./plan-utils";
import { getDayCapacityInfo } from "@/lib/presentation/plan-view-models";
import { PlanBlockCard } from "./plan-block-card";
import { cn } from "@/lib/utils";

type PlanDayCardProps = {
  day: EffectiveScheduledDay;
  today: CalendarDate;
  defaultOpen?: boolean;
  onStartBlock: (blockId: string) => void;
  onCompleteBlock: (blockId: string) => void;
  onStuckBlock: (blockId: string) => void;
  onReturnToPending: (blockId: string) => void;
  onSkipBlock: (blockId: string) => void;
  onRestoreBlock: (blockId: string) => void;
  onRescheduleBlock: (blockId: string) => void;
  onOpenBlock: (blockId: string) => void;
  onMissedDay: (date: CalendarDate) => void;
};

export function PlanDayCard({
  day,
  today,
  defaultOpen = false,
  onStartBlock,
  onCompleteBlock,
  onStuckBlock,
  onReturnToPending,
  onSkipBlock,
  onRestoreBlock,
  onRescheduleBlock,
  onOpenBlock,
  onMissedDay,
}: PlanDayCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isToday = day.date === today;
  const isPast = day.date < today;
  const progressStatus = getDayProgressStatus(day);
  const completedCount = day.items.filter(
    (i) => i.executionStatus === "completed" || i.executionStatus === "skipped",
  ).length;
  const overdueCount = day.items.filter((i) => i.isOverdue).length;

  const capacity = getDayCapacityInfo(day.totalEstimatedMinutes, day.availableMinutes);

  return (
    <section
      className={cn(
        "rounded-lg border transition-colors",
        isToday &&
          "border-blue-400 ring-1 ring-blue-400/40 dark:border-blue-500 dark:ring-blue-500/40",
        day.isRestDay && "border-dashed opacity-60",
        !isToday && !day.isRestDay && "border-border",
      )}
      aria-label={`${isToday ? "Hoje, " : ""}${formatWeekdayLabel(day.weekday)}, ${formatCalendarDate(day.date)}`}
    >
      <button
        onClick={() => !day.isRestDay && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-start justify-between gap-3 p-3 text-left",
          day.isRestDay && "cursor-default",
        )}
        aria-expanded={day.isRestDay ? undefined : open}
        aria-controls={day.isRestDay ? undefined : `day-content-${day.date}`}
        disabled={day.isRestDay}
      >
        <div className="flex flex-col gap-0.5">
          {/* Date header */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isToday && (
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Hoje
              </span>
            )}
            <span
              className={cn("text-sm font-semibold", isToday && "text-blue-700 dark:text-blue-300")}
            >
              {formatWeekdayLabel(day.weekday)}, {formatCalendarDate(day.date)}
            </span>
            {isPast && !isToday && progressStatus === "completed" && (
              <span className="text-[10px] font-medium text-green-700 dark:text-green-400">
                Concluído
              </span>
            )}
            {overdueCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {overdueCount} atrasado{overdueCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Capacity / summary line */}
          {!day.isRestDay && (
            <DayCapacityLine
              capacity={capacity}
              completedCount={completedCount}
              totalCount={day.items.length}
            />
          )}
        </div>

        <span className="text-muted-foreground mt-0.5 shrink-0" aria-hidden>
          {day.isRestDay ? (
            <MoonIcon className="h-4 w-4" />
          ) : open ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </span>
      </button>

      {day.isRestDay && (
        <div className="px-3 pb-3">
          <p className="text-muted-foreground text-xs">Dia de descanso</p>
        </div>
      )}

      {open && !day.isRestDay && (
        <div id={`day-content-${day.date}`} className="flex flex-col gap-2 px-3 pb-3">
          {day.items.length === 0 ? (
            <p className="text-muted-foreground text-xs">Nenhum bloco agendado para este dia.</p>
          ) : (
            day.items.map((block) => (
              <PlanBlockCard
                key={block.blockId}
                block={block}
                onStart={() => onStartBlock(block.blockId)}
                onComplete={() => onCompleteBlock(block.blockId)}
                onStuck={() => onStuckBlock(block.blockId)}
                onReturnToPending={() => onReturnToPending(block.blockId)}
                onSkip={() => onSkipBlock(block.blockId)}
                onRestore={() => onRestoreBlock(block.blockId)}
                onReschedule={() => onRescheduleBlock(block.blockId)}
                onOpen={() => onOpenBlock(block.blockId)}
              />
            ))
          )}

          {isPast &&
            !isToday &&
            day.items.some(
              (i) =>
                i.executionStatus === "pending" ||
                i.executionStatus === "in_progress" ||
                i.executionStatus === "stuck",
            ) && (
              <div className="border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMissedDay(day.date)}
                  className="text-muted-foreground h-7 px-2 text-xs"
                  aria-label={`Tratar dia perdido: ${formatCalendarDate(day.date)}`}
                >
                  Não estudei neste dia — o que fazer?
                </Button>
              </div>
            )}
        </div>
      )}
    </section>
  );
}

// ─── Capacity Line ─────────────────────────────────────────────────────────────

type DayCapacityLineProps = {
  capacity: ReturnType<typeof getDayCapacityInfo>;
  completedCount: number;
  totalCount: number;
};

function DayCapacityLine({ capacity, completedCount, totalCount }: DayCapacityLineProps) {
  const { plannedMinutes, availableMinutes, exceededMinutes, freeMinutes, status } = capacity;

  if (totalCount === 0) {
    return (
      <p className="text-muted-foreground text-xs">{formatMinutes(availableMinutes)} disponíveis</p>
    );
  }

  return (
    <p className="text-muted-foreground text-xs">
      {completedCount > 0 && (
        <>
          <span className="text-green-700 dark:text-green-400">
            {completedCount}/{totalCount}
          </span>{" "}
          ·{" "}
        </>
      )}
      {formatMinutes(plannedMinutes)} planejados
      {status === "over" && exceededMinutes > 0 && (
        <span className="text-red-600 dark:text-red-400">
          {" "}
          · {formatMinutes(exceededMinutes)} acima da capacidade
        </span>
      )}
      {status === "within" && freeMinutes > 0 && (
        <span> · {formatMinutes(freeMinutes)} livres</span>
      )}
      {status === "near_limit" && (
        <span className="text-amber-600 dark:text-amber-400"> · próximo do limite</span>
      )}
    </p>
  );
}
