"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, BarChart3, Download, FileText, Printer, RefreshCw, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeeklyReports } from "@/hooks/use-weekly-reports";
import {
  buildWeeklyReportMarkdown,
  type WeeklyReport,
  type WeeklyReportReflection,
} from "@/lib/domain/reports";
import {
  deleteWeeklyReportSnapshot,
  saveReportReflection,
  saveWeeklyReportSnapshot,
} from "@/lib/application/reports/report-use-cases";
import { SKILL_AREAS } from "@/lib/data/skill-topics";
import { ReportReflectionEditor } from "./report-reflection-editor";
import type { UberPrepDatabase } from "@/lib/db/schema";

function duration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}min` : `${minutes}min`;
}

function delta(value: number, suffix = ""): string {
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function downloadMarkdown(report: WeeklyReport) {
  const blob = new Blob([buildWeeklyReportMarkdown(report)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `uber-prep-semana-${report.weekNumber}-${report.weekStart}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {detail && <p className="text-muted-foreground mt-1 text-xs">{detail}</p>}
    </div>
  );
}

export function ReportsScreen() {
  const { state, setSelectedWeek, refresh } = useWeeklyReports();
  const [source, setSource] = useState<"live" | "snapshot">("live");
  const [busy, setBusy] = useState(false);

  if (state.status === "loading") {
    return (
      <PageContainer>
        <LoadingState label="Consolidando relatório semanal..." />
      </PageContainer>
    );
  }
  if (state.status === "error") {
    return (
      <PageContainer>
        <ErrorState description={state.error.message} onRetry={refresh} />
      </PageContainer>
    );
  }
  if (state.status === "no_start_date") {
    return (
      <PageContainer>
        <PageHeader title="Relatórios" description="Relatórios semanais de progresso." />
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="font-medium">Data de início não configurada.</p>
            <p className="text-muted-foreground text-sm">
              Configure o plano para gerar semanas reais.
            </p>
            <Button render={<Link href="/configuracoes" />}>Configurar data de início</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const { data } = state;
  const report =
    source === "snapshot" && data.snapshot
      ? { ...data.snapshot, reflection: data.liveReport.reflection }
      : data.liveReport;
  const metrics = report.metrics;
  const statusLabel = { current: "Semana atual", past: "Semana encerrada", future: "Planejada" }[
    report.status
  ];

  async function withDb(action: (db: UberPrepDatabase) => Promise<void>) {
    setBusy(true);
    try {
      const { getDb } = await import("@/lib/db/db");
      await action(getDb());
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <div className="weekly-report">
        <PageHeader
          title="Relatórios"
          description="Métricas reais da agenda, evidências consolidadas e reflexão semanal."
          actions={
            <div className="no-print flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadMarkdown(report)}>
                <Download aria-hidden /> Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer aria-hidden /> PDF / Imprimir
              </Button>
            </div>
          }
        />

        <div className="no-print mb-4 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            Semana
            <select
              className="bg-background rounded-md border px-3 py-2"
              value={data.selectedWeekNumber}
              onChange={(event) => {
                setSource("live");
                setSelectedWeek(Number(event.target.value));
              }}
            >
              {data.weeks.map((week) => (
                <option key={week.weekNumber} value={week.weekNumber}>
                  Semana {week.weekNumber} · {week.weekStart} a {week.weekEnd}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {data.snapshot && (
              <Button
                size="sm"
                variant={source === "snapshot" ? "default" : "outline"}
                onClick={() => setSource(source === "snapshot" ? "live" : "snapshot")}
              >
                <Archive aria-hidden />
                {source === "snapshot" ? "Usar dados ao vivo" : "Ver snapshot"}
              </Button>
            )}
            {data.snapshot ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void withDb((db) => deleteWeeklyReportSnapshot(db, data.selectedWeekNumber))
                }
              >
                <Trash2 aria-hidden /> Excluir snapshot
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={busy || report.status === "future"}
                onClick={() => void withDb((db) => saveWeeklyReportSnapshot(db, data.liveReport))}
              >
                <Archive aria-hidden /> Salvar snapshot
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={refresh}>
              <RefreshCw aria-hidden /> Atualizar
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{statusLabel}</Badge>
          <span className="text-muted-foreground text-sm">
            Semana {report.weekNumber} · {report.weekStart} a {report.weekEnd}
          </span>
          {source === "snapshot" && <Badge variant="secondary">Snapshot congelado</Badge>}
        </div>

        {report.status === "future" && report.isEmpty && (
          <Card className="mb-4">
            <CardContent className="py-6">
              <p className="font-medium">Semana futura planejada</p>
              <p className="text-muted-foreground text-sm">
                A carga planejada aparece abaixo; métricas de execução aguardam atividade real.
              </p>
            </CardContent>
          </Card>
        )}

        <section className="report-section mb-4" aria-labelledby="report-summary-heading">
          <h2 id="report-summary-heading" className="sr-only">
            Resumo da semana
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric
              label="Blocos"
              value={`${metrics.completedBlocks}/${metrics.plannedBlocks}`}
              detail={`${metrics.overdueBlocks} atrasado${metrics.overdueBlocks === 1 ? "" : "s"}`}
            />
            <Metric
              label="Tempo"
              value={duration(metrics.actualSeconds)}
              detail={`${duration(metrics.plannedMinutes * 60)} planejado`}
            />
            <Metric
              label="Quiz accuracy"
              value={metrics.quizAccuracy === null ? "Sem dados" : `${metrics.quizAccuracy}%`}
              detail={`${metrics.quizAnswers} resposta${metrics.quizAnswers === 1 ? "" : "s"}`}
            />
            <Metric
              label="Readiness"
              value={
                report.readiness.score === null
                  ? "Dados insuficientes"
                  : `${report.readiness.score}/100`
              }
              detail={`Confiança: ${report.readiness.confidence}`}
            />
          </div>
        </section>

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card className="report-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 aria-hidden /> Atividade por módulo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Revisões" value={String(metrics.completedReviews)} />
              <Metric label="Flashcards" value={String(metrics.flashcardsReviewed)} />
              <Metric label="Mocks" value={String(metrics.mocksCompleted)} />
              <Metric label="Playground" value={String(metrics.playgroundPractices)} />
              <Metric label="Recursos" value={String(metrics.resourcesStudied)} />
              <Metric label="Inglês" value={String(metrics.englishPractices)} />
              <Metric label="Notas" value={String(metrics.notesUpdated)} />
              <Metric label="Evidências" value={String(metrics.evidenceCount)} />
            </CardContent>
          </Card>

          <Card className="report-section">
            <CardHeader>
              <CardTitle>Tempo por categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.timerByCategory.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma sessão oficial na semana.</p>
              ) : (
                report.timerByCategory.map((item) => (
                  <div key={item.category} className="flex justify-between text-sm">
                    <span>
                      {SKILL_AREAS.find((area) => area.id === item.category)?.label ??
                        item.category}
                    </span>
                    <strong>{duration(item.seconds)}</strong>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {report.comparison && (
          <Card className="report-section mb-4">
            <CardHeader>
              <CardTitle>Comparação com a Semana {report.comparison.previousWeekNumber}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric
                label="Blocos concluídos"
                value={delta(report.comparison.completedBlocksDelta)}
              />
              <Metric
                label="Tempo real"
                value={duration(Math.abs(report.comparison.actualSecondsDelta))}
                detail={report.comparison.actualSecondsDelta >= 0 ? "a mais" : "a menos"}
              />
              <Metric
                label="Quiz accuracy"
                value={
                  report.comparison.quizAccuracyDelta === null
                    ? "Sem comparação"
                    : delta(report.comparison.quizAccuracyDelta, " p.p.")
                }
              />
              <Metric
                label="Readiness"
                value={
                  report.comparison.readinessDelta === null
                    ? "Sem comparação"
                    : delta(report.comparison.readinessDelta, " pts")
                }
              />
              <Metric label="Evidências" value={delta(report.comparison.evidenceDelta)} />
            </CardContent>
          </Card>
        )}

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card className="report-section">
            <CardHeader>
              <CardTitle>Tópicos fortes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.strengths.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Ainda não há evidências consistentes.
                </p>
              ) : (
                report.strengths.map((skill) => (
                  <div key={skill.topicId}>
                    <p className="font-medium">{skill.label}</p>
                    <p className="text-muted-foreground text-sm">{skill.explanation}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="report-section">
            <CardHeader>
              <CardTitle>Tópicos de risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.risks.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum risco consolidado.</p>
              ) : (
                report.risks.slice(0, 5).map((risk) => (
                  <div key={risk.topicId}>
                    <p className="font-medium">{risk.label}</p>
                    <p className="text-muted-foreground text-sm">{risk.reasons.join("; ")}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="report-section mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText aria-hidden /> Próximos passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.recommendations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Manter o plano atual.</p>
            ) : (
              report.recommendations.map((item) => (
                <div key={item.id}>
                  <Link className="font-medium underline-offset-4 hover:underline" href={item.href}>
                    {item.title}
                  </Link>
                  <p className="text-muted-foreground text-sm">{item.reason}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="report-section">
          <CardContent className="py-4">
            <ReportReflectionEditor
              key={`${report.weekNumber}:${source}:${report.reflection.updatedAt ?? "new"}`}
              value={report.reflection}
              onSave={async (reflection: WeeklyReportReflection) => {
                await withDb((db) => saveReportReflection(db, data.selectedWeekNumber, reflection));
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
