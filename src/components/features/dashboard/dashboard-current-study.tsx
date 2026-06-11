"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { StatusBadge } from "@/components/features/plan/status-badge";
import { formatMinutes } from "@/components/features/plan/plan-utils";
import type { CurrentStudyState } from "@/lib/domain/progress";

type Props = {
  currentStudyState: CurrentStudyState;
};

export function DashboardCurrentStudy({ currentStudyState }: Props) {
  const { currentItem, lastCompletedItem, isPlanCompleted } = currentStudyState;

  if (isPlanCompleted) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-green-600" aria-hidden />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Plano concluído!</p>
            <p className="text-muted-foreground text-sm">
              Você completou todos os blocos do plano de preparação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
    return (
      <Card>
        <CardContent className="text-muted-foreground pt-6 text-sm">
          Nenhum bloco ativo no momento.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BookOpen className="h-4 w-4 text-blue-600" aria-hidden />
          {currentItem.executionStatus === "in_progress" ? "Em andamento" : "Próximo estudo"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <p className="font-medium leading-snug">{currentItem.title}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={currentItem.category} />
            <StatusBadge status={currentItem.executionStatus} isOverdue={currentItem.isOverdue} />
            <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
              <Clock className="h-3 w-3" aria-hidden />
              {formatMinutes(currentItem.estimatedMinutes)}
            </span>
          </div>
        </div>

        <Link
          href="/plano"
          className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}
        >
          {currentItem.executionStatus === "in_progress" ? "Continuar" : "Iniciar"}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
        </Link>

        {lastCompletedItem && (
          <p className="text-muted-foreground border-t pt-2 text-xs">
            Último concluído:{" "}
            <span className="font-medium text-foreground">{lastCompletedItem.title}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
