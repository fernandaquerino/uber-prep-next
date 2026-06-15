"use client";

import type { WeekStats } from "@/lib/presentation/plan-view-models";
import { CalendarIcon, CheckCircle2Icon, AlertTriangleIcon, ActivityIcon } from "lucide-react";
import { formatMinutes } from "./plan-utils";
import { cn } from "@/lib/utils";

type PlanSummaryProps = {
  stats: WeekStats;
};

export function PlanSummary({ stats }: PlanSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<CalendarIcon className="h-4 w-4" aria-hidden />}
        value={formatMinutes(stats.plannedMinutes)}
        label="Planejado"
        tone="neutral"
      />
      <StatCard
        icon={<CheckCircle2Icon className="h-4 w-4" aria-hidden />}
        value={formatMinutes(stats.completedMinutes)}
        label="Concluído"
        tone="success"
      />
      <StatCard
        icon={<AlertTriangleIcon className="h-4 w-4" aria-hidden />}
        value={`${stats.overdueCount} ${stats.overdueCount === 1 ? "bloco" : "blocos"}`}
        label="Atrasado"
        tone={stats.overdueCount > 0 ? "danger" : "neutral"}
      />
      <StatCard
        icon={<ActivityIcon className="h-4 w-4" aria-hidden />}
        value={stats.adherencePercent === null ? "—" : `${stats.adherencePercent}%`}
        label="Aderência"
        tone="neutral"
      />
    </div>
  );
}

type Tone = "neutral" | "success" | "danger";

const TONE_VALUE: Record<Tone, string> = {
  neutral: "text-text-primary",
  success: "text-success",
  danger: "text-danger",
};

const TONE_ICON: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-success-subtle text-success",
  danger: "bg-danger-subtle text-danger",
};

type StatCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: Tone;
};

function StatCard({ icon, value, label, tone }: StatCardProps) {
  return (
    <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-4">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          TONE_ICON[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className={cn("truncate text-lg leading-tight font-bold tabular-nums", TONE_VALUE[tone])}>
          {value}
        </p>
        <p className="text-muted text-xs">{label}</p>
      </div>
    </div>
  );
}
