"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { AnalyticsSnapshot } from "@/lib/domain/analytics";
import { cn } from "@/lib/utils";

export function DashboardRiskTopics({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="size-4" aria-hidden />
            Tópicos de risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.risks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum risco sustentado por evidências foi identificado.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.risks.slice(0, 5).map((risk) => (
                <article
                  key={risk.topicId}
                  className="rounded-lg border border-red-200 p-3 dark:border-red-900"
                >
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-medium">{risk.label}</p>
                    <span className="text-xs font-semibold text-red-600">{risk.score}/100</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{risk.reasons.join(" · ")}</p>
                  <p className="mt-2 text-xs font-medium">{risk.recommendedAction}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4" aria-hidden />
            Próximas ações explicáveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.recommendations.map((recommendation) => (
            <article key={recommendation.id} className="bg-muted/40 rounded-lg p-3">
              <p className="text-sm font-medium">{recommendation.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{recommendation.reason}</p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                Impacto: {recommendation.impact}
              </p>
              <Link
                href={recommendation.href}
                className={cn(buttonVariants({ variant: "link", size: "sm" }), "mt-1 h-auto p-0")}
              >
                {recommendation.actionLabel}
              </Link>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
