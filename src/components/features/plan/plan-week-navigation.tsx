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

  function go(offset: number) {
    const next = weeks[selectedIndex + offset];
    if (next) onSelectWeek(next.id);
  }

  const selectedWeek = weeks[selectedIndex];

  function getWeekStatus(week: ScheduledWeek): "today" | "overdue" | "completed" | "normal" {
    const isToday = week.days.some((d) => d.date === today);
    if (isToday) return "today";

    const effectiveWeekDays = effectiveDays.filter((d) =>
      week.days.some((wd) => wd.date === d.date),
    );
    const studyDays = effectiveWeekDays.filter((d) => !d.isRestDay);
    if (studyDays.length === 0) return "normal";

    const allResolved = studyDays.every((d) =>
      d.items.every((i) => i.executionStatus === "completed" || i.executionStatus === "skipped"),
    );
    if (allResolved) return "completed";

    const hasOverdue = studyDays.some((d) => hasOverdueItems(d));
    if (hasOverdue) return "overdue";

    return "normal";
  }

  return (
    <nav aria-label="Navegação por semana" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(-1)}
          disabled={!hasPrev}
          aria-label="Semana anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        </Button>

        {selectedWeek && (
          <div className="text-center">
            <p className="text-sm font-medium">
              {formatCalendarDate(selectedWeek.weekStart, "short")} a{" "}
              {formatCalendarDate(selectedWeek.weekEnd, "short")}
            </p>
            <p className="text-muted-foreground text-xs">
              Semana {selectedIndex + 1} de {weeks.length}
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => go(1)}
          disabled={!hasNext}
          aria-label="Próxima semana"
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {todayWeekId && todayWeekId !== selectedWeekId && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectWeek(todayWeekId)}
            className="text-xs"
          >
            Ir para a semana atual
          </Button>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Semanas do plano">
        {weeks.map((week, idx) => {
          const status = getWeekStatus(week);
          return (
            <button
              key={week.id}
              role="tab"
              aria-selected={week.id === selectedWeekId}
              onClick={() => onSelectWeek(week.id)}
              className={cn(
                "flex h-8 min-w-[2.25rem] shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                week.id === selectedWeekId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground",
              )}
              aria-label={`Semana ${idx + 1}${status === "today" ? " (semana atual)" : ""}${status === "overdue" ? " (tem atrasos)" : ""}${status === "completed" ? " (concluída)" : ""}`}
            >
              <span aria-hidden="true">{idx + 1}</span>
              {status === "overdue" && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
              )}
              {status === "completed" && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
              )}
              {status === "today" && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
