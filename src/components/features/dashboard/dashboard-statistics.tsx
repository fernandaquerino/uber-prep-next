"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSnapshot } from "@/lib/domain/analytics";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

export function DashboardStatistics({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <section aria-labelledby="statistics-heading">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle id="statistics-heading" className="flex items-center gap-2 text-sm">
            <BarChart3 className="size-4" aria-hidden />
            Estatísticas consolidadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {analytics.moduleMetrics.map((metric) => (
              <div key={metric.id} className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-[11px]">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold">{metric.value}</p>
                <p className="text-muted-foreground mt-1 text-[10px]">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 border-t pt-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium">Tempo real por área</p>
              {analytics.timeByCategory.length === 0 ? (
                <p className="text-muted-foreground text-xs">Nenhuma sessão oficial registrada.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.timeByCategory.map((item) => (
                    <div key={item.category} className="flex justify-between text-xs">
                      <span>{item.category}</span>
                      <span className="font-medium">{formatDuration(item.seconds)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium">Evolução semanal</p>
              {analytics.weeklyEvolution.length === 0 ? (
                <p className="text-muted-foreground text-xs">Ainda não há histórico suficiente.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.weeklyEvolution.slice(-4).map((point) => (
                    <div key={point.weekStart} className="grid grid-cols-3 gap-2 text-xs">
                      <span>{point.weekStart}</span>
                      <span>{point.evidenceCount} evidências</span>
                      <span className="text-right">
                        {point.successRate === null
                          ? "Sem avaliação"
                          : `${Math.round(point.successRate * 100)}% sucesso`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-muted-foreground border-t pt-3 text-xs">
            Retenção:{" "}
            {analytics.retention === null ? "dados insuficientes" : `${analytics.retention}%`}.
            Ausência de dados nunca é exibida como desempenho zero.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
