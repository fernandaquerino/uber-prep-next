"use client";

import type { ScheduledWeek, CalendarDate } from "@/lib/domain/schedule";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { formatCalendarDate, hasOverdueItems } from "./plan-utils";
import { cn } from "@/lib/utils";

type PlanWeekNavigationProps = {
  weeks: ScheduledWeek[];
  effectiveDays: EffectiveScheduledDay[];
  selectedWeekId: string;
  today: CalendarDate;
  onSelectWeek: (id: string) => void;
};

export function PlanWeekNavigation({
  weeks,
  effectiveDays,
  selectedWeekId,
  today,
  onSelectWeek,
}: PlanWeekNavigationProps) {
  const selectedIndex = weeks.findIndex((w) => w.id === selectedWeekId);
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < weeks.length - 1;
  const todayWeekId = weeks.find((w) => w.days.some((d) => d.date === today))?.id;
  const selectedWeek = weeks[selectedIndex];

  function go(offset: number) {
    const next = weeks[selectedIndex + offset];
    if (next) onSelectWeek(next.id);
  }

  function getWeekDot(week: ScheduledWeek): "today" | "overdue" | "completed" | null {
    const isToday = week.days.some((d) => d.date === today);
    if (isToday) return "today";
    const effectiveWeekDays = effectiveDays.filter((d) =>
      week.days.some((wd) => wd.date === d.date),
    );
    const studyDays = effectiveWeekDays.filter((d) => !d.isRestDay);
    if (studyDays.length === 0) return null;
    const allResolved = studyDays.every((d) =>
      d.items.every((i) => i.executionStatus === "completed" || i.executionStatus === "skipped"),
    );
    if (allResolved) return "completed";
    const hasOverdue = studyDays.some((d) => hasOverdueItems(d));
    if (hasOverdue) return "overdue";
    return null;
  }

  return (
    <nav aria-label="Navegação por semana" className="flex flex-col gap-2">
      {/* Single-line compact navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => go(-1)}
          disabled={!hasPrev}
          aria-label="Semana anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          {selectedWeek && (
            <p className="text-sm font-medium tabular-nums">
              Semana {selectedIndex + 1} de {weeks.length}
              <span className="text-muted-foreground ml-1.5 font-normal">
                · {formatCalendarDate(selectedWeek.weekStart, "short")} a{" "}
                {formatCalendarDate(selectedWeek.weekEnd, "short")}
              </span>
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => go(1)}
          disabled={!hasNext}
          aria-label="Próxima semana"
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {/* Week pill row */}
      <div
        className="flex items-center gap-1 overflow-x-auto pb-0.5"
        role="tablist"
        aria-label="Semanas do plano"
      >
        {weeks.map((week, idx) => {
          const dot = getWeekDot(week);
          const isSelected = week.id === selectedWeekId;
          return (
            <button
              key={week.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectWeek(week.id)}
              className={cn(
                "relative flex h-7 min-w-[2rem] shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
              aria-label={`Semana ${idx + 1}${dot === "today" ? " (semana atual)" : ""}${dot === "overdue" ? " (tem atrasos)" : ""}${dot === "completed" ? " (concluída)" : ""}`}
            >
              {idx + 1}
              {dot && (
                <span
                  className={cn(
                    "absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full",
                    dot === "today" && "bg-blue-500",
                    dot === "overdue" && "bg-red-500",
                    dot === "completed" && "bg-green-500",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}

        {todayWeekId && todayWeekId !== selectedWeekId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectWeek(todayWeekId)}
            className="text-muted-foreground ml-1 h-7 shrink-0 px-2 text-xs"
          >
            Ir para hoje
          </Button>
        )}
      </div>
    </nav>
  );
}
