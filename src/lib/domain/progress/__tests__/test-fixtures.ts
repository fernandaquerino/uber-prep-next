import {
  buildStudySchedule,
  DEFAULT_WEEKDAY_AVAILABILITY,
  parseCalendarDate,
  PRODUCT_TIMEZONE,
  type StudyCalendarConfig,
  type StudyPlan,
  type StudyPlanDay,
} from "@/lib/domain/schedule";
import { initializePlanProgress, type PlanBlockProgress } from "@/lib/domain/progress";

export const NOW = "2026-06-11T12:00:00.000Z";

export function createConfig(startDate: string): StudyCalendarConfig {
  return {
    startDate: parseCalendarDate(startDate),
    timezone: PRODUCT_TIMEZONE,
    weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
  };
}

export function createPlanDays(count: number): StudyPlanDay[] {
  return Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;

    return {
      id: `day-${sequence}`,
      sequence,
      title: `Day ${sequence}`,
      blocks: [
        {
          id: `block-${sequence}`,
          title: `Block ${sequence}`,
          category: "algorithms",
          estimatedMinutes: 120,
          type: "exercicio",
        },
      ],
    };
  });
}

export function createPlan(count = 5): StudyPlan {
  return {
    id: "plan",
    title: "Plan",
    version: 1,
    days: createPlanDays(count),
  };
}

export function createBaseSchedule(startDate = "2026-06-11", days = 5) {
  return buildStudySchedule(createPlan(days), createConfig(startDate));
}

export function createInitializedProgress(startDate = "2026-06-11", days = 5): PlanBlockProgress[] {
  return initializePlanProgress(createBaseSchedule(startDate, days), [], NOW).progress;
}
