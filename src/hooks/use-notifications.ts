"use client";

import { useCallback, useEffect, useState } from "react";
import { buildStudySchedule, parseCalendarDate } from "@/lib/domain/schedule";
import { getEffectiveSchedule } from "@/lib/application/progress";
import {
  getCurrentPlanItem,
  getOverduePlanItems,
} from "@/lib/domain/progress";
import { getReviewTodayData } from "@/lib/application/reviews/get-review-today-data";
import { buildNotifications } from "@/lib/domain/notifications";
import type { AppNotification } from "@/lib/domain/notifications";
import { STUDY_PLAN } from "@/lib/data/study-plan";

export type UseNotificationsResult = {
  notifications: AppNotification[];
  today: string | null;
  status: "loading" | "ready" | "error";
  refresh: () => void;
};

async function loadNotifications(): Promise<{ notifications: AppNotification[]; today: string }> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { getSettings } = await import("@/lib/application/settings");

  const db = getDb();
  await runSeeds(db);

  const now = new Date();
  const today = parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );

  const settings = await getSettings(db);
  if (!settings.startDate) {
    return { notifications: [], today };
  }

  const availability = settings.weekdayAvailability;
  const baseSchedule = buildStudySchedule(STUDY_PLAN, {
    startDate: parseCalendarDate(settings.startDate),
    timezone: settings.timezone ?? "America/Sao_Paulo",
    weekdayAvailability: availability,
  });

  const effectiveSchedule = await getEffectiveSchedule({
    db,
    baseSchedule,
    today,
    availability,
  });

  const reviewData = await getReviewTodayData(db, effectiveSchedule, baseSchedule);

  const notifications = buildNotifications({
    today,
    reviewSummary: {
      dueToday: reviewData.summary.dueToday,
      overdue: reviewData.summary.overdue,
    },
    overdueItems: getOverduePlanItems(effectiveSchedule),
    currentItem: getCurrentPlanItem(effectiveSchedule) ?? null,
  });

  return { notifications, today };
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [today, setToday] = useState<string | null>(null);
  const [status, setStatus] = useState<UseNotificationsResult["status"]>("loading");
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadNotifications()
      .then((result) => {
        if (cancelled) return;
        setNotifications(result.notifications);
        setToday(result.today);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((r) => r + 1), []);

  return { notifications, today, status, refresh };
}
