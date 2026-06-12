"use client";

import { Info, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsSnapshot, ReadinessScore } from "@/lib/domain/analytics";

const CONFIDENCE_LABELS: Record<ReadinessScore["confidence"], string> = {
  insufficient_data: "Dados insuficientes",
  low: "Baixa confiança",
  medium: "Confiança média",
  high: "Alta confiança",
};

function ReadinessValue({ readiness }: { readiness: ReadinessScore }) {
  if (readiness.score === null) {
    return (
      <div className="rounded-lg border border-dashed p-4">
        <p className="font-medium">Dados insuficientes para calcular readiness.</p>
        <p className="text-muted-foreground mt-1 text-xs">{readiness.reasons[0]}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <p>
          <span className="text-3xl font-bold tabular-nums">{readiness.score}</span>
          <span className="text-muted-foreground">/100</span>
        </p>
        <span className="text-muted-foreground text-xs">
          {CONFIDENCE_LABELS[readiness.confidence]}
        </span>
      </div>
      <Progress value={readiness.score} aria-label={`Readiness ${readiness.score} de 100`} />
    </div>
  );
}

export function DashboardReadiness({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <section aria-labelledby="readiness-heading">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle id="readiness-heading" className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4" aria-hidden />
            Readiness explicável
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ReadinessValue readiness={analytics.readiness} />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.readinessByArea.map(({ area, label, readiness }) => (
              <div key={area} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium">{label}</p>
                  <span className="text-xs font-semibold tabular-nums">
                    {readiness.score === null ? "Sem dados" : `${readiness.score}/100`}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {readiness.evidenceCount} evidências · {readiness.sourceCount} fontes
                </p>
              </div>
            ))}
          </div>

          <details className="rounded-lg border p-3 text-xs">
            <summary className="flex cursor-pointer items-center gap-2 font-medium">
              <Info className="size-3.5" aria-hidden />
              Como a pontuação foi calculada
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {analytics.readiness.factors.map((factor) => (
                <div key={factor.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {factor.label} ({Math.round(factor.weight * 100)}%)
                  </span>
                  <span>{factor.score === null ? "Sem evidência" : `${factor.score}/100`}</span>
                </div>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>
    </section>
  );
}
