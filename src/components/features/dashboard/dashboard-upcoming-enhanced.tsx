"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { cn } from "@/lib/utils";
import type { DashboardUpcomingItemViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  upcoming: DashboardUpcomingItemViewModel[];
};

export function DashboardUpcomingEnhanced({ upcoming }: Props) {
  if (upcoming.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="upcoming-heading">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium" id="upcoming-heading">
            Próximos estudos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-3">
          {upcoming.map((item) => (
            <div
              key={item.blockId}
              className="hover:bg-muted/40 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="line-clamp-2 text-sm leading-snug font-medium">{item.title}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={item.category} />
                  <span className="text-muted-foreground text-xs">{item.typeLabel}</span>
                  <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                    <Clock className="h-3 w-3" aria-hidden />
                    {item.durationFormatted}
                  </span>
                  {item.isOverdue && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Atrasado
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px]">{item.scheduledDateFormatted}</p>
              </div>
            </div>
          ))}

          <div className="mt-2 border-t pt-1">
            <Link
              href="/plano"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full justify-center text-xs",
              )}
            >
              Ver plano completo
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
