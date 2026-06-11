"use client";

import { Flame, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DashboardConsistencyViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  consistency: DashboardConsistencyViewModel;
};

export function DashboardConsistency({ consistency }: Props) {
  const { currentStreak, longestStreak, studiedDaysThisWeek, totalStudiedDays, streakDescription } =
    consistency;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Consistência
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60" aria-label="Sobre a sequência" />
                }
              />
              <TooltipContent>
                <p className="max-w-xs text-xs leading-relaxed">
                  Um dia conta quando pelo menos um bloco é concluído.
                  Dias de descanso não quebram a sequência.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Flame
                className={cn("h-4 w-4", currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/40")}
                aria-hidden
              />
              <span className="text-xl font-bold tabular-nums">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              dia{currentStreak !== 1 ? "s" : ""} seguido{currentStreak !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xl font-bold tabular-nums">{longestStreak}</span>
            <p className="text-xs text-muted-foreground">recorde</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xl font-bold tabular-nums">{studiedDaysThisWeek}</span>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xl font-bold tabular-nums">{totalStudiedDays}</span>
            <p className="text-xs text-muted-foreground">dias totais</p>
          </div>
        </div>

        {currentStreak === 0 && (
          <p className="mt-3 text-xs text-muted-foreground border-t pt-2">
            {streakDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
