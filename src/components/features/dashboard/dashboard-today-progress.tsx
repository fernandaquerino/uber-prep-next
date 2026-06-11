"use client";

import { Moon, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/components/features/plan/plan-utils";
import type { TodayProgress } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  todayProgress: TodayProgress;
};

export function DashboardTodayProgress({ todayProgress }: Props) {
  const { completedCount, totalCount, completedMinutes, estimatedMinutes, isRestDay } =
    todayProgress;

  if (isRestDay) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Moon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          <div>
            <p className="text-sm font-medium">Dia de descanso</p>
            <p className="text-muted-foreground text-xs">
              Aproveite para recuperar energia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground pt-6 text-sm">
          Nenhum bloco agendado para hoje.
        </CardContent>
      </Card>
    );
  }

  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Hoje
          {allDone && <Trophy className="h-4 w-4 text-amber-500" aria-hidden />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold tabular-nums">
            {completedCount}
            <span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
          </span>
          <span className="text-muted-foreground text-xs">
            {formatMinutes(completedMinutes)} / {formatMinutes(estimatedMinutes)}
          </span>
        </div>
        <Progress value={pct} className="h-2" aria-label={`${pct}% concluído hoje`} />
        <p className="text-muted-foreground text-xs">
          {allDone ? "Todos os blocos do dia concluídos" : `${pct}% do dia concluído`}
        </p>
      </CardContent>
    </Card>
  );
}
