"use client";

import Link from "next/link";
import { CalendarDays, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardData } from "@/lib/presentation/dashboard/dashboard-view-model";
import { DashboardCurrentStudy } from "./dashboard-current-study";
import { DashboardTodayProgress } from "./dashboard-today-progress";
import { DashboardProgress } from "./dashboard-progress";
import { DashboardStreak } from "./dashboard-streak";
import { DashboardRecommendations } from "./dashboard-recommendations";
import { DashboardOverdue } from "./dashboard-overdue";
import { DashboardUpcoming } from "./dashboard-upcoming";
import { DashboardActivityCalendar } from "./dashboard-activity-calendar";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando dashboard" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <span className="sr-only">Carregando dashboard…</span>
    </div>
  );
}

export function DashboardScreen() {
  const { state, refresh } = useDashboard();

  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Resumo da sua preparação"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              aria-label="Atualizar dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          }
        />

        {state.status === "loading" && <DashboardSkeleton />}

        {state.status === "error" && (
          <ErrorState
            description={state.error.message}
            onRetry={refresh}
          />
        )}

        {state.status === "no_start_date" && (
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
        )}

        {state.status === "ready" && (
          <DashboardContent data={state.data} />
        )}
      </div>
    </PageContainer>
  );
}

type DashboardContentProps = {
  data: DashboardData;
};

function DashboardContent({ data }: DashboardContentProps) {
  const {
    today,
    currentStudyState,
    completionSummary,
    todayProgress,
    activityDays,
    streak,
    overdueItems,
    upcomingItems,
    recommendations,
  } = data;

  return (
    <div className="space-y-6">
      {/* Priority 1: Current study item */}
      <DashboardCurrentStudy currentStudyState={currentStudyState} />

      {/* Priority 2: Recommendations */}
      {recommendations.length > 0 && (
        <DashboardRecommendations recommendations={recommendations} />
      )}

      {/* Priority 3: Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardTodayProgress todayProgress={todayProgress} />
        <DashboardProgress completionSummary={completionSummary} />
        <DashboardStreak streak={streak} />
      </div>

      {/* Priority 4: Overdue items */}
      {overdueItems.length > 0 && (
        <DashboardOverdue overdueItems={overdueItems} />
      )}

      {/* Priority 5: Upcoming items */}
      {upcomingItems.length > 0 && (
        <DashboardUpcoming upcomingItems={upcomingItems} />
      )}

      {/* Priority 6: Activity calendar */}
      <DashboardActivityCalendar activityDays={activityDays} today={today} />
    </div>
  );
}
