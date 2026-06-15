"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Layers3,
  Percent,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatistics } from "@/hooks/use-statistics";
import { cn } from "@/lib/utils";
import type {
  StatisticsMetric,
  StatisticsPeriod,
  StatisticsViewModel,
} from "@/lib/presentation/statistics/statistics-view-model";

const PERIODS: Array<{ id: StatisticsPeriod; label: string }> = [
  { id: "7d", label: "1 semana" },
  { id: "14d", label: "2 semanas" },
  { id: "28d", label: "4 semanas" },
  { id: "all", label: "Todo período" },
];

const METRIC_ICONS = {
  time: Clock3,
  sessions: Waves,
  adherence: CheckCircle2,
  accuracy: Percent,
  flashcards: Layers3,
};

const METRIC_COLORS = {
  time: "text-primary",
  sessions: "text-info",
  adherence: "text-success",
  accuracy: "text-warning",
  flashcards: "text-success",
};

const CATEGORY_COLORS: Record<string, string> = {
  algo: "bg-primary",
  js: "bg-warning",
  fe_coding: "bg-info",
  system: "bg-brand-purple",
  behavioral: "bg-success",
  mock: "bg-orange-400",
  english: "bg-cyan-400",
};

function StatisticsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando estatísticas">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function MetricCard({ metric }: { metric: StatisticsMetric }) {
  const Icon = METRIC_ICONS[metric.id];
  const positive = metric.comparison !== null && metric.comparison >= 0;

  return (
    <Card className="min-h-32">
      <CardContent className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
              {metric.label}
            </p>
            <p
              className={cn(
                "mt-2 font-mono text-2xl font-bold tracking-tight",
                metric.hasData ? METRIC_COLORS[metric.id] : "text-muted",
              )}
            >
              {metric.value}
            </p>
          </div>
          <Icon className={cn("size-5", METRIC_COLORS[metric.id])} aria-hidden />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {metric.comparison === null ? (
            <span className="text-muted">Sem comparação anterior</span>
          ) : (
            <>
              {positive ? (
                <TrendingUp className="text-success size-3.5" aria-hidden />
              ) : (
                <TrendingDown className="text-danger size-3.5" aria-hidden />
              )}
              <span className={positive ? "text-success" : "text-danger"}>
                {positive ? "+" : ""}
                {metric.comparison}%
              </span>
              <span className="text-muted">vs. período anterior</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StudyMinutesChart({ vm }: { vm: StatisticsViewModel }) {
  const maximum = Math.max(
    1,
    ...vm.weeks.flatMap((week) => [week.plannedMinutes, week.actualMinutes]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minutos estudados por semana</CardTitle>
        <p className="text-muted text-xs">Planejado nas sessões vs. realizado</p>
      </CardHeader>
      <CardContent>
        {vm.weeks.length === 0 ? (
          <p className="text-muted py-20 text-center text-sm">Nenhuma sessão no período.</p>
        ) : (
          <>
            <div className="flex h-40 items-end gap-3" aria-label="Gráfico de minutos por semana">
              {vm.weeks.map((week) => (
                <div key={week.weekStart} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <div className="flex h-32 items-end justify-center gap-1">
                    <div
                      className="bg-surface-muted w-full max-w-10 rounded-t"
                      style={{ height: `${Math.max(4, (week.plannedMinutes / maximum) * 100)}%` }}
                      title={`${week.plannedMinutes} minutos planejados`}
                    />
                    <div
                      className="bg-primary w-full max-w-10 rounded-t"
                      style={{ height: `${Math.max(4, (week.actualMinutes / maximum) * 100)}%` }}
                      title={`${week.actualMinutes} minutos realizados`}
                    />
                  </div>
                  <span className="text-muted mt-2 truncate text-center text-[10px]">
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-muted mt-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="bg-surface-muted size-2.5 rounded-sm" /> Planejado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-primary size-2.5 rounded-sm" /> Realizado
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReadinessChart({ vm }: { vm: StatisticsViewModel }) {
  const hasScores = vm.readiness.some((point) => point.value !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do readiness</CardTitle>
        <p className="text-muted text-xs">Pontuação acumulada nas últimas semanas</p>
      </CardHeader>
      <CardContent>
        {!hasScores ? (
          <p className="text-muted py-20 text-center text-sm">
            Ainda não há evidências suficientes para calcular readiness.
          </p>
        ) : (
          <div className="flex h-44 items-end gap-2" aria-label="Evolução do readiness">
            {vm.readiness.map((point, index) => (
              <div key={point.weekStart} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <span className="text-primary mb-1 text-center font-mono text-xs font-semibold">
                  {point.value ?? "—"}
                </span>
                <div
                  className={cn(
                    "bg-primary/50 min-h-1 rounded-t",
                    index === vm.readiness.length - 1 && "bg-primary",
                  )}
                  style={{ height: `${point.value ?? 2}%` }}
                />
                <span className="text-muted mt-2 truncate text-center text-[10px]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryDistribution({ vm }: { vm: StatisticsViewModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição do tempo por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {vm.categories.length === 0 ? (
          <p className="text-muted py-20 text-center text-sm">Nenhum tempo categorizado.</p>
        ) : (
          <div className="space-y-4">
            {vm.categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-[110px_1fr_62px] items-center gap-3 text-xs"
              >
                <span className="text-text-secondary truncate">{category.label}</span>
                <div className="bg-surface-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className={cn("h-full rounded-full", CATEGORY_COLORS[category.id])}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="text-muted text-right font-mono">
                  {Math.round(category.seconds / 60)}min
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopicCoverage({ vm }: { vm: StatisticsViewModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobertura dos tópicos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vm.coverage.map((item) => {
          const color =
            item.percentage >= 70
              ? "bg-success"
              : item.percentage >= 45
                ? "bg-warning"
                : "bg-danger";
          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-text-secondary">{item.label}</span>
                <span className={cn("font-mono font-semibold", color.replace("bg-", "text-"))}>
                  {item.covered}/{item.total}
                </span>
              </div>
              <div className="bg-surface-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className={cn("h-full rounded-full", color)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SessionsTable({ vm }: { vm: StatisticsViewModel }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Histórico de sessões</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {vm.sessions.length === 0 ? (
          <p className="text-muted py-12 text-center text-sm">Nenhuma sessão neste período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="text-muted border-b text-[10px] tracking-wider uppercase">
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Tópico</th>
                  <th className="px-4 py-3 font-semibold">Atividade</th>
                  <th className="px-4 py-3 font-semibold">Duração</th>
                  <th className="px-4 py-3 font-semibold">Foco</th>
                </tr>
              </thead>
              <tbody>
                {vm.sessions.map((session) => (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="text-muted px-4 py-3">{session.date}</td>
                    <td className="px-4 py-3">
                      <span className="bg-surface-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            CATEGORY_COLORS[session.category] ?? "bg-muted",
                          )}
                        />
                        {session.categoryLabel}
                      </span>
                    </td>
                    <td className="text-text-primary max-w-64 truncate px-4 py-3 font-medium">
                      {session.title}
                    </td>
                    <td className="text-muted px-4 py-3">{session.activity}</td>
                    <td className="text-text-secondary px-4 py-3 font-mono">{session.duration}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 font-medium",
                          session.focus === "Excelente"
                            ? "bg-success-subtle text-success"
                            : session.focus === "Bom"
                              ? "bg-primary-subtle text-primary"
                              : "bg-surface-muted text-muted",
                        )}
                      >
                        {session.focus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatisticsScreen() {
  const { period, setPeriod, state, refresh } = useStatistics();

  return (
    <PageContainer className="max-w-[1440px]">
      {state.status === "loading" && <StatisticsSkeleton />}
      {state.status === "error" && (
        <ErrorState description={state.error.message} onRetry={refresh} />
      )}
      {state.status === "ready" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Estatísticas detalhadas</h2>
              <p className="text-muted mt-1 text-sm">
                Dados reais de estudo no período de {state.viewModel.periodLabel.toLowerCase()}.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label="Período das estatísticas">
              {PERIODS.map((item) => (
                <Button
                  key={item.id}
                  variant={period === item.id ? "outline" : "secondary"}
                  size="sm"
                  aria-pressed={period === item.id}
                  onClick={() => setPeriod(item.id)}
                  className={cn(period === item.id && "bg-primary-subtle")}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {!state.viewModel.hasActivity ? (
            <EmptyState
              icon={<BarChart3 className="size-9" />}
              title="Ainda não há atividade neste período"
              description="Sessões de foco, quizzes, flashcards e progresso do plano aparecerão aqui."
            />
          ) : (
            <>
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Resumo">
                {state.viewModel.metrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </section>
              <section className="grid gap-4 lg:grid-cols-2" aria-label="Gráficos">
                <StudyMinutesChart vm={state.viewModel} />
                <ReadinessChart vm={state.viewModel} />
                <CategoryDistribution vm={state.viewModel} />
                <TopicCoverage vm={state.viewModel} />
              </section>
              <SessionsTable vm={state.viewModel} />
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}
