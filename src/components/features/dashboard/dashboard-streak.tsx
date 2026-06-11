"use client";

import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStreak } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  streak: DashboardStreak;
};

export function DashboardStreak({ streak }: Props) {
  const { current, longestEver } = streak;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Sequência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-2">
          <Flame
            className={current > 0 ? "h-5 w-5 text-orange-500" : "h-5 w-5 text-muted-foreground/40"}
            aria-hidden
          />
          <span className="text-2xl font-bold tabular-nums">{current}</span>
          <span className="text-muted-foreground text-sm">
            dia{current !== 1 ? "s" : ""} seguido{current !== 1 ? "s" : ""}
          </span>
        </div>
        {longestEver > 0 && longestEver !== current && (
          <p className="text-muted-foreground text-xs">
            Recorde: {longestEver} dia{longestEver !== 1 ? "s" : ""}
          </p>
        )}
        {current === 0 && (
          <p className="text-muted-foreground text-xs">Conclua um bloco hoje para iniciar a sequência.</p>
        )}
      </CardContent>
    </Card>
  );
}
