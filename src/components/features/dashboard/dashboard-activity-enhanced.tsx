"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardActivityViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  activity: DashboardActivityViewModel;
};

const INTENSITY_CLASS: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-muted dark:bg-muted/40",
  1: "bg-green-200 dark:bg-green-900/60",
  2: "bg-green-400 dark:bg-green-700",
  3: "bg-green-600 dark:bg-green-500",
};

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function DashboardActivityEnhanced({ activity }: Props) {
  const { weeks, hasActivity, totalCompletedDays } = activity;

  const isEmpty = weeks.length === 0 || (!hasActivity && weeks.length <= 1);

  return (
    <section aria-labelledby="activity-heading">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground" id="activity-heading">
            Atividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="flex gap-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-3 w-3 rounded-[2px] bg-muted" aria-hidden />
                ))}
              </div>
              <p className="text-muted-foreground text-xs max-w-xs">
                Conclua blocos para visualizar sua consistência.
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex gap-0.5 overflow-x-auto"
                aria-label="Calendário de atividade — blocos concluídos por dia"
                role="img"
              >
                {/* Day row labels */}
                <div className="flex flex-col gap-0.5 pr-1 shrink-0">
                  {DAY_LABELS.map((label, i) => (
                    <div key={i} className="flex h-3 items-center">
                      <span className="text-[9px] text-muted-foreground w-5 leading-none">
                        {i % 2 === 0 ? label : ""}
                      </span>
                    </div>
                  ))}
                </div>

                {weeks.map((week) => (
                  <div key={week.weekStart} className="flex flex-col gap-0.5 shrink-0">
                    {week.days.map((day) => (
                      <div
                        key={day.date}
                        title={day.tooltipLabel}
                        className={cn(
                          "h-3 w-3 rounded-[2px]",
                          day.isRestDay
                            ? "bg-slate-100 dark:bg-slate-800/60"
                            : INTENSITY_CLASS[day.intensity],
                          day.isToday && "ring-1 ring-blue-400 ring-offset-1",
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2">
                <div className="flex items-center gap-1.5">
                  <span>Menos</span>
                  {([0, 1, 2, 3] as const).map((level) => (
                    <div
                      key={level}
                      className={cn("h-2.5 w-2.5 rounded-[2px]", INTENSITY_CLASS[level])}
                      aria-hidden
                    />
                  ))}
                  <span>Mais</span>
                </div>
                <span>
                  {totalCompletedDays} {totalCompletedDays === 1 ? "dia" : "dias"} com atividade
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Cada célula representa a quantidade de blocos concluídos naquele dia.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
