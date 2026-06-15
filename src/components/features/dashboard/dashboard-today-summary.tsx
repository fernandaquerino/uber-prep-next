"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardTodaySummaryViewModel } from "@/lib/presentation/dashboard/dashboard-view-model";

export function DashboardTodaySummary({
  todaySummary,
}: {
  todaySummary: DashboardTodaySummaryViewModel;
}) {
  const { studiedMinutes, goalMinutes, reviewsPending, questionsAnswered, flashcardsReviewed } =
    todaySummary;

  const studiedPct =
    goalMinutes > 0 ? Math.min(100, Math.round((studiedMinutes / goalMinutes) * 100)) : null;

  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold">Resumo de hoje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryRow label="Estudado" value={String(studiedMinutes)} unit={goalMinutes > 0 ? `/ ${goalMinutes}min` : "min"}>
          {studiedPct != null && <Progress value={studiedPct} className="mt-1.5 h-[3px]" />}
        </SummaryRow>

        <SummaryRow label="Revisões" value={String(reviewsPending)} unit="pendentes" warn={reviewsPending > 0} />
        <SummaryRow label="Questões" value={String(questionsAnswered)} unit="respondidas" />
        <SummaryRow label="Flashcards" value={String(flashcardsReviewed)} unit="revisados" />
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  unit,
  warn,
  children,
}: {
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-text-secondary text-xs">{label}</span>
        <span
          className={cn(
            "font-mono text-[13px] font-bold",
            warn ? "text-danger" : "text-text-primary",
          )}
        >
          {value}
          <span className="text-text-muted ml-1 text-[10px] font-normal">{unit}</span>
        </span>
      </div>
      {children}
    </div>
  );
}
