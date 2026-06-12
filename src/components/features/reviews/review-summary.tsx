"use client";

import type { ReviewSummaryViewModel } from "@/lib/presentation/reviews/review-view-model";
import { BookOpen, Clock, CheckCircle2, CalendarClock, AlertTriangle } from "lucide-react";

type Props = { summary: ReviewSummaryViewModel };

export function ReviewSummary({ summary }: Props) {
  const { dueToday, overdue, completedToday, upcoming, durationFormatted } = summary;

  return (
    <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Resumo de revisões">
      <MetricCard
        icon={<BookOpen className="h-4 w-4" aria-hidden />}
        label="Devidas hoje"
        value={String(dueToday)}
        color={dueToday > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}
      />
      <MetricCard
        icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        label="Atrasadas"
        value={String(overdue)}
        color={overdue > 0 ? "text-destructive" : "text-muted-foreground"}
      />
      <MetricCard
        icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
        label="Concluídas hoje"
        value={String(completedToday)}
        color={
          completedToday > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        }
      />
      <MetricCard
        icon={<CalendarClock className="h-4 w-4" aria-hidden />}
        label="Próximas"
        value={String(upcoming)}
        color="text-muted-foreground"
      />
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
    <div className="bg-card flex min-h-16 items-center gap-2 rounded-lg border px-3 py-2.5">
      <span className={color}>{icon}</span>
      <div className="min-w-0">
        <dd className="text-foreground text-sm font-semibold">{value}</dd>
        <dt className="text-muted-foreground truncate text-xs">{label}</dt>
      </div>
    </div>
  );
}
