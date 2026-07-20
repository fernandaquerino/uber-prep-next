import { addCalendarDays, getWeekday, parseCalendarDate } from "./calendar-date";
import { validateWeekdayAvailability } from "./availability";
import { InvalidAvailabilityError, InvalidStudyPlanError } from "./schedule.errors";
import { DEFAULT_START_TIME, addMinutesToTime } from "./time-of-day";
import type {
  CalendarDate,
  CapacityStatus,
  ScheduledStudyBlock,
  ScheduledStudyDay,
  StudyCalendarConfig,
  StudyPlan,
  StudyPlanBlock,
  StudyPlanDay,
} from "./schedule.types";

/** A plan block flattened out of its plan day, keeping the day as provenance. */
type FlattenedBlock = {
  block: StudyPlanBlock;
  planDay: StudyPlanDay;
};

/**
 * Builds the effective study calendar by reflowing every plan block into a
 * single ordered stream and packing it across available weekdays by capacity.
 *
 * Reflow rules:
 * - Blocks keep their original order (plan day sequence, then block order).
 * - A block is never split: if it does not fit the day's remaining minutes it
 *   slides whole to the next available day.
 * - A block larger than a full day is placed alone on its own day
 *   (`over_capacity`) so the stream never stalls.
 * - Each block's `startTime` is recomputed from the day's configured start time
 *   plus the durations already placed that day.
 * - Rest days (disabled weekdays) carry no blocks; trailing rest days after the
 *   last content are not emitted.
 */
export function buildStudySchedule(
  plan: StudyPlan,
  config: StudyCalendarConfig,
): ScheduledStudyDay[] {
  validateStudyPlan(plan);
  validateStudyCalendarConfig(config);

  if (plan.days.length === 0) {
    return [];
  }

  const stream = flattenPlanBlocks(plan);

  if (stream.length === 0) {
    return [];
  }

  const schedule: ScheduledStudyDay[] = [];
  let currentDate = config.startDate;
  let streamIndex = 0;

  while (streamIndex < stream.length) {
    const weekday = getWeekday(currentDate);
    const availability = config.weekdayAvailability[weekday];

    if (!availability.enabled) {
      schedule.push(createRestDay(currentDate));
      currentDate = addCalendarDays(currentDate, 1);
      continue;
    }

    const dayStartTime = availability.startTime ?? DEFAULT_START_TIME;
    const items: ScheduledStudyBlock[] = [];
    let usedMinutes = 0;

    while (streamIndex < stream.length) {
      const next = stream[streamIndex];
      const duration = next.block.estimatedMinutes;
      const fitsInDay = usedMinutes + duration <= availability.availableMinutes;
      const dayIsEmpty = items.length === 0;

      // Place the block if it fits, or if the day is still empty and the block
      // is larger than a whole day (place it alone rather than stalling).
      if (!fitsInDay && !dayIsEmpty) {
        break;
      }

      items.push(toScheduledBlock(next, addMinutesToTime(dayStartTime, usedMinutes)));
      usedMinutes += duration;
      streamIndex += 1;
    }

    schedule.push({
      date: currentDate,
      weekday,
      availableMinutes: availability.availableMinutes,
      isRestDay: false,
      items,
      totalEstimatedMinutes: usedMinutes,
      remainingMinutes: availability.availableMinutes - usedMinutes,
      capacityStatus: getCapacityStatus(usedMinutes, availability.availableMinutes),
    });

    currentDate = addCalendarDays(currentDate, 1);
  }

  return schedule;
}

function flattenPlanBlocks(plan: StudyPlan): FlattenedBlock[] {
  return [...plan.days]
    .sort((a, b) => a.sequence - b.sequence)
    .flatMap((planDay) => planDay.blocks.map((block) => ({ block, planDay })));
}

function toScheduledBlock({ block, planDay }: FlattenedBlock, startTime: string): ScheduledStudyBlock {
  return {
    blockId: block.id,
    planDayId: planDay.id,
    planDaySequence: planDay.sequence,
    title: block.title,
    category: block.category,
    estimatedMinutes: block.estimatedMinutes,
    type: block.type,
    startTime,
    resourceUrl: block.resourceUrl,
  };
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
