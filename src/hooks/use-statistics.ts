"use client";

import { useCallback, useEffect, useState } from "react";
import { getStatisticsData } from "@/lib/application/statistics/get-statistics-data";
import type {
  StatisticsPeriod,
  StatisticsViewModel,
} from "@/lib/presentation/statistics/statistics-view-model";

type StatisticsState =
  | { status: "loading" }
  | { status: "ready"; viewModel: StatisticsViewModel }
  | { status: "error"; error: Error };

export function useStatistics() {
  const [period, setPeriod] = useState<StatisticsPeriod>("28d");
  const [state, setState] = useState<StatisticsState>({ status: "loading" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setState({ status: "loading" });
    });

    void getStatisticsData(period)
      .then((viewModel) => {
        if (!cancelled) setState({ status: "ready", viewModel });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, revision]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  return { period, setPeriod, state, refresh };
}
