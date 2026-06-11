"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { cn } from "@/lib/utils";
import type {
  DashboardProgressViewModel,
  DashboardCategoryProgressViewModel,
} from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  progress: DashboardProgressViewModel;
  categoryProgress: DashboardCategoryProgressViewModel[];
};

function CategoryRow({ cat }: { cat: DashboardCategoryProgressViewModel }) {
  const visual = getCategoryVisual(cat.category);
  const notStarted = cat.state === "not_started";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", visual.dot)} aria-hidden />
          <span className="truncate font-medium">{cat.label}</span>
          {cat.stuck > 0 && (
            <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {cat.stuck} travado{cat.stuck !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className="text-muted-foreground shrink-0 tabular-nums">
          {notStarted ? (
            <span className="italic">Não iniciado · 0/{cat.total}</span>
          ) : (
            `${cat.completed}/${cat.total} · ${cat.percentage}%`
          )}
        </span>
      </div>
      <Progress
        value={cat.percentage}
        className="h-1.5"
        aria-label={`${cat.label}: ${cat.percentage}% concluído`}
      />
    </div>
  );
}

export function DashboardProgressSection({ progress, categoryProgress }: Props) {
  const {
    completed,
    total,
    percentage,
    inProgress,
    stuck,
    skipped,
    resolutionCount,
    resolutionPercentage,
  } = progress;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* General progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Progresso do plano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold tabular-nums">{percentage}</span>
                <span className="text-muted-foreground text-lg">%</span>
              </div>
              <span className="text-muted-foreground text-sm tabular-nums">
                {completed}/{total} blocos
              </span>
            </div>
            <Progress
              value={percentage}
              className="h-2"
              aria-label={`${percentage}% do plano concluído`}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
            {inProgress > 0 && (
              <span className="text-blue-600 dark:text-blue-400">{inProgress} em andamento</span>
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

          {resolutionCount > 0 && resolutionCount !== completed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <p className="text-muted-foreground cursor-help border-t pt-2 text-xs underline decoration-dotted">
                      Resolução: {resolutionCount}/{total} · {resolutionPercentage}%
                    </p>
                  }
                />
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Resolução considera blocos concluídos e pulados.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Category progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Progresso por área
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryProgress.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma categoria encontrada.</p>
          ) : (
            categoryProgress.map((cat) => <CategoryRow key={cat.category} cat={cat} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
