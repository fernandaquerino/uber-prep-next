"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardWeekChartViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

export function DashboardWeekChart({ weekChart }: { weekChart: DashboardWeekChartViewModel }) {
  const { days, totalMinutes, goalMinutes } = weekChart;
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-sm font-semibold">Esta semana</CardTitle>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <span className="bg-primary h-2 w-2 rounded-full" aria-hidden />
            Estudado
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-28 items-end justify-between gap-1.5" role="img" aria-label="Minutos estudados por dia da semana">
          {days.map((day, i) => {
            const heightPct = Math.round((day.minutes / maxMinutes) * 100);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-7 rounded-t-sm transition-all",
                      day.minutes > 0 ? "bg-primary" : "bg-muted",
                      day.isToday && "ring-primary/40 ring-2",
                    )}
                    style={{ height: `${Math.max(heightPct, day.minutes > 0 ? 6 : 2)}%` }}
                    title={`${day.minutes}min`}
                  />
                </div>
                <span
                  className={cn(
                    "text-muted-foreground text-[11px]",
                    day.isToday && "text-foreground font-semibold",
                  )}
                >
                  {day.weekdayShort}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-xs">
          <span className="text-muted-foreground">
            Total: <span className="text-foreground font-medium tabular-nums">{totalMinutes}min</span>
          </span>
          {goalMinutes > 0 && (
            <span className="text-info font-medium tabular-nums">Meta: {goalMinutes}min</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
