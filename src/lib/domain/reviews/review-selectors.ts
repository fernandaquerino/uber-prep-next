import type { CalendarDate } from "@/lib/domain/schedule";
import { differenceInCalendarDates } from "@/lib/domain/schedule";
import type { ReviewRecord } from "@/types/database";
import type { ReviewTimingStatus } from "./review.types";

function parseDate(s: string): CalendarDate {
  return s.slice(0, 10) as CalendarDate;
}

export function isReviewActive(review: ReviewRecord): boolean {
  return review.status === "scheduled" || review.status === "due";
}

export function isReviewDue(review: ReviewRecord, today: CalendarDate): boolean {
  if (!isReviewActive(review)) return false;
  return parseDate(review.scheduledFor) <= today;
}

export function isReviewOverdue(review: ReviewRecord, today: CalendarDate): boolean {
  if (!isReviewActive(review)) return false;
  return parseDate(review.scheduledFor) < today;
}

export function getDaysOverdue(review: ReviewRecord, today: CalendarDate): number {
  const diff = differenceInCalendarDates(today, parseDate(review.scheduledFor));
  return Math.max(0, diff);
}

export function getReviewTimingStatus(
  review: ReviewRecord,
  today: CalendarDate,
): ReviewTimingStatus {
  const scheduled = parseDate(review.scheduledFor);
  if (scheduled < today) return "overdue";
  if (scheduled === today) return "due_today";
  return "upcoming";
}
