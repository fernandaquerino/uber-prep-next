"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  FullInterviewSession,
  FullInterviewStep,
  FullInterviewStepType,
} from "@/types/database";

export type UseFullInterviewResult = {
  sessions: FullInterviewSession[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

async function loadSessions(): Promise<FullInterviewSession[]> {
  const { getDb } = await import("@/lib/db/db");
  const db = getDb();
  return db.fullInterviewSessions.orderBy("createdAt").reverse().toArray();
}

export function useFullInterview(): UseFullInterviewResult {
  const [sessions, setSessions] = useState<FullInterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadSessions()
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar sessões.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  return { sessions, isLoading, error, refresh };
}

export type UseFullInterviewSessionResult = {
  session: FullInterviewSession | null;
  steps: FullInterviewStep[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useFullInterviewSession(sessionId: string | null): UseFullInterviewSessionResult {
  const [session, setSession] = useState<FullInterviewSession | null>(null);
  const [steps, setSteps] = useState<FullInterviewStep[]>([]);
  const [isLoading, setIsLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    import("@/lib/db/db")
      .then(({ getDb }) => {
        const db = getDb();
        return import("@/lib/application/full-interview/full-interview-use-cases").then(
          ({ getFullInterviewSession }) => getFullInterviewSession(db, sessionId),
        );
      })
      .then((result) => {
        if (!cancelled) {
          setSession(result?.session ?? null);
          setSteps(result?.steps ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar sessão.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  return { session, steps, isLoading, error, refresh };
}

export function useFullInterviewActions(onSuccess?: () => void) {
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

  const createSession = useCallback(
    (title: string, stepTypes?: FullInterviewStepType[]) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { createFullInterviewSession } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        return createFullInterviewSession(getDb(), title, stepTypes);
      }),
    [wrap],
  );

  const startSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { startFullInterviewSession } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        await startFullInterviewSession(getDb(), sessionId);
      }),
    [wrap],
  );

  const updateStep = useCallback(
    (
      stepId: string,
      updates: Parameters<
        (typeof import("@/lib/application/full-interview/full-interview-use-cases"))["updateFullInterviewStep"]
      >[2],
    ) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { updateFullInterviewStep } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        await updateFullInterviewStep(getDb(), stepId, updates);
      }),
    [wrap],
  );

  const advanceSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { advanceFullInterviewSession } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        await advanceFullInterviewSession(getDb(), sessionId);
      }),
    [wrap],
  );

  const completeSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { completeFullInterviewSession } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        await completeFullInterviewSession(getDb(), sessionId);
      }),
    [wrap],
  );

  const deleteSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { deleteFullInterviewSession } =
          await import("@/lib/application/full-interview/full-interview-use-cases");
        await deleteFullInterviewSession(getDb(), sessionId);
      }),
    [wrap],
  );

  return {
    isLoading,
    error,
    createSession,
    startSession,
    updateStep,
    advanceSession,
    completeSession,
    deleteSession,
  };
}
