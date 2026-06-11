import { compareCalendarDates, isBeforeCalendarDate } from "@/lib/domain/schedule";
import type {
  CurrentStudyState,
  EffectiveScheduledBlock,
  EffectiveScheduledDay,
  PlanBlockProgress,
  PlanCompletionSummary,
} from "./progress.types";

export function getProgressByBlockId(
  progress: PlanBlockProgress[],
  blockId: string,
): PlanBlockProgress | undefined {
  return progress.find((record) => record.blockId === blockId);
}

export function getCompletedPlanItems(
  schedule: EffectiveScheduledDay[],
): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.executionStatus === "completed");
}

export function getPendingPlanItems(schedule: EffectiveScheduledDay[]): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.executionStatus === "pending");
}

export function getInProgressPlanItems(
  schedule: EffectiveScheduledDay[],
): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.executionStatus === "in_progress");
}

export function getStuckPlanItems(schedule: EffectiveScheduledDay[]): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.executionStatus === "stuck");
}

export function getSkippedPlanItems(schedule: EffectiveScheduledDay[]): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.executionStatus === "skipped");
}

export function getOverduePlanItems(schedule: EffectiveScheduledDay[]): EffectiveScheduledBlock[] {
  return getAllItems(schedule).filter((item) => item.isOverdue);
}

export function getCurrentPlanItem(
  schedule: EffectiveScheduledDay[],
): EffectiveScheduledBlock | undefined {
  return getAllItems(schedule).find(
    (item) => item.executionStatus !== "completed" && item.executionStatus !== "skipped",
  );
}

export function getNextPlanItem(
  schedule: EffectiveScheduledDay[],
): EffectiveScheduledBlock | undefined {
  const current = getCurrentPlanItem(schedule);

  if (!current) {
    return undefined;
  }

  return getAllItems(schedule).find(
    (item) =>
      item.blockId !== current.blockId &&
      item.executionStatus !== "completed" &&
      item.executionStatus !== "skipped" &&
      compareEffectiveItems(item, current) > 0,
  );
}

export function getLastCompletedPlanItem(
  schedule: EffectiveScheduledDay[],
): EffectiveScheduledBlock | undefined {
  return [...getCompletedPlanItems(schedule)].sort(compareEffectiveItems).at(-1);
}

export function getPlanCompletionSummary(schedule: EffectiveScheduledDay[]): PlanCompletionSummary {
  const items = getAllItems(schedule);
  const total = items.length;
  const completed = items.filter((item) => item.executionStatus === "completed").length;
  const pending = items.filter((item) => item.executionStatus === "pending").length;
  const inProgress = items.filter((item) => item.executionStatus === "in_progress").length;
  const stuck = items.filter((item) => item.executionStatus === "stuck").length;
  const skipped = items.filter((item) => item.executionStatus === "skipped").length;

  return {
    total,
    completed,
    pending,
    inProgress,
    stuck,
    skipped,
    completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    resolutionPercentage: total === 0 ? 0 : Math.round(((completed + skipped) / total) * 100),
  };
}

export function isPlanCompleted(schedule: EffectiveScheduledDay[]): boolean {
  const summary = getPlanCompletionSummary(schedule);
  return summary.total > 0 && summary.completed === summary.total;
}

export function getCurrentStudyState(schedule: EffectiveScheduledDay[]): CurrentStudyState {
  const currentItem = getCurrentPlanItem(schedule) ?? null;

  return {
    currentItem,
    currentDay: currentItem
      ? (schedule.find((day) => day.date === currentItem.scheduledDate) ?? null)
      : null,
    lastCompletedItem: getLastCompletedPlanItem(schedule) ?? null,
    nextItem: getNextPlanItem(schedule) ?? null,
    pendingItems: getPendingPlanItems(schedule),
    overdueItems: getOverduePlanItems(schedule),
    completedItems: getCompletedPlanItems(schedule),
    isPlanCompleted: isPlanCompleted(schedule),
  };
}

export function compareEffectiveItems(
  a: EffectiveScheduledBlock,
  b: EffectiveScheduledBlock,
): number {
  const dateComparison = compareCalendarDates(a.scheduledDate, b.scheduledDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  if (a.planDaySequence !== b.planDaySequence) {
    return a.planDaySequence - b.planDaySequence;
  }

  return a.blockId.localeCompare(b.blockId);
}

export function isOverdueEffectiveItem(item: EffectiveScheduledBlock): boolean {
  return (
    isBeforeCalendarDate(item.scheduledDate, item.scheduledDate) &&
    item.executionStatus !== "completed" &&
    item.executionStatus !== "skipped"
  );
}

export function getAllItems(schedule: EffectiveScheduledDay[]): EffectiveScheduledBlock[] {
  return schedule.flatMap((day) => day.items).sort(compareEffectiveItems);
}
