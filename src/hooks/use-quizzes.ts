"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuizzesPageData } from "@/lib/application/quizzes";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

async function loadQuizzesData(): Promise<QuizzesPageData> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { getQuizzesPageData } = await import("@/lib/application/quizzes");
  const db = getDb();
  await runSeeds(db);
  return getQuizzesPageData(db, getTodayCalendarDate());
}

export function useQuizzes() {
  const [data, setData] = useState<QuizzesPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadQuizzesData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar quizzes.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRev((value) => value + 1);
  }, []);

  return { data, isLoading, isRefreshing, error, refresh };
}
