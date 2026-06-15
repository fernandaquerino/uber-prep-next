import type { CalendarDate } from "@/lib/domain/schedule";

/**
 * Notification categories. Each maps to a visual treatment in the UI and is
 * derived from a real domain signal (never mocked).
 */
export type NotificationType = "review_overdue" | "review_due" | "plan_overdue" | "study_today";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** Relevant calendar date for the signal (used for relative-time display). */
  date: CalendarDate;
  /** In-app destination so the user can act on the notification. */
  href: string;
};
