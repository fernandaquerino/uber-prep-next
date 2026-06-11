"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityDay } from "@/lib/presentation/dashboard/dashboard-view-model";
import type { CalendarDate } from "@/lib/domain/schedule";

type Props = {
  activityDays: ActivityDay[];
  today: CalendarDate;
};

function getIntensityClass(count: number, isRestDay: boolean): string {
  if (isRestDay) return "bg-slate-100 dark:bg-slate-800/60";
  if (count === 0) return "bg-muted dark:bg-muted/40";
  if (count === 1) return "bg-green-200 dark:bg-green-900/60";
  if (count === 2) return "bg-green-400 dark:bg-green-700";
  return "bg-green-600 dark:bg-green-500";
}

export function DashboardActivityCalendar({ activityDays, today }: Props) {
  // Show only the last 10 weeks worth of study days
  const recent = activityDays.slice(-70);

  if (recent.length === 0) {
    return null;
  }

  // Group into rows of 7
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < recent.length; i += 7) {
    weeks.push(recent.slice(i, i + 7));
  }

  return (
    <section aria-labelledby="activity-heading" className="space-y-2">
      <h2 id="activity-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Atividade
      </h2>
      <Card>
        <CardContent className="pt-4 pb-4">
          <div
            className="flex gap-0.5 overflow-x-auto pb-1"
            aria-label="Calendário de atividades"
            role="img"
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => {
                  const isToday = day.date === today;
                  return (
                    <div
                      key={day.date}
                      title={
                        day.isRestDay
                          ? `${day.date} — descanso`
                          : `${day.date} — ${day.completedCount} bloco${day.completedCount !== 1 ? "s" : ""} concluído${day.completedCount !== 1 ? "s" : ""}`
                      }
                      className={cn(
                        "h-3 w-3 rounded-[2px]",
                        getIntensityClass(day.completedCount, day.isRestDay),
                        isToday && "ring-1 ring-blue-400 ring-offset-1",
                      )}
                      aria-hidden
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Menos</span>
            {[0, 1, 2, 3].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-3 w-3 rounded-[2px]",
                  level === 0
                    ? "bg-muted"
                    : level === 1
                      ? "bg-green-200 dark:bg-green-900/60"
                      : level === 2
                        ? "bg-green-400 dark:bg-green-700"
                        : "bg-green-600 dark:bg-green-500",
                )}
                aria-hidden
              />
            ))}
            <span>Mais</span>
            <span className="ml-auto text-[10px]">blocos concluídos por dia</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
