"use client";

import { CheckCircle2, Clock, Moon, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  DashboardCurrentWeekViewModel,
  WeekDayStatus,
} from "@/lib/presentation/dashboard/dashboard-view-model";

type Props = {
  currentWeek: DashboardCurrentWeekViewModel;
  weekLabel: string;
};

const STATUS_RING: Record<WeekDayStatus, string> = {
  completed: "ring-2 ring-green-500",
  partial: "ring-2 ring-blue-400",
  pending: "ring-1 ring-border",
  overdue: "ring-2 ring-red-500",
  today: "ring-2 ring-blue-500",
  future: "ring-1 ring-border/60",
  rest: "ring-1 ring-border/40",
};

const STATUS_BG: Record<WeekDayStatus, string> = {
  completed: "bg-green-100 dark:bg-green-900/30",
  partial: "bg-blue-50 dark:bg-blue-900/20",
  pending: "bg-muted/50",
  overdue: "bg-red-50 dark:bg-red-900/20",
  today: "bg-blue-50 dark:bg-blue-900/20",
  future: "bg-muted/20",
  rest: "bg-slate-50 dark:bg-slate-900/20",
};

function DayIcon({ status }: { status: WeekDayStatus }) {
  if (status === "rest") return <Moon className="h-3.5 w-3.5 text-slate-400" aria-hidden />;
  if (status === "completed")
    return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" aria-hidden />;
  if (status === "overdue") return <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden />;
  if (status === "today") return <Clock className="h-3.5 w-3.5 text-blue-500" aria-hidden />;
  return null;
}

export function DashboardWeekDays({ currentWeek, weekLabel }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          Semana atual — {weekLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5" role="list" aria-label="Dias da semana atual">
          {currentWeek.days.map((day) => (
            <div
              key={day.date}
              role="listitem"
              aria-label={day.ariaLabel}
              title={day.ariaLabel}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2",
                STATUS_BG[day.status],
                STATUS_RING[day.status],
                day.isToday && "font-semibold",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium",
                  day.isToday ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground",
                )}
              >
                {day.weekdayShort}
              </span>
              <span
                className={cn(
                  "text-sm tabular-nums",
                  day.isToday ? "font-bold text-blue-700 dark:text-blue-300" : "text-foreground",
                )}
              >
                {day.dayNumber}
              </span>
              <DayIcon status={day.status} />
              {!day.isRestDay && day.total > 0 && (
                <span className="text-muted-foreground text-[9px] leading-none tabular-nums">
                  {day.completed}/{day.total}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
