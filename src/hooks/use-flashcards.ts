"use client";

import { useState, useEffect, useCallback } from "react";
import type { FlashcardsPageData } from "@/lib/application/flashcards";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

export type UseFlashcardsResult = {
  data: FlashcardsPageData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
};

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

async function loadFlashcardsData(): Promise<FlashcardsPageData> {
  const { getDb } = await import("@/lib/db/db");
  const { runSeeds } = await import("@/lib/db/seed");
  const { getFlashcardsPageData } = await import("@/lib/application/flashcards");

  const db = getDb();
  await runSeeds(db);

  const today = getTodayCalendarDate();
  return getFlashcardsPageData(db, today);
}

export function useFlashcards(): UseFlashcardsResult {
  const [data, setData] = useState<FlashcardsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadFlashcardsData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar flashcards.");
        }
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
    setRev((r) => r + 1);
  }, []);

  return { data, isLoading, isRefreshing, error, refresh };
}
