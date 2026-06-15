"use client";

import Link from "next/link";
import { ArrowRight, Check, Moon, Play } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import type { DashboardTodayPlanViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

export function DashboardTodayPlan({ todayPlan }: { todayPlan: DashboardTodayPlanViewModel }) {
  const { items, completed, total, plannedMinutesFormatted, isRestDay } = todayPlan;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* Header */}
      <div className="border-border flex items-center justify-between gap-2 border-b px-5 py-3.5">
        <div>
          <p className="text-text-primary text-[15px] font-bold">Plano de hoje</p>
          <p className="text-text-muted mt-0.5 text-[11px]">
            {isRestDay
              ? "Dia de descanso"
              : `${completed} de ${total} blocos concluídos · ${plannedMinutesFormatted} planejados`}
          </p>
        </div>
        <Link
          href="/plano"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-text-muted")}
        >
          Ver plano completo
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {/* Rows */}
      {isRestDay ? (
        <div className="text-text-muted flex items-center gap-3 px-5 py-6">
          <Moon className="h-8 w-8 shrink-0 text-slate-400" aria-hidden />
          <p className="text-sm">Aproveite para recuperar energia.</p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-text-muted px-5 py-6 text-sm">Nenhum bloco agendado para hoje.</p>
      ) : (
        items.map((item) => {
          const visual = getCategoryVisual(item.category);
          const isDone = item.executionStatus === "completed";
          const dotColor = isDone ? "bg-success" : item.isCurrent ? "bg-primary" : visual.dot;

          return (
            <div
              key={item.blockId}
              className={cn(
                "flex items-center gap-3 border-l-[3px] px-5 py-2.5",
                item.isCurrent
                  ? "border-l-primary bg-primary-subtle"
                  : "border-l-transparent",
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} aria-hidden />

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-[13px]",
                    item.isCurrent ? "font-semibold" : "font-medium",
                    isDone ? "text-text-muted line-through" : "text-text-primary",
                  )}
                >
                  {item.title}
                </p>
                <div className="text-text-muted mt-0.5 flex items-center gap-1.5 text-[11px]">
                  <span className={cn("font-medium", visual.text)}>{item.categoryLabel}</span>
                  <span>·</span>
                  <span>{item.typeLabel}</span>
                  <span>·</span>
                  <span className="font-mono">{item.durationFormatted}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.startTime && (
                  <span className="text-text-muted font-mono text-[10px] tabular-nums">
                    {item.startTime}
                  </span>
                )}

                {isDone ? (
                  <span
                    className="bg-success-subtle text-success flex h-6 w-6 items-center justify-center rounded-full"
                    aria-label="Concluído"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                ) : item.isCurrent ? (
                  <Link href="/plano" className={cn(buttonVariants({ size: "sm" }))}>
                    Iniciar
                  </Link>
                ) : (
                  <Button
                    render={<Link href="/plano" />}
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Iniciar ${item.title}`}
                  >
                    <Play className="h-3 w-3" aria-hidden />
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </Card>
  );
}
