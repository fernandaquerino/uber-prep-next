"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsSnapshot, ReadinessScore } from "@/lib/domain/analytics";

const CONFIDENCE_LABELS: Record<ReadinessScore["confidence"], string> = {
  insufficient_data: "Dados insuficientes",
  low: "Em desenvolvimento",
  medium: "Em desenvolvimento",
  high: "Pronto",
};

function CircularGauge({ value, size = 68 }: { value: number | null; size?: number }) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="text-primary transition-[stroke-dashoffset] duration-500"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <span className="text-primary absolute inset-0 flex items-center justify-center font-mono text-lg font-bold">
        {value ?? "—"}
      </span>
    </div>
  );
}

export function DashboardReadinessCompact({ analytics }: { analytics: AnalyticsSnapshot }) {
  const { readiness, readinessByArea } = analytics;
  const areas = readinessByArea.slice(0, 4);

  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold">Prontidão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3.5">
          <CircularGauge value={readiness.score} />
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-semibold">
              {CONFIDENCE_LABELS[readiness.confidence]}
            </p>
            <p className="text-text-muted mt-0.5 text-xs">
              {readiness.evidenceCount} evidências · {readiness.sourceCount} fontes
            </p>
          </div>
        </div>

        {areas.length > 0 && (
          <div className="space-y-1.5">
            {areas.map(({ area, label, readiness: r }) => (
              <div key={area} className="flex items-center gap-2">
                <span className="text-text-muted w-28 shrink-0 truncate text-[11px]">{label}</span>
                <Progress value={r.score ?? 0} className="h-[3px] flex-1" />
                <span className="text-text-secondary w-6 text-right font-mono text-[11px]">
                  {r.score ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/relatorios"
          className="text-primary flex items-center gap-1 text-[11px] font-medium"
        >
          Como é calculado
          <Info className="h-3 w-3" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
