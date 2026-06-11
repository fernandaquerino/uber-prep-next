"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Moon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { cn } from "@/lib/utils";
import type {
  DashboardFocusViewModel,
  DashboardWeekQuickSummary,
} from "@/lib/presentation/dashboard/dashboard-view-model";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";

type Props = {
  focus: DashboardFocusViewModel;
  weekSummary: DashboardWeekQuickSummary;
};

function WeekQuickSummary({ summary }: { summary: DashboardWeekQuickSummary }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {summary.weekLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Concluídos</span>
            <span className="font-semibold tabular-nums">
              {summary.completed}
              <span className="text-muted-foreground font-normal">/{summary.total}</span>
            </span>
          </div>
          {summary.inProgress > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Em andamento</span>
              <span className="text-blue-600 tabular-nums dark:text-blue-400">
                {summary.inProgress}
              </span>
            </div>
          )}
          {summary.stuck > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Travados</span>
              <span className="text-amber-600 tabular-nums dark:text-amber-400">
                {summary.stuck}
              </span>
            </div>
          )}
          {summary.overdue > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Atrasados</span>
              <span className="text-red-600 tabular-nums dark:text-red-400">{summary.overdue}</span>
            </div>
          )}
        </div>

        {summary.hasPositiveState && summary.completed > 0 && (
          <p className="flex items-center gap-1 border-t pt-2 text-xs text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            Sem atrasos nem travamentos
          </p>
        )}

        {summary.total === 0 && (
          <p className="text-muted-foreground text-xs">Nenhum bloco nesta semana.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardFocus({ focus, weekSummary }: Props) {
  const {
    currentItem,
    lastCompletedTitle,
    isRestDay,
    nextStudyDayFormatted,
    todayBlocksCompleted,
    todayBlocksTotal,
  } = focus;

  const visual = currentItem ? getCategoryVisual(currentItem.category) : null;

  const mainContent = () => {
    if (isRestDay && !currentItem) {
      return (
        <Card className="h-full">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-3">
              <Moon className="h-8 w-8 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="font-semibold">Hoje é dia de descanso</p>
                <p className="text-muted-foreground text-sm">Aproveite para recuperar energia.</p>
              </div>
            </div>
            {nextStudyDayFormatted && (
              <div className="bg-muted/40 rounded-lg px-3 py-2 text-sm">
                <span className="text-muted-foreground">Próximo estudo: </span>
                <span className="font-medium">{nextStudyDayFormatted}</span>
              </div>
            )}
            {lastCompletedTitle && (
              <p className="text-muted-foreground border-t pt-2 text-xs">
                Último concluído:{" "}
                <span className="text-foreground font-medium">{lastCompletedTitle}</span>
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    if (!currentItem) {
      return (
        <Card className="h-full border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-green-600" aria-hidden />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">Plano concluído!</p>
              <p className="text-muted-foreground text-sm">Todos os blocos foram concluídos.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={cn("h-full border-l-4", visual?.border ?? "border-l-border")}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="h-4 w-4 text-blue-600" aria-hidden />
            {currentItem.status === "in_progress" ? "Em andamento" : "Próximo estudo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-base leading-snug font-semibold">{currentItem.title}</p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
              <CategoryBadge category={currentItem.category} />
              <span>{currentItem.typeLabel}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" aria-hidden />
                {currentItem.durationFormatted}
              </span>
              {currentItem.isOverdue && (
                <>
                  <span>·</span>
                  <span className="font-medium text-red-600">Atrasado</span>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{currentItem.scheduledDateFormatted}</p>
          </div>

          {todayBlocksTotal > 0 && (
            <div className="text-muted-foreground bg-muted/30 flex items-center gap-2 rounded px-2 py-1.5 text-xs">
              <span>
                Hoje: {todayBlocksCompleted}/{todayBlocksTotal} blocos
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/plano"
              className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
              aria-label={`${currentItem.primaryActionLabel} — ${currentItem.title}`}
            >
              {currentItem.primaryActionLabel}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {lastCompletedTitle && (
            <p className="text-muted-foreground border-t pt-2 text-xs">
              Último concluído:{" "}
              <span className="text-foreground font-medium">{lastCompletedTitle}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">{mainContent()}</div>
      <div>
        <WeekQuickSummary summary={weekSummary} />
      </div>
    </div>
  );
}
