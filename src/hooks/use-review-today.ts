"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReviewTodayPageState } from "@/lib/presentation/reviews/review-view-model";
import { buildReviewTodayViewModel } from "@/lib/presentation/reviews/build-review-view-model";
import { getReviewTodayData } from "@/lib/application/reviews/get-review-today-data";
import { buildStudySchedule, parseCalendarDate } from "@/lib/domain/schedule";
import { getEffectiveSchedule } from "@/lib/application/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";

export type UseReviewTodayResult = {
  state: ReviewTodayPageState;
  refresh: () => void;
  isRefreshing: boolean;
};

async function loadReviewTodayData(): Promise<ReviewTodayPageState> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { getSettings } = await import("@/lib/application/settings");

  const db = getDb();
  await runSeeds(db);

  const settings = await getSettings(db);
  if (!settings.startDate) {
    return { status: "no_start_date" };
  }

  const startDate = parseCalendarDate(settings.startDate);
  const availability = settings.weekdayAvailability;

  const baseSchedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: settings.timezone ?? "America/Sao_Paulo",
    weekdayAvailability: availability,
  });

  const now = new Date();
  const today = parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );

  const effectiveSchedule = await getEffectiveSchedule({
    db,
    baseSchedule,
    today,
    availability,
  });

  const data = await getReviewTodayData(db, effectiveSchedule, baseSchedule);
  const viewModel = buildReviewTodayViewModel(data);

  return { status: "ready", viewModel };
}

export function useReviewToday(): UseReviewTodayResult {
  const [state, setState] = useState<ReviewTodayPageState>({ status: "loading" });
  const [rev, setRev] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadReviewTodayData()
      .then((result) => {
        if (cancelled) return;
        setState(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          error: err instanceof Error ? err : new Error(String(err)),
        });
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRev((r) => r + 1);
  }, []);

  return { state, refresh, isRefreshing };
}
