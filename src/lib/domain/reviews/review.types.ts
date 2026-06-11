import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewResult, ReviewReason, ReviewSourceType } from "@/types/database";

export type { ReviewResult, ReviewReason, ReviewSourceType };

export type ReviewPriority = "critical" | "high" | "medium" | "low";

export type ReviewTimingStatus = "upcoming" | "due_today" | "overdue";

export type ReviewQueueItem = {
  reviewId: string;
  sourceType: ReviewSourceType;
  sourceId: string;

  title: string;
  description?: string;
  category?: string;
  type?: string;

  scheduledFor: CalendarDate;
  daysOverdue: number;
  timingStatus: ReviewTimingStatus;

  reason: ReviewReason | string;
  priority: ReviewPriority;
  cycleIndex: number;

  estimatedMinutes?: number;
  lastResult?: ReviewResult;
};

export type NextStudyItem = {
  blockId: string;
  title: string;
  category: string;
  type: string;
  estimatedMinutes: number;
  executionStatus: string;
};

export type NextStudyPreview = {
  date: CalendarDate;
  dateLabel: string;
  weekdayLabel: string;
  isTomorrow: boolean;
  isToday: boolean;
  items: NextStudyItem[];
  estimatedMinutes: number;
};
