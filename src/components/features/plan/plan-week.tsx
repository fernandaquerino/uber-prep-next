"use client";

import type { ScheduledWeek } from "@/lib/domain/schedule";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import type { CalendarDate } from "@/lib/domain/schedule";
import { PlanDayCard } from "./plan-day-card";

type PlanWeekProps = {
  week: ScheduledWeek;
  effectiveDays: EffectiveScheduledDay[];
  today: CalendarDate;
  isFiltered?: boolean;
  onStartBlock: (blockId: string) => void;
  onCompleteBlock: (blockId: string) => void;
  onStuckBlock: (blockId: string) => void;
  onReturnToPending: (blockId: string) => void;
  onSkipBlock: (blockId: string) => void;
  onRestoreBlock: (blockId: string) => void;
  onRescheduleBlock: (blockId: string) => void;
  onOpenBlock: (blockId: string) => void;
  onMissedDay: (date: CalendarDate) => void;
};

export function PlanWeek({
  week,
  effectiveDays,
  today,
  isFiltered = false,
  onStartBlock,
  onCompleteBlock,
  onStuckBlock,
  onReturnToPending,
  onSkipBlock,
  onRestoreBlock,
  onRescheduleBlock,
  onOpenBlock,
  onMissedDay,
}: PlanWeekProps) {
  const dayMap = new Map(effectiveDays.map((d) => [d.date, d]));

  return (
    <div className="flex flex-col gap-2">
      {week.days.map((baseDay) => {
        const effectiveDay = dayMap.get(baseDay.date);

        // When a quick-filter is active, skip days that have no matching items.
        // Without this check, days not in effectiveDays fall back to the full
        // base schedule, making the filter appear to have no effect.
        if (!effectiveDay && isFiltered) return null;

        const day = effectiveDay ?? {
          ...baseDay,
          items: baseDay.items.map((item) => ({
            ...item,
            originalScheduledDate: baseDay.date,
            scheduledDate: baseDay.date,
            executionStatus: "pending" as const,
            timingStatus:
              baseDay.date < today ? "past" : baseDay.date === today ? "today" : "future",
            isOverdue: false,
            isRescheduled: false,
          })),
        };

        return (
          <PlanDayCard
            key={baseDay.date}
            day={day}
            today={today}
            defaultOpen={baseDay.date === today}
            onStartBlock={onStartBlock}
            onCompleteBlock={onCompleteBlock}
            onStuckBlock={onStuckBlock}
            onReturnToPending={onReturnToPending}
            onSkipBlock={onSkipBlock}
            onRestoreBlock={onRestoreBlock}
            onRescheduleBlock={onRescheduleBlock}
            onOpenBlock={onOpenBlock}
            onMissedDay={onMissedDay}
          />
        );
      })}
    </div>
  );
}
