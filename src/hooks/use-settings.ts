"use client";

import { useState, useEffect, useCallback } from "react";
import type { SettingsRecord, TimerSettingsRecord } from "@/types/database";

type SettingsData = {
  settings: SettingsRecord;
  timerSettings: TimerSettingsRecord;
};

async function loadAllSettings(): Promise<SettingsData> {
  const { getDb } = await import("@/lib/db/db");
  const { getAllSettings } = await import("@/lib/application/settings");
  return getAllSettings(getDb());
}

export type UseSettingsResult = {
  data: SettingsData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useSettings(): UseSettingsResult {
  const [data, setData] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadAllSettings()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar configurações.");
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
