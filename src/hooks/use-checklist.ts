"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChecklistSession } from "@/types/database";

export type UseChecklistResult = {
  session: ChecklistSession | null;
  history: ChecklistSession[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

async function loadChecklistData(): Promise<{
  session: ChecklistSession | null;
  history: ChecklistSession[];
}> {
  const { getDb } = await import("@/lib/db/db");
  const { getLatestChecklistSession, listChecklistSessions } =
    await import("@/lib/application/checklist/checklist-use-cases");
  const db = getDb();
  const [session, history] = await Promise.all([
    getLatestChecklistSession(db),
    listChecklistSessions(db),
  ]);
  return { session, history };
}

export function useChecklist(): UseChecklistResult {
  const [session, setSession] = useState<ChecklistSession | null>(null);
  const [history, setHistory] = useState<ChecklistSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadChecklistData()
      .then((data) => {
        if (!cancelled) {
          setSession(data.session);
          setHistory(data.history);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro ao carregar checklist.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  return { session, history, isLoading, error, refresh };
}

export function useChecklistActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn();
        onSuccess?.();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  const newSession = useCallback(
    (label?: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { createChecklistSession } =
          await import("@/lib/application/checklist/checklist-use-cases");
        return createChecklistSession(getDb(), label);
      }),
    [wrap],
  );

  const toggleItem = useCallback(
    (sessionId: string, itemId: string, checked: boolean) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { toggleChecklistItem } =
          await import("@/lib/application/checklist/checklist-use-cases");
        await toggleChecklistItem(getDb(), sessionId, itemId, checked);
      }),
    [wrap],
  );

  const addCustomItem = useCallback(
    (sessionId: string, group: string, text: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { addCustomChecklistItem } =
          await import("@/lib/application/checklist/checklist-use-cases");
        await addCustomChecklistItem(getDb(), sessionId, group, text);
      }),
    [wrap],
  );

  const resetSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { resetChecklistSession } =
          await import("@/lib/application/checklist/checklist-use-cases");
        await resetChecklistSession(getDb(), sessionId);
      }),
    [wrap],
  );

  const deleteSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { deleteChecklistSession } =
          await import("@/lib/application/checklist/checklist-use-cases");
        await deleteChecklistSession(getDb(), sessionId);
      }),
    [wrap],
  );

  return { isLoading, error, newSession, toggleItem, addCustomItem, resetSession, deleteSession };
}
