"use client";

import type { PlanCompletionSummary, CurrentStudyState } from "@/lib/domain/progress";
import { Progress } from "@/components/ui/progress";

type PlanSummaryProps = {
  summary: PlanCompletionSummary;
  currentStudyState: CurrentStudyState;
};

export function PlanSummary({ summary, currentStudyState }: PlanSummaryProps) {
  const { overdueItems } = currentStudyState;

  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <StatChip
            label="Concluídos"
            value={summary.completed}
            total={summary.total}
            highlight="green"
          />
          {summary.inProgress > 0 && (
            <StatChip label="Em andamento" value={summary.inProgress} highlight="blue" />
          )}
          {summary.stuck > 0 && (
            <StatChip label="Travados" value={summary.stuck} highlight="amber" />
          )}
          {overdueItems.length > 0 && (
            <StatChip label="Atrasados" value={overdueItems.length} highlight="red" />
          )}
          {summary.skipped > 0 && (
            <StatChip label="Pulados" value={summary.skipped} highlight="muted" />
          )}
        </div>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {summary.completionPercentage}%
        </span>
      </div>

      <Progress
        value={summary.completionPercentage}
        aria-label={`${summary.completionPercentage}% do plano concluído`}
        className="h-1.5"
      />
    </div>
  );
}

type Highlight = "green" | "blue" | "amber" | "red" | "muted";

const HIGHLIGHT_CLASSES: Record<Highlight, string> = {
  green: "text-green-700 dark:text-green-400",
  blue: "text-blue-700 dark:text-blue-400",
  amber: "text-amber-700 dark:text-amber-400",
  red: "text-red-700 dark:text-red-400",
  muted: "text-muted-foreground",
};

type StatChipProps = {
  label: string;
  value: number;
  total?: number;
  highlight: Highlight;
};

function StatChip({ label, value, total, highlight }: StatChipProps) {
  return (
    <span className={HIGHLIGHT_CLASSES[highlight]}>
      <span className="font-semibold tabular-nums">{value}</span>
      {total !== undefined && <span className="text-muted-foreground">/{total}</span>} {label}
    </span>
  );
}
