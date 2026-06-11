"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlanCompletionSummary } from "@/lib/domain/progress";

type Props = {
  completionSummary: PlanCompletionSummary;
};

export function DashboardProgress({ completionSummary }: Props) {
  const { total, completed, inProgress, stuck, skipped, completionPercentage } = completionSummary;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Progresso do plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold tabular-nums">
            {completionPercentage}
            <span className="text-muted-foreground text-base font-normal">%</span>
          </span>
          <span className="text-muted-foreground text-xs">
            {completed}/{total} blocos
          </span>
        </div>
        <Progress
          value={completionPercentage}
          className="h-2"
          aria-label={`${completionPercentage}% do plano concluído`}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {inProgress > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              {inProgress} em andamento
            </span>
          )}
          {stuck > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              {stuck} travado{stuck !== 1 ? "s" : ""}
            </span>
          )}
          {skipped > 0 && (
            <span className="text-muted-foreground">
              {skipped} pulado{skipped !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
