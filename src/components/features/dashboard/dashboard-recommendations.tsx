"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardRecommendation } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  recommendations: DashboardRecommendation[];
};

const PRIORITY_STYLES = {
  high: {
    card: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
    icon: <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden />,
    title: "font-semibold text-red-800 dark:text-red-300",
  },
  medium: {
    card: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
    icon: <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />,
    title: "font-semibold text-amber-800 dark:text-amber-300",
  },
  low: {
    card: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />,
    title: "font-semibold text-green-800 dark:text-green-300",
  },
};

export function DashboardRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-heading" className="space-y-2">
      <h2 id="recommendations-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Recomendações
      </h2>
      <div className="flex flex-col gap-2">
        {recommendations.map((rec) => {
          const styles = PRIORITY_STYLES[rec.priority];
          return (
            <Card key={rec.id} className={cn("border", styles.card)}>
              <CardContent className="flex items-start gap-3 pt-4 pb-4">
                <div className="mt-0.5 shrink-0">{styles.icon}</div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className={cn("text-sm leading-snug", styles.title)}>{rec.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{rec.description}</p>
                  {rec.action && (
                    <Link
                      href={rec.action.href}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-1 h-7 px-0 text-xs font-medium")}
                    >
                      {rec.action.label}
                      <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
