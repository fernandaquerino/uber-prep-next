import { addCalendarDays, getWeekday, parseCalendarDate } from "./calendar-date";
import { validateWeekdayAvailability } from "./availability";
import { InvalidAvailabilityError, InvalidStudyPlanError } from "./schedule.errors";
import type {
  CalendarDate,
  CapacityStatus,
  ScheduledStudyBlock,
  ScheduledStudyDay,
  StudyCalendarConfig,
  StudyPlan,
  StudyPlanDay,
} from "./schedule.types";

export function buildStudySchedule(
  plan: StudyPlan,
  config: StudyCalendarConfig,
): ScheduledStudyDay[] {
  validateStudyPlan(plan);
  validateStudyCalendarConfig(config);

  if (plan.days.length === 0) {
    return [];
  }

  const orderedPlanDays = [...plan.days].sort((a, b) => a.sequence - b.sequence);
  const schedule: ScheduledStudyDay[] = [];
  let currentDate = config.startDate;
  let planDayIndex = 0;

  while (planDayIndex < orderedPlanDays.length) {
    const weekday = getWeekday(currentDate);
    const availability = config.weekdayAvailability[weekday];

    if (!availability.enabled) {
      schedule.push(createRestDay(currentDate));
      currentDate = addCalendarDays(currentDate, 1);
      continue;
    }

    const planDay = orderedPlanDays[planDayIndex];
    const items = mapPlanDayToScheduledBlocks(planDay);
    const totalEstimatedMinutes = sumEstimatedMinutes(items);

    schedule.push({
      date: currentDate,
      weekday,
      availableMinutes: availability.availableMinutes,
      isRestDay: false,
      items,
      totalEstimatedMinutes,
      remainingMinutes: availability.availableMinutes - totalEstimatedMinutes,
      capacityStatus: getCapacityStatus(totalEstimatedMinutes, availability.availableMinutes),
    });

    planDayIndex += 1;
    currentDate = addCalendarDays(currentDate, 1);
  }

  return schedule;
}

export function validateStudyCalendarConfig(config: StudyCalendarConfig): void {
  parseCalendarDate(config.startDate);

  if (config.timezone.trim().length === 0) {
    throw new InvalidAvailabilityError("Calendar timezone is required.");
  }

  validateWeekdayAvailability(config.weekdayAvailability);
}

export function validateStudyPlan(plan: StudyPlan): void {
  if (plan.id.trim().length === 0) {
    throw new InvalidStudyPlanError("Study plan id is required.");
  }

  const sequences = new Set<number>();
  const blockIds = new Set<string>();

  for (const day of plan.days) {
    if (day.id.trim().length === 0) {
      throw new InvalidStudyPlanError("Study plan day id is required.");
    }

    if (!Number.isInteger(day.sequence) || day.sequence <= 0) {
      throw new InvalidStudyPlanError(`Invalid sequence for plan day ${day.id}.`);
    }

    if (sequences.has(day.sequence)) {
      throw new InvalidStudyPlanError(`Duplicated plan day sequence: ${day.sequence}.`);
    }

    sequences.add(day.sequence);

    for (const block of day.blocks) {
      if (block.id.trim().length === 0) {
        throw new InvalidStudyPlanError(`Plan day ${day.id} has a block without id.`);
      }

      if (blockIds.has(block.id)) {
        throw new InvalidStudyPlanError(`Duplicated plan block id: ${block.id}.`);
      }

      if (!Number.isFinite(block.estimatedMinutes) || block.estimatedMinutes < 0) {
        throw new InvalidStudyPlanError(`Invalid estimated minutes for block ${block.id}.`);
      }

      blockIds.add(block.id);
    }
  }
}

function createRestDay(date: CalendarDate): ScheduledStudyDay {
  return {
    date,
    weekday: getWeekday(date),
    availableMinutes: 0,
    isRestDay: true,
    items: [],
    totalEstimatedMinutes: 0,
    remainingMinutes: 0,
    capacityStatus: "rest",
  };
}

function mapPlanDayToScheduledBlocks(planDay: StudyPlanDay): ScheduledStudyBlock[] {
  return planDay.blocks.map((block) => ({
    blockId: block.id,
    planDayId: planDay.id,
    planDaySequence: planDay.sequence,
    title: block.title,
    category: block.category,
    estimatedMinutes: block.estimatedMinutes,
    type: block.type,
    startTime: block.startTime,
    resourceUrl: block.resourceUrl,
  }));
}

function sumEstimatedMinutes(items: ScheduledStudyBlock[]): number {
  return items.reduce((total, item) => total + item.estimatedMinutes, 0);
}

function getCapacityStatus(
  totalEstimatedMinutes: number,
  availableMinutes: number,
): CapacityStatus {
  if (totalEstimatedMinutes > availableMinutes) {
    return "over_capacity";
  }

  if (totalEstimatedMinutes === availableMinutes) {
    return "full";
  }

  return "available";
}
