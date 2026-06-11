"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardPriorityViewModel, PrioritySeverity } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  priorities: DashboardPriorityViewModel[];
};

const SEVERITY_STYLES: Record<PrioritySeverity, {
  bar: string;
  icon: React.ReactNode;
  title: string;
}> = {
  high: {
    bar: "bg-red-500",
    icon: <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden />,
    title: "font-semibold text-red-800 dark:text-red-300",
  },
  medium: {
    bar: "bg-amber-500",
    icon: <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden />,
    title: "font-semibold text-amber-800 dark:text-amber-300",
  },
  positive: {
    bar: "bg-green-500",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden />,
    title: "font-semibold text-green-800 dark:text-green-300",
  },
};

export function DashboardPriorities({ priorities }: Props) {
  if (priorities.length === 0) return null;

  const onlyPositive = priorities.every((p) => p.severity === "positive");

  if (onlyPositive) {
    const p = priorities[0];
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-4 py-2.5 text-sm dark:border-green-900 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" aria-hidden />
        <span className="font-medium text-green-800 dark:text-green-300">{p.title}</span>
        <span className="text-muted-foreground">— {p.description}</span>
      </div>
    );
  }

  return (
    <section aria-labelledby="priorities-heading" className="space-y-2">
      <h2 id="priorities-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Prioridades
      </h2>
      <div className="flex flex-col gap-2">
        {priorities.map((p) => {
          const styles = SEVERITY_STYLES[p.severity];
          return (
            <div
              key={p.id}
              className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3"
            >
              <div className={cn("mt-1 w-1 self-stretch rounded-full shrink-0", styles.bar)} aria-hidden />
              {styles.icon}
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-snug", styles.title)}>{p.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{p.description}</p>
              </div>
              <Link
                href={p.actionHref}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0 text-xs")}
              >
                {p.actionLabel}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
