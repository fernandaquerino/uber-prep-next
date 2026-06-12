"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Loader2, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatTimerDuration } from "@/lib/domain/timer";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";
import { DashboardFocus } from "./dashboard-focus";
import { DashboardPriorities } from "./dashboard-priorities";
import { DashboardProgressSection } from "./dashboard-progress-section";
import { DashboardWeekDays } from "./dashboard-week-days";
import { DashboardUpcomingEnhanced } from "./dashboard-upcoming-enhanced";
import { DashboardActivityEnhanced } from "./dashboard-activity-enhanced";
import { DashboardConsistency } from "./dashboard-consistency";
import { DashboardReadiness } from "./dashboard-readiness";
import { DashboardSkillTree } from "./dashboard-skill-tree";
import { DashboardRiskTopics } from "./dashboard-risk-topics";
import { DashboardKnowledgeHeatmap } from "./dashboard-knowledge-heatmap";
import { DashboardStatistics } from "./dashboard-statistics";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando dashboard" aria-busy="true">
      <div className="space-y-1">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-52" />
      </div>
      {/* Focus + week summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-xl lg:col-span-2" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      {/* Priorities */}
      <Skeleton className="h-14 w-full rounded-lg" />
      {/* Progress section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      {/* Week days */}
      <Skeleton className="h-28 w-full rounded-xl" />
      {/* Upcoming + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      {/* Consistency */}
      <Skeleton className="h-24 w-full rounded-xl" />
      <span className="sr-only">Carregando dashboard…</span>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DashboardHeader({
  header,
  onRefresh,
  isRefreshing,
}: {
  header: DashboardViewModel["header"];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {header.todayFormatted} · {header.weekLabel} · {header.planPeriodFormatted}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-label={isRefreshing ? "Atualizando…" : "Atualizar dashboard"}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              }
            />
            <TooltipContent>Atualizar dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Separator />
    </div>
  );
}

function DashboardTimerSummary({ timer }: { timer: DashboardViewModel["timer"] }) {
  const visual = timer.activeCategory ? getCategoryVisual(timer.activeCategory) : null;
  const hasAnyTimerData = timer.activeTitle || timer.todaySeconds > 0 || timer.weekSeconds > 0;

  return (
    <section className="border-border bg-card/60 rounded-xl border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Clock3 className="h-4 w-4" aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Timer de foco</h2>
            {timer.activeTitle ? (
              <p className="text-muted-foreground text-sm">
                <span
                  className={`mr-2 inline-block h-2 w-2 rounded-full ${
                    visual?.dot ?? "bg-muted-foreground"
                  }`}
                  aria-hidden
                />
                {timer.activeStatus === "paused" ? "Pausado" : "Em andamento"}: {timer.activeTitle}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {hasAnyTimerData
                  ? "Tempo oficial registrado pelas sessões de foco."
                  : "Inicie uma sessão para registrar tempo real de estudo."}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-24">
            <p className="text-muted-foreground text-xs">Hoje</p>
            <p className="font-mono text-sm font-semibold">
              {formatTimerDuration(timer.todaySeconds)}
            </p>
            <p className="text-muted-foreground text-xs">
              {timer.todaySessionCount} sessão{timer.todaySessionCount === 1 ? "" : "ões"}
            </p>
          </div>
          <div className="min-w-24">
            <p className="text-muted-foreground text-xs">Semana</p>
            <p className="font-mono text-sm font-semibold">
              {formatTimerDuration(timer.weekSeconds)}
            </p>
            <p className="text-muted-foreground text-xs">
              {timer.weekSessionCount} sessão{timer.weekSessionCount === 1 ? "" : "ões"}
            </p>
          </div>
          <Link href="/timer" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Abrir timer
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function DashboardContent({ vm }: { vm: DashboardViewModel }) {
  return (
    <div className="space-y-6">
      {/* 1. Foco do dia + resumo rápido da semana */}
      <DashboardFocus focus={vm.focus} weekSummary={vm.weekQuickSummary} />

      {/* 2. Prioridades compactas */}
      <DashboardPriorities priorities={vm.priorities} />

      {/* 3. Timer de foco */}
      <DashboardTimerSummary timer={vm.timer} />

      {/* 4. Progresso geral + por área */}
      <DashboardProgressSection progress={vm.progress} categoryProgress={vm.categoryProgress} />

      {/* 5. Semana atual — 7 dias */}
      <DashboardWeekDays currentWeek={vm.currentWeek} weekLabel={vm.weekQuickSummary.weekLabel} />

      {/* 6. Próximos estudos + Atividade */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardUpcomingEnhanced upcoming={vm.upcoming} />
        <DashboardActivityEnhanced activity={vm.activity} />
      </div>

      {/* 7. Consistência */}
      <DashboardConsistency consistency={vm.consistency} />

      {/* 8. Analytics consolidados */}
      <DashboardReadiness analytics={vm.analytics} />
      <DashboardRiskTopics analytics={vm.analytics} />
      <DashboardSkillTree analytics={vm.analytics} />
      <DashboardKnowledgeHeatmap analytics={vm.analytics} />
      <DashboardStatistics analytics={vm.analytics} />
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const { state, refresh, isRefreshing } = useDashboard();

  return (
    <PageContainer>
      <div className="space-y-6">
        {state.status === "loading" && <DashboardSkeleton />}

        {state.status === "error" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <ErrorState description={state.error.message} onRetry={refresh} />
          </>
        )}

        {state.status === "no_start_date" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <EmptyState
              icon={<CalendarDays className="h-10 w-10" />}
              title="Data de início não configurada"
              description="Configure a data de início do seu plano para ver o dashboard."
              action={
                <Link href="/configuracoes" className={cn(buttonVariants())}>
                  Configurar data de início
                </Link>
              }
            />
          </>
        )}

        {state.status === "ready" && (
          <>
            <DashboardHeader
              header={state.viewModel.header}
              onRefresh={refresh}
              isRefreshing={isRefreshing}
            />
            <DashboardContent vm={state.viewModel} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
