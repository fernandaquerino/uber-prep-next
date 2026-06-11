import {
  DEFAULT_WEEKDAY_AVAILABILITY,
  parseCalendarDate,
  PRODUCT_TIMEZONE,
  type StudyCalendarConfig,
  type StudyPlan,
  type StudyPlanDay,
  type WeekdayAvailability,
} from "../index";

export function createConfig(
  startDate: string,
  availability: WeekdayAvailability = DEFAULT_WEEKDAY_AVAILABILITY,
): StudyCalendarConfig {
  return {
    startDate: parseCalendarDate(startDate),
    timezone: PRODUCT_TIMEZONE,
    weekdayAvailability: availability,
  };
}

export function createPlan(days: StudyPlanDay[]): StudyPlan {
  return {
    id: "six-week-plan",
    title: "Six Week Plan",
    version: 1,
    days,
  };
}

export function createPlanDays(count: number, minutesPerDay = 120): StudyPlanDay[] {
  return Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;

    return {
      id: `day-${sequence}`,
      sequence,
      title: `Day ${sequence}`,
      blocks: [
        {
          id: `block-${sequence}-a`,
          title: `Block ${sequence} A`,
          category: "algorithms",
          estimatedMinutes: Math.floor(minutesPerDay / 2),
        },
        {
          id: `block-${sequence}-b`,
          title: `Block ${sequence} B`,
          category: "javascript",
          estimatedMinutes: Math.ceil(minutesPerDay / 2),
        },
      ],
    };
  });
}
