"use client";

import type { PlanCompletionSummary, CurrentStudyState } from "@/lib/domain/progress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type PlanSummaryProps = {
  summary: PlanCompletionSummary;
  currentStudyState: CurrentStudyState;
};

export function PlanSummary({ summary, currentStudyState }: PlanSummaryProps) {
  const { overdueItems, isPlanCompleted } = currentStudyState;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Progresso geral</h2>
        <span className="text-muted-foreground text-xs">
          {summary.completionPercentage}% concluído
        </span>
      </div>

      <Progress
        value={summary.completionPercentage}
        aria-label={`${summary.completionPercentage}% do plano concluído`}
        className="mb-4 h-2"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatBadge
          label="Concluídos"
          count={summary.completed}
          total={summary.total}
          variant="default"
        />
        <StatBadge label="Em andamento" count={summary.inProgress} variant="secondary" />
        <StatBadge label="Pendentes" count={summary.pending} variant="outline" />
        <StatBadge label="Travados" count={summary.stuck} variant="destructive" />
        <StatBadge label="Pulados" count={summary.skipped} variant="secondary" />
        <StatBadge
          label="Atrasados"
          count={overdueItems.length}
          variant={overdueItems.length > 0 ? "destructive" : "outline"}
        />
      </div>

      {!isPlanCompleted && overdueItems.length > 0 && (
        <p className="text-destructive mt-3 text-xs" role="alert">
          Você possui {overdueItems.length} conteúdo{overdueItems.length > 1 ? "s" : ""} atrasado
          {overdueItems.length > 1 ? "s" : ""}.
        </p>
      )}

      {summary.skipped > 0 && (
        <p className="text-muted-foreground mt-1 text-xs">
          Resolução (concluído + pulado): {summary.resolutionPercentage}%{" "}
          <span className="text-xs opacity-70">— pulado não conta como concluído</span>
        </p>
      )}
    </div>
  );
}

type StatBadgeProps = {
  label: string;
  count: number;
  total?: number;
  variant: "default" | "secondary" | "outline" | "destructive";
};

function StatBadge({ label, count, total, variant }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border p-2 text-center">
      <span className="text-foreground text-base font-bold tabular-nums">
        {count}
        {total !== undefined && (
          <span className="text-muted-foreground text-xs font-normal"> /{total}</span>
        )}
      </span>
      <Badge variant={variant} className="text-[10px]">
        {label}
      </Badge>
    </div>
  );
}
