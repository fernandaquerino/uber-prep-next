"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardPageState } from "@/lib/presentation/dashboard/dashboard-view-model";
import { getDashboardData } from "@/lib/application/dashboard/get-dashboard-data";

export type UseDashboardResult = {
  state: DashboardPageState;
  refresh: () => void;
  isRefreshing: boolean;
};

export function useDashboard(): UseDashboardResult {
  const [state, setState] = useState<DashboardPageState>({ status: "loading" });
  const [rev, setRev] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getDashboardData()
      .then((result) => {
        if (cancelled) return;
        if (result.kind === "no_start_date") {
          setState({ status: "no_start_date" });
        } else {
          setState({ status: "ready", viewModel: result.viewModel });
        }
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
