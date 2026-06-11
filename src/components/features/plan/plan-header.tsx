"use client";

import type { CalendarDate } from "@/lib/domain/schedule";
import type { ScheduledStudyDay } from "@/lib/domain/schedule";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Settings2Icon } from "lucide-react";
import { formatCalendarDate } from "./plan-utils";

type PlanHeaderProps = {
  startDate: CalendarDate;
  baseSchedule: ScheduledStudyDay[];
  onChangeStartDate: () => void;
};

function getScheduleRange(schedule: ScheduledStudyDay[]): {
  first: CalendarDate | null;
  last: CalendarDate | null;
} {
  const studyDays = schedule.filter((d) => !d.isRestDay);
  return {
    first: studyDays[0]?.date ?? null,
    last: studyDays.at(-1)?.date ?? null,
  };
}

export function PlanHeader({ startDate, baseSchedule, onChangeStartDate }: PlanHeaderProps) {
  const { first, last } = getScheduleRange(baseSchedule);
  const totalStudyDays = baseSchedule.filter((d) => !d.isRestDay).length;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Plano de estudos</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe sua agenda, pendências e progresso.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
            Comecei em:{" "}
            <time dateTime={startDate} className="text-foreground font-medium">
              {formatCalendarDate(startDate)}
            </time>
          </span>
          {first && last && (
            <span className="text-muted-foreground">
              {formatCalendarDate(first, "short")} até {formatCalendarDate(last, "short")} ·{" "}
              {totalStudyDays} dias de estudo
            </span>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onChangeStartDate}
        className="flex-shrink-0 self-start"
        aria-label="Alterar data de início do plano"
      >
        <Settings2Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Alterar início
      </Button>
    </div>
  );
}
