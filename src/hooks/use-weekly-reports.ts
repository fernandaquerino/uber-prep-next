"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeeklyReportsData } from "@/lib/application/reports/get-weekly-reports-data";
import { getWeeklyReportsData } from "@/lib/application/reports/get-weekly-reports-data";

export type WeeklyReportsPageState =
  | { status: "loading" }
  | { status: "no_start_date" }
  | { status: "error"; error: Error }
  | { status: "ready"; data: WeeklyReportsData };

export function useWeeklyReports() {
  const [state, setState] = useState<WeeklyReportsPageState>({ status: "loading" });
  const [selectedWeek, setSelectedWeek] = useState<number>();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { getDb } = await import("@/lib/db/db");
        const { runSeeds } = await import("@/lib/db/seed");
        const db = getDb();
        await runSeeds(db);
        const result = await getWeeklyReportsData(db, selectedWeek);
        if (cancelled) return;
        setState(
          result.kind === "no_start_date"
            ? { status: "no_start_date" }
            : { status: "ready", data: result.data },
        );
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [revision, selectedWeek]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return { state, selectedWeek, setSelectedWeek, refresh };
}
