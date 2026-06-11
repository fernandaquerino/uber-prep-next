"use client";

import { useState } from "react";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import type { CalendarDate } from "@/lib/domain/schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, MoonIcon } from "lucide-react";
import {
  formatCalendarDate,
  formatMinutes,
  formatWeekdayLabel,
  getDayProgressStatus,
  hasOverdueItems,
} from "./plan-utils";
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
  const isOverdue = hasOverdueItems(day);
  const completedCount = day.items.filter(
    (i) => i.executionStatus === "completed" || i.executionStatus === "skipped",
  ).length;
  const isOverCapacity = day.capacityStatus === "over_capacity";

  return (
    <section
      className={cn(
        "rounded-lg border transition-colors",
        isToday && "border-blue-400 dark:border-blue-600",
        day.isRestDay && "border-dashed opacity-60",
      )}
      aria-label={`${formatWeekdayLabel(day.weekday)}, ${formatCalendarDate(day.date)}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
        aria-expanded={open}
        aria-controls={`day-content-${day.date}`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {formatWeekdayLabel(day.weekday)}, {formatCalendarDate(day.date)}
            </span>
            {isToday && (
              <Badge variant="default" className="text-[10px]">
                Hoje
              </Badge>
            )}
            {isPast && !isToday && progressStatus !== "completed" && !day.isRestDay && (
              <Badge variant="secondary" className="text-[10px]">
                Passado
              </Badge>
            )}
            {progressStatus === "completed" && (
              <Badge variant="outline" className="text-[10px] text-green-600 dark:text-green-400">
                Concluído
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px]">
                Atraso
              </Badge>
            )}
            {isOverCapacity && (
              <Badge variant="destructive" className="text-[10px]">
                Acima da capacidade
              </Badge>
            )}
          </div>
          {!day.isRestDay && (
            <p className="text-muted-foreground text-xs">
              {formatMinutes(day.availableMinutes)} disponíveis ·{" "}
              {formatMinutes(day.totalEstimatedMinutes)} estimados
              {day.items.length > 0 && ` · ${completedCount}/${day.items.length} blocos`}
            </p>
          )}
        </div>
        {!day.isRestDay && (
          <span className="text-muted-foreground shrink-0" aria-hidden>
            {open ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </span>
        )}
        {day.isRestDay && (
          <MoonIcon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
        )}
      </button>

      {day.isRestDay && (
        <div className="px-3 pb-3">
          <p className="text-muted-foreground text-xs">
            Dia de descanso · Nenhum conteúdo agendado
          </p>
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
