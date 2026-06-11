"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { formatMinutes } from "@/components/features/plan/plan-utils";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";

type Props = {
  upcomingItems: EffectiveScheduledBlock[];
};

export function DashboardUpcoming({ upcomingItems }: Props) {
  if (upcomingItems.length === 0) return null;

  return (
    <section aria-labelledby="upcoming-heading" className="space-y-2">
      <h2 id="upcoming-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Próximos
      </h2>
      <Card>
        <CardContent className="pt-4 pb-4 space-y-2">
          {upcomingItems.map((item) => (
            <div
              key={item.blockId}
              className="flex items-start gap-2 rounded-md bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="flex items-center gap-1.5">
                  <CategoryBadge category={item.category} />
                  <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatMinutes(item.estimatedMinutes)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Link
            href="/plano"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-1 w-full justify-center")}
          >
            Ver plano completo
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
