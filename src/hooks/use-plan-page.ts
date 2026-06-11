"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  CurrentStudyState,
  EffectiveScheduledDay,
  PlanCompletionSummary,
} from "@/lib/domain/progress";
import { getCurrentStudyState, getPlanCompletionSummary } from "@/lib/domain/progress";
import type { CalendarDate, ScheduledStudyDay, ScheduledWeek } from "@/lib/domain/schedule";
import {
  buildStudySchedule,
  groupScheduleByCalendarWeek,
  parseCalendarDate,
  DEFAULT_WEEKDAY_AVAILABILITY,
} from "@/lib/domain/schedule";
import { getEffectiveSchedule } from "@/lib/application/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import type { SettingsRecord } from "@/types/database";

export type PlanFilters = {
  status: "all" | "pending" | "completed" | "overdue" | "stuck" | "skipped" | "rescheduled";
  category: string | null;
  search: string;
};

type PlanPageData = {
  settings: SettingsRecord;
  startDate: CalendarDate;
  baseSchedule: ScheduledStudyDay[];
  effectiveSchedule: EffectiveScheduledDay[];
  weeks: ScheduledWeek[];
  currentStudyState: CurrentStudyState;
  completionSummary: PlanCompletionSummary;
  initialWeekId: string | null;
};

export type PlanPageState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "no_start_date" }
  | { status: "ready"; data: PlanPageData };

export type UsePlanPageResult = {
  state: PlanPageState;
  selectedWeekId: string | null;
  setSelectedWeekId: (id: string | null) => void;
  filters: PlanFilters;
  setFilters: (filters: PlanFilters) => void;
  refresh: () => void;
};

const DEFAULT_FILTERS: PlanFilters = {
  status: "all",
  category: null,
  search: "",
};

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return parseCalendarDate(`${y}-${m}-${d}`);
}

type LoadResult = { kind: "ready"; data: PlanPageData } | { kind: "no_start_date" };

async function fetchPlanData(): Promise<LoadResult> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { SETTINGS_ID } = await import("@/lib/db/constants");

  const db = getDb();
  await runSeeds(db);

  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings?.startDate) {
    return { kind: "no_start_date" };
  }

  const startDate = parseCalendarDate(settings.startDate);
  const availability = DEFAULT_WEEKDAY_AVAILABILITY;
  const today = getTodayCalendarDate();

  const baseSchedule = buildStudySchedule(STUDY_PLAN, {
    startDate,
    timezone: settings.timezone ?? "America/Sao_Paulo",
    weekdayAvailability: availability,
  });

  const effectiveSchedule = await getEffectiveSchedule({
    db,
    baseSchedule,
    today,
    availability,
  });

  const weeks = groupScheduleByCalendarWeek(effectiveSchedule);
  const currentStudyState = getCurrentStudyState(effectiveSchedule);
  const completionSummary = getPlanCompletionSummary(effectiveSchedule);

  const todayWeek = weeks.find((w) => w.days.some((d) => d.date === today));
  const initialWeekId = todayWeek?.id ?? weeks[0]?.id ?? null;

  return {
    kind: "ready",
    data: {
      settings,
      startDate,
      baseSchedule,
      effectiveSchedule,
      weeks,
      currentStudyState,
      completionSummary,
      initialWeekId,
    },
  };
}

export function usePlanPage(): UsePlanPageResult {
  const [state, setState] = useState<PlanPageState>({ status: "loading" });
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlanFilters>(DEFAULT_FILTERS);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPlanData()
      .then((result) => {
        if (cancelled) return;
        if (result.kind === "no_start_date") {
          setState({ status: "no_start_date" });
        } else {
          setState({ status: "ready", data: result.data });
          setSelectedWeekId((prev) => prev ?? result.data.initialWeekId);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => {
    // Only increment rev to trigger re-fetch; do NOT set { status: "loading" }.
    // Setting loading here would unmount the entire plan tree (modal, accordions,
    // day cards) and reset all local UI state. The initial "loading" state is
    // already set by useState initialisation and is only shown on first mount.
    setRev((r) => r + 1);
  }, []);

  return { state, selectedWeekId, setSelectedWeekId, filters, setFilters, refresh };
}
