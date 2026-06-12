"use client";

import { useState, useEffect, useCallback } from "react";
import type { TechnicalEnglishPageData } from "@/lib/domain/technical-english";

async function loadTechnicalEnglishPageData(): Promise<TechnicalEnglishPageData> {
  const { getDb } = await import("@/lib/db/db");
  const { getTechnicalEnglishPageData } = await import(
    "@/lib/application/technical-english"
  );
  return getTechnicalEnglishPageData(getDb());
}

export type UseTechnicalEnglishResult = {
  data: TechnicalEnglishPageData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useTechnicalEnglish(): UseTechnicalEnglishResult {
  const [data, setData] = useState<TechnicalEnglishPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadTechnicalEnglishPageData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar inglês técnico.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((r) => r + 1), []);

  return { data, isLoading, error, refresh };
}
