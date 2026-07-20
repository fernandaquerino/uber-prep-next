import {
  buildStudySchedule,
  parseCalendarDate,
  PRODUCT_TIMEZONE,
  type StudyCalendarConfig,
  type StudyPlan,
  type StudyPlanDay,
  type WeekdayAvailability,
} from "@/lib/domain/schedule";
import { initializePlanProgress, type PlanBlockProgress } from "@/lib/domain/progress";

export const NOW = "2026-06-11T12:00:00.000Z";

/**
 * Continuous-week availability for progress-mechanics tests: every weekday and
 * Saturday enabled at 120 min (so each 120-min fixture block maps 1:1 to a
 * calendar day), Sunday as the only rest day. Decoupled from the product
 * default (which rests on weekends) so shifting/reschedule scenarios can rely
 * on a predictable, gap-of-one-day week.
 */
export const TEST_AVAILABILITY: WeekdayAvailability = {
  monday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  tuesday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  wednesday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  thursday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  friday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  saturday: { enabled: true, availableMinutes: 120, startTime: "09:00" },
  sunday: { enabled: false, availableMinutes: 0 },
};

export function createConfig(startDate: string): StudyCalendarConfig {
  return {
    startDate: parseCalendarDate(startDate),
    timezone: PRODUCT_TIMEZONE,
    weekdayAvailability: TEST_AVAILABILITY,
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
