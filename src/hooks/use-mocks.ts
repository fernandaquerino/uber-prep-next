"use client";

import { useState, useEffect, useCallback } from "react";
import type { MocksPageData } from "@/lib/application/mocks";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

export type UseMocksResult = {
  data: MocksPageData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

async function loadMocksData(): Promise<MocksPageData> {
  const { getDb } = await import("@/lib/db/db");
  const { getMocksPageData } = await import("@/lib/application/mocks");
  const db = getDb();
  return getMocksPageData(db, getTodayCalendarDate());
}

export function useMocks(): UseMocksResult {
  const [data, setData] = useState<MocksPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadMocksData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar mocks.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  return { data, isLoading, error, refresh };
}
