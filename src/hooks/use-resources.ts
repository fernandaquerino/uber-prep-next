"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResourcePageData } from "@/lib/domain/resources";

async function loadResourcePageData(): Promise<ResourcePageData> {
  const { getDb } = await import("@/lib/db/db");
  const { getResourcePageData } = await import("@/lib/application/resources");
  return getResourcePageData(getDb());
}

export type UseResourcesResult = {
  data: ResourcePageData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useResources(): UseResourcesResult {
  const [data, setData] = useState<ResourcePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadResourcePageData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar recursos.");
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
