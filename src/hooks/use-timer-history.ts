"use client";

import { useCallback, useEffect, useState } from "react";
import type { TimerHistoryFilters } from "@/lib/application/timer";
import type { TimerSessionRecord } from "@/types/database";

async function getDb() {
  const { getDb: loadDb } = await import("@/lib/db/db");
  return loadDb();
}

export function useTimerHistory(initialFilters: TimerHistoryFilters = {}) {
  const [filters, setFilters] = useState<TimerHistoryFilters>(initialFilters);
  const [sessions, setSessions] = useState<TimerSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = await getDb();
      const { getTimerHistory } = await import("@/lib/application/timer");
      setSessions(await getTimerHistory(db, filters));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    filters,
    setFilters,
    sessions,
    isLoading,
    error,
    refresh,
  };
}
