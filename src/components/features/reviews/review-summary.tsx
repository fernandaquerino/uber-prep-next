"use client";

import type { ReviewSummaryViewModel } from "@/lib/presentation/reviews/review-view-model";
import { BookOpen, Clock, CheckCircle2, CalendarClock, AlertTriangle } from "lucide-react";

type Props = { summary: ReviewSummaryViewModel };

export function ReviewSummary({ summary }: Props) {
  const { dueToday, overdue, completedToday, upcoming, durationFormatted } = summary;
  const hasPending = dueToday > 0 || overdue > 0;

  if (!hasPending && completedToday === 0 && upcoming === 0) {
    return (
      <div className="bg-muted/40 flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
        <span className="text-muted-foreground">Nenhuma revisão pendente para hoje.</span>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Resumo de revisões">
      {dueToday > 0 && (
        <MetricCard
          icon={<BookOpen className="h-4 w-4" aria-hidden />}
          label="Devidas hoje"
          value={String(dueToday)}
          color="text-blue-600 dark:text-blue-400"
        />
      )}
      {overdue > 0 && (
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
          label="Atrasadas"
          value={String(overdue)}
          color="text-destructive"
        />
      )}
      {completedToday > 0 && (
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          label="Concluídas hoje"
          value={String(completedToday)}
          color="text-emerald-600 dark:text-emerald-400"
        />
      )}
      {upcoming > 0 && (
        <MetricCard
          icon={<CalendarClock className="h-4 w-4" aria-hidden />}
          label="Próximas"
          value={String(upcoming)}
          color="text-muted-foreground"
        />
      )}
      {summary.estimatedMinutes > 0 && (
        <MetricCard
          icon={<Clock className="h-4 w-4" aria-hidden />}
          label="Estimado"
          value={durationFormatted}
          color="text-muted-foreground"
        />
      )}
    </dl>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card flex items-center gap-2 rounded-lg border px-3 py-2.5">
      <span className={color}>{icon}</span>
      <div className="min-w-0">
        <dd className="text-foreground text-sm font-semibold">{value}</dd>
        <dt className="text-muted-foreground truncate text-xs">{label}</dt>
      </div>
    </div>
  );
}
