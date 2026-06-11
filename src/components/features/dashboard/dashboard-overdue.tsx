"use client";

import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { formatMinutes } from "@/components/features/plan/plan-utils";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";

type Props = {
  overdueItems: EffectiveScheduledBlock[];
};

export function DashboardOverdue({ overdueItems }: Props) {
  if (overdueItems.length === 0) return null;

  return (
    <section aria-labelledby="overdue-heading" className="space-y-2">
      <h2 id="overdue-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Atrasados ({overdueItems.length})
      </h2>
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-4 pb-4 space-y-2">
          {overdueItems.slice(0, 5).map((item) => (
            <div
              key={item.blockId}
              className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="flex items-center gap-1.5">
                  <CategoryBadge category={item.category} />
                  <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatMinutes(item.estimatedMinutes)}
                  </span>
                </div>
              </div>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            </div>
          ))}
          {overdueItems.length > 5 && (
            <p className="text-muted-foreground text-xs pl-3">
              + {overdueItems.length - 5} mais
            </p>
          )}
          <Link
            href="/plano"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1 w-full justify-center")}
          >
            Gerenciar atrasados
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
