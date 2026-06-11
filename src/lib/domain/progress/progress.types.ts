import type {
  CalendarDate,
  DayAvailability,
  ScheduledStudyBlock,
  ScheduledStudyDay,
  Weekday,
  WeekdayAvailability,
} from "@/lib/domain/schedule";

export type PlanBlockExecutionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "stuck"
  | "skipped";

export type PlanDayProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "partial"
  | "stuck"
  | "skipped";

export type ProgressEventType =
  | "created"
  | "started"
  | "completed"
  | "marked_stuck"
  | "returned_to_pending"
  | "skipped"
  | "restored"
  | "rescheduled"
  | "schedule_shifted"
  | "notes_updated"
  | "difficulty_updated"
  | "confidence_updated"
  | "minutes_updated"
  | "undone";

export type PlanBlockProgress = {
  id: string;
  blockId: string;
  legacyBlockKey?: string;
  planDayId: string;
  planDaySequence: number;
  status: PlanBlockExecutionStatus;
  originalScheduledDate: CalendarDate;
  scheduledDate: CalendarDate;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  solutionNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressEvent = {
  id: string;
  blockId: string;
  type: ProgressEventType;
  occurredAt: string;
  previousProgress?: PlanBlockProgress;
  nextProgress?: PlanBlockProgress;
  previousValue?: unknown;
  nextValue?: unknown;
  metadata?: Record<string, unknown>;
  actionGroupId?: string;
  undoneAt?: string;
};

export type ScheduleOverrideType = "reschedule" | "shift";

export type ScheduleOverride = {
  id: string;
  blockId: string;
  type: ScheduleOverrideType;
  fromDate: CalendarDate;
  toDate: CalendarDate;
  createdAt: string;
  actionGroupId?: string;
};

export type EffectiveScheduledBlock = ScheduledStudyBlock & {
  originalScheduledDate: CalendarDate;
  scheduledDate: CalendarDate;
  executionStatus: PlanBlockExecutionStatus;
  timingStatus: "past" | "today" | "future";
  isOverdue: boolean;
  isRescheduled: boolean;
  completedAt?: string;
  startedAt?: string;
  skippedAt?: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  solutionNotes?: string;
};

export type EffectiveScheduledDay = Omit<ScheduledStudyDay, "items"> & {
  items: EffectiveScheduledBlock[];
};

export type CurrentStudyState = {
  currentItem: EffectiveScheduledBlock | null;
  currentDay: EffectiveScheduledDay | null;
  lastCompletedItem: EffectiveScheduledBlock | null;
  nextItem: EffectiveScheduledBlock | null;
  pendingItems: EffectiveScheduledBlock[];
  overdueItems: EffectiveScheduledBlock[];
  completedItems: EffectiveScheduledBlock[];
  isPlanCompleted: boolean;
};

export type PlanCompletionSummary = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  stuck: number;
  skipped: number;
  completionPercentage: number;
  resolutionPercentage: number;
};

export type EffectiveScheduleOptions = {
  today: CalendarDate;
  availability?: WeekdayAvailability;
};

export type RescheduleWarning = {
  type: "target_day_over_capacity";
  availableMinutes: number;
  scheduledMinutes: number;
};

export type ReschedulePlanBlockInput = {
  blockId: string;
  targetDate: CalendarDate;
  today: CalendarDate;
  availability: WeekdayAvailability;
  allowRestDay?: boolean;
  allowPastDate?: boolean;
  now: string;
  actionGroupId?: string;
};

export type ReschedulePlanBlockResult = {
  progress: PlanBlockProgress[];
  events: ProgressEvent[];
  overrides: ScheduleOverride[];
  warnings: RescheduleWarning[];
};

export type MissedDayStrategy =
  | "keep_overdue"
  | "shift_pending"
  | "reschedule_items"
  | "skip_items";

export type HandleMissedStudyDayInput = {
  missedDate: CalendarDate;
  today: CalendarDate;
  strategy: MissedDayStrategy;
  availability: WeekdayAvailability;
  now: string;
  rescheduleTargets?: Record<string, CalendarDate>;
  skipReason?: string;
};

export type HandleMissedStudyDayResult = {
  progress: PlanBlockProgress[];
  events: ProgressEvent[];
  overrides: ScheduleOverride[];
  warnings: RescheduleWarning[];
};

export type ShiftPendingScheduleInput = {
  fromDate: CalendarDate;
  availability: WeekdayAvailability;
  now: string;
  actionGroupId?: string;
};

export type ShiftPendingScheduleResult = {
  progress: PlanBlockProgress[];
  events: ProgressEvent[];
  overrides: ScheduleOverride[];
  actionGroupId: string;
};

export type ProgressActionContext = {
  baseSchedule: ScheduledStudyDay[];
  progress: PlanBlockProgress[];
  overrides?: ScheduleOverride[];
};

export type AvailabilityForEffectiveDay = DayAvailability & {
  weekday: Weekday;
};
