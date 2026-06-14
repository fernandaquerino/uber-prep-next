"use client";

import type { ScheduledWeek, CalendarDate } from "@/lib/domain/schedule";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import { PlusIcon } from "lucide-react";
import { formatWeekdayLabel } from "./plan-utils";
import { PlanGridBlockCard } from "./plan-grid-block-card";
import { cn } from "@/lib/utils";

type PlanWeekGridProps = {
  week: ScheduledWeek;
  effectiveDays: EffectiveScheduledDay[];
  today: CalendarDate;
  isFiltered?: boolean;
  onOpenBlock: (blockId: string) => void;
  onMissedDay: (date: CalendarDate) => void;
};

type GridDay = {
  day: EffectiveScheduledDay;
  isToday: boolean;
  isPast: boolean;
  plannedMinutes: number;
  fillPercent: number;
  dimmed: boolean;
  hasUnresolvedPast: boolean;
};

export function PlanWeekGrid({
  week,
  effectiveDays,
  today,
  isFiltered = false,
  onOpenBlock,
  onMissedDay,
}: PlanWeekGridProps) {
  const dayMap = new Map(effectiveDays.map((d) => [d.date, d]));

  const gridDays: GridDay[] = week.days.map((baseDay) => {
    const effectiveDay = dayMap.get(baseDay.date);

    // Days absent from the effective schedule fall back to the base plan so the
    // column still renders its blocks as pending.
    const day: EffectiveScheduledDay = effectiveDay ?? {
      ...baseDay,
      items: baseDay.items.map((item) => ({
        ...item,
        originalScheduledDate: baseDay.date,
        scheduledDate: baseDay.date,
        executionStatus: "pending" as const,
        timingStatus:
          baseDay.date < today ? "past" : baseDay.date === today ? "today" : "future",
        isOverdue: false,
        isRescheduled: false,
      })),
    };

    const isToday = day.date === today;
    const isPast = day.date < today;
    const plannedMinutes = day.totalEstimatedMinutes;
    const fillPercent =
      day.availableMinutes > 0
        ? Math.min(100, Math.round((plannedMinutes / day.availableMinutes) * 100))
        : 0;
    const hasUnresolvedPast =
      isPast &&
      day.items.some(
        (i) =>
          i.executionStatus === "pending" ||
          i.executionStatus === "in_progress" ||
          i.executionStatus === "stuck",
      );

    return {
      day,
      isToday,
      isPast,
      plannedMinutes,
      fillPercent,
      dimmed: isFiltered && (!effectiveDay || day.items.length === 0),
      hasUnresolvedPast,
    };
  });

  const lastIndex = gridDays.length - 1;

  return (
    <div className="overflow-x-auto">
      <div className="border-border bg-surface min-w-[920px] overflow-hidden rounded-xl border">
        {/* Day headers */}
        <div className="border-border grid grid-cols-7 border-b">
          {gridDays.map(({ day, isToday, plannedMinutes, fillPercent }, i) => (
            <div
              key={day.date}
              className={cn(
                "px-3.5 py-3",
                i < lastIndex && "border-border border-r",
                isToday && "bg-primary-subtle",
              )}
            >
              <div
                className={cn(
                  "mb-1 text-[10px] font-bold tracking-[0.07em] uppercase",
                  isToday ? "text-primary" : "text-muted",
                )}
              >
                {formatWeekdayLabel(day.weekday, true)}
              </div>

              {day.isRestDay || day.availableMinutes === 0 ? (
                <div className="text-muted text-[10px]">Folga</div>
              ) : (
                <>
                  <div
                    className={cn(
                      "mb-1.5 font-mono text-[11px] font-semibold",
                      isToday ? "text-primary" : "text-text-secondary",
                    )}
                  >
                    {plannedMinutes}min
                  </div>
                  <div
                    className="bg-surface-muted h-[3px] w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={fillPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${plannedMinutes} de ${day.availableMinutes} minutos planejados`}
                  >
                    <div
                      className={cn("h-full rounded-full", isToday ? "bg-primary" : "bg-info")}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="text-muted mt-1 text-[9px]">de {day.availableMinutes}min</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Blocks */}
        <div className="grid grid-cols-7 items-start py-3" style={{ minHeight: 300 }}>
          {gridDays.map(({ day, isToday, dimmed, hasUnresolvedPast }, i) => (
            <div
              key={day.date}
              className={cn(
                "flex flex-col gap-1.5 px-2",
                i < lastIndex && "border-border-subtle border-r",
                isToday && "bg-primary-subtle/40",
                dimmed && "opacity-40",
              )}
            >
              {day.items.map((block) => (
                <PlanGridBlockCard
                  key={block.blockId}
                  block={block}
                  onOpen={() => onOpenBlock(block.blockId)}
                />
              ))}

              {hasUnresolvedPast && (
                <button
                  type="button"
                  onClick={() => onMissedDay(day.date)}
                  className="border-border text-muted hover:text-text-primary hover:border-text-muted w-full rounded-md border border-dashed px-2 py-1.5 text-[10px] transition-colors"
                >
                  Não estudei?
                </button>
              )}

              {!day.isRestDay &&
                day.availableMinutes > 0 &&
                day.items.length === 0 &&
                !hasUnresolvedPast && (
                  /* TODO: criação de bloco ainda não existe no domínio */
                  <button
                    type="button"
                    disabled
                    title="Em breve"
                    className="border-border text-muted flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-[11px]"
                  >
                    <PlusIcon className="h-3 w-3" aria-hidden />
                    Adicionar
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
