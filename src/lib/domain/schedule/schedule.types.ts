export type CalendarDate = string & {
  readonly __brand: "CalendarDate";
};

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DayAvailability = {
  enabled: boolean;
  availableMinutes: number;
  /** Optional "HH:mm" start time; falls back to DEFAULT_START_TIME when absent. */
  startTime?: string;
};

export type WeekdayAvailability = Record<Weekday, DayAvailability>;

export type StudyCalendarConfig = {
  startDate: CalendarDate;
  timezone: string;
  weekdayAvailability: WeekdayAvailability;
};

export type StudyPlanBlock = {
  id: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  description?: string;
  tags?: string[];
  type: string;
  startTime?: string;
  resourceUrl?: string;
};

export type StudyPlanDay = {
  id: string;
  sequence: number;
  title: string;
  blocks: StudyPlanBlock[];
};

export type StudyPlan = {
  id: string;
  title: string;
  version: number;
  days: StudyPlanDay[];
};

export type ScheduledStudyBlock = {
  blockId: string;
  planDayId: string;
  planDaySequence: number;
  title: string;
  category: string;
  estimatedMinutes: number;
  type: string;
  startTime?: string;
  resourceUrl?: string;
};

export type CapacityStatus = "available" | "full" | "over_capacity" | "rest";

export type ScheduledStudyDay = {
  date: CalendarDate;
  weekday: Weekday;
  availableMinutes: number;
  isRestDay: boolean;
  items: ScheduledStudyBlock[];
  totalEstimatedMinutes: number;
  remainingMinutes: number;
  capacityStatus: CapacityStatus;
};

export type ScheduleDayStatus = "past" | "today" | "future";

export type ScheduledWeek = {
  id: string;
  weekStart: CalendarDate;
  weekEnd: CalendarDate;
  days: ScheduledStudyDay[];
};
