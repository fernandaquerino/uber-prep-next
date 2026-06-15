import type { CalendarDate } from "@/lib/domain/schedule";
import { compareCalendarDates } from "@/lib/domain/schedule";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import type { AppNotification } from "./notification.types";

export type BuildNotificationsInput = {
  today: CalendarDate;
  reviewSummary: { dueToday: number; overdue: number };
  overdueItems: EffectiveScheduledBlock[];
  /** Earliest pending plan item (current study), if any. */
  currentItem: EffectiveScheduledBlock | null;
};

function pluralReviews(n: number): string {
  return n === 1 ? "revisão" : "revisões";
}

/**
 * Derives the notification feed from real domain signals. Pure function so it
 * can be unit-tested and reused without touching the database or React.
 *
 * Priority order (most actionable first): overdue plan content, overdue
 * reviews, reviews due today, today's pending study.
 */
export function buildNotifications(input: BuildNotificationsInput): AppNotification[] {
  const { today, reviewSummary, overdueItems, currentItem } = input;
  const notifications: AppNotification[] = [];

  if (overdueItems.length > 0) {
    const sorted = [...overdueItems].sort((a, b) =>
      compareCalendarDates(a.scheduledDate, b.scheduledDate),
    );
    const first = sorted[0];
    const extra = sorted.length - 1;
    notifications.push({
      id: "plan-overdue",
      type: "plan_overdue",
      title: extra > 0 ? `${sorted.length} conteúdos atrasados` : "Conteúdo atrasado",
      description:
        extra > 0
          ? `"${first.title}" e mais ${extra}. Conclua ou reagende.`
          : `"${first.title}" passou da data. Conclua ou reagende.`,
      date: first.scheduledDate,
      href: "/plano",
    });
  }

  if (reviewSummary.overdue > 0) {
    notifications.push({
      id: "review-overdue",
      type: "review_overdue",
      title: "Revisões atrasadas",
      description: `${reviewSummary.overdue} ${pluralReviews(reviewSummary.overdue)} passaram da data agendada.`,
      date: today,
      href: "/revisoes",
    });
  }

  if (reviewSummary.dueToday > 0) {
    notifications.push({
      id: "review-due",
      type: "review_due",
      title: "Revisões para hoje",
      description: `${reviewSummary.dueToday} ${pluralReviews(reviewSummary.dueToday)} para revisar hoje.`,
      date: today,
      href: "/revisoes",
    });
  }

  // Only surface "study today" when the current item is scheduled for today and
  // not already counted as overdue (overdue items get their own notification).
  if (currentItem && currentItem.scheduledDate === today && !currentItem.isOverdue) {
    notifications.push({
      id: "study-today",
      type: "study_today",
      title: "Estudo de hoje",
      description: `Próximo: "${currentItem.title}" (${currentItem.estimatedMinutes}min).`,
      date: today,
      href: "/plano",
    });
  }

  return notifications;
}
