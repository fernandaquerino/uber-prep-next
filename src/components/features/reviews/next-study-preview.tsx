"use client";

import type { NextStudyPreviewViewModel } from "@/lib/presentation/reviews/review-view-model";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { ArrowRight, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { preview: NextStudyPreviewViewModel | null };

export function NextStudyPreview({ preview }: Props) {
  if (!preview) {
    return (
      <div className="bg-muted/40 rounded-lg px-4 py-3 text-center text-sm">
        <p className="text-muted-foreground">Plano concluído.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="next-study-heading">
      <div className="mb-2 flex items-center gap-2">
        <CalendarCheck className="text-muted-foreground h-4 w-4" aria-hidden />
        <h2 id="next-study-heading" className="text-sm font-semibold">
          {preview.sectionTitle}
        </h2>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">
            {preview.weekdayLabel}, {preview.dateLabel}
          </p>
          <p className="text-muted-foreground text-xs">{preview.durationFormatted} estimados</p>
        </div>

        <ul className="mb-3 flex flex-col gap-1.5" role="list" aria-label="Itens do próximo estudo">
          {preview.items.slice(0, 5).map((item) => (
            <li key={item.blockId} className="flex items-center gap-2 text-sm">
              <CategoryBadge category={item.category} />
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {item.durationFormatted}
              </span>
            </li>
          ))}
          {preview.items.length > 5 && (
            <li className="text-muted-foreground text-xs">+{preview.items.length - 5} mais</li>
          )}
        </ul>

        <Link
          href="/plano"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}
        >
          Ver no plano
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
