"use client";

import { Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSnapshot } from "@/lib/domain/analytics";
import { cn } from "@/lib/utils";

function intensity(value: number | null): string {
  if (value === null) return "bg-muted text-muted-foreground";
  if (value < 40) return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300";
  if (value < 60) return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300";
  if (value < 80)
    return "bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-200";
  return "bg-emerald-600 text-white";
}

export function DashboardKnowledgeHeatmap({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <section aria-labelledby="knowledge-heading">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle id="knowledge-heading" className="flex items-center gap-2 text-sm">
            <Grid3X3 className="size-4" aria-hidden />
            Heatmap de conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="list">
            {analytics.skills.map((skill) => (
              <div
                key={skill.topicId}
                role="listitem"
                className={cn("min-h-20 rounded-lg p-2.5", intensity(skill.knowledge))}
                title={skill.explanation}
              >
                <p className="text-xs font-semibold">{skill.label}</p>
                <p className="mt-1 text-[11px]">
                  {skill.knowledge === null
                    ? "Evidências insuficientes"
                    : `Conhecimento ${skill.knowledge}%`}
                </p>
                <p className="mt-1 text-[10px] opacity-80">
                  Retenção {skill.retention === null ? "sem dados" : `${skill.retention}%`}
                </p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-[11px]">
            A cor combina resultados avaliados e retenção. Atividade isolada não equivale a domínio.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
