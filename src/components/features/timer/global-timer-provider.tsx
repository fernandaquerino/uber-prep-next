"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { TimerData, TimerManualSessionInput, TimerStartInput } from "@/lib/domain/timer";
import type { TimerSettingsRecord } from "@/types/database";
import type { UpdateTimerSessionInput } from "@/lib/application/timer";

type TimerActionResult<T> = Promise<T | null>;

export type TimerActions = {
  start: (input: TimerStartInput) => TimerActionResult<TimerData["activeTimer"]>;
  pause: () => TimerActionResult<TimerData["activeTimer"]>;
  resume: () => TimerActionResult<TimerData["activeTimer"]>;
  complete: (input?: {
    notes?: string;
    actualDurationSeconds?: number;
  }) => TimerActionResult<unknown>;
  stop: (input?: { notes?: string; actualDurationSeconds?: number }) => TimerActionResult<unknown>;
  cancel: () => TimerActionResult<void>;
  addManual: (input: TimerManualSessionInput) => TimerActionResult<unknown>;
  updateSession: (input: UpdateTimerSessionInput) => TimerActionResult<unknown>;
  deleteSession: (id: string) => TimerActionResult<void>;
  updateSettings: (
    input: Partial<Omit<TimerSettingsRecord, "id" | "createdAt" | "updatedAt">>,
  ) => TimerActionResult<TimerSettingsRecord>;
  requestNotifications: () => Promise<NotificationPermission | "unsupported">;
};

export type TimerContextValue = {
  data: TimerData | null;
  status: "loading" | "ready" | "error";
  error: string | null;
  isRefreshing: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  actions: TimerActions;
};

export const TimerContext = createContext<TimerContextValue | null>(null);

async function getDb() {
  const { getDb: loadDb } = await import("@/lib/db/db");
  return loadDb();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ["input", "textarea", "select"].includes(tagName);
}

export function GlobalTimerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TimerData | null>(null);
  const [status, setStatus] = useState<TimerContextValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const db = await getDb();
      const [timerApp, timerDomain] = await Promise.all([
        import("@/lib/application/timer"),
        import("@/lib/domain/timer"),
      ]);
      let next = await timerApp.getTimerData(db);
      if (
        next.activeTimer &&
        timerDomain.shouldRequireLongSessionDecision(
          next.activeTimer,
          new Date().toISOString(),
          next.settings.longSessionThresholdSeconds,
        )
      ) {
        await timerApp.pauseTimer(db);
        next = await timerApp.getTimerData(db);
        setPanelOpen(true);
        toast.info("Timer pausado para revisar uma sessão longa restaurada.");
      }
      setData(next);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao carregar timer.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) void load();
    });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const runAction = useCallback(
    async <T,>(fn: () => Promise<T>, successMessage?: string): Promise<T | null> => {
      try {
        const result = await fn();
        if (successMessage) toast.success(successMessage);
        await load();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Ação do timer falhou.";
        toast.error(message);
        setError(message);
        return null;
      }
    },
    [load],
  );

  const actions = useMemo<TimerActions>(
    () => ({
      start: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { startTimer } = await import("@/lib/application/timer");
          return startTimer(db, input);
        }, "Sessão de foco iniciada."),
      pause: () =>
        runAction(async () => {
          const db = await getDb();
          const { pauseTimer } = await import("@/lib/application/timer");
          return pauseTimer(db);
        }, "Timer pausado."),
      resume: () =>
        runAction(async () => {
          const db = await getDb();
          const { resumeTimer } = await import("@/lib/application/timer");
          return resumeTimer(db);
        }, "Timer retomado."),
      complete: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { completeTimer } = await import("@/lib/application/timer");
          return completeTimer(db, input);
        }, "Sessão registrada."),
      stop: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { stopTimer } = await import("@/lib/application/timer");
          return stopTimer(db, input);
        }, "Sessão encerrada e registrada."),
      cancel: () =>
        runAction(async () => {
          const db = await getDb();
          const { cancelTimer } = await import("@/lib/application/timer");
          await cancelTimer(db);
        }, "Timer cancelado."),
      addManual: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { addManualTimerSession } = await import("@/lib/application/timer");
          return addManualTimerSession(db, input);
        }, "Sessão manual registrada."),
      updateSession: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { updateTimerSession } = await import("@/lib/application/timer");
          return updateTimerSession(db, input);
        }, "Sessão atualizada."),
      deleteSession: (id) =>
        runAction(async () => {
          const db = await getDb();
          const { deleteTimerSession } = await import("@/lib/application/timer");
          await deleteTimerSession(db, id);
        }, "Sessão removida."),
      updateSettings: (input) =>
        runAction(async () => {
          const db = await getDb();
          const { updateTimerSettings } = await import("@/lib/application/timer");
          return updateTimerSettings(db, input);
        }),
      requestNotifications: async () => {
        if (!("Notification" in window)) return "unsupported";
        const result = await Notification.requestPermission();
        if (result === "granted") {
          await actions.updateSettings({ notificationsEnabled: true });
        }
        return result;
      },
    }),
    [runAction],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      if (event.key.toLowerCase() === "t") {
        setPanelOpen(true);
        return;
      }

      if (event.code === "Space" && data?.activeTimer) {
        event.preventDefault();
        if (data.activeTimer.status === "running") void actions.pause();
        else void actions.resume();
      }

      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, data?.activeTimer]);

  const value = useMemo<TimerContextValue>(
    () => ({
      data,
      status,
      error,
      isRefreshing,
      panelOpen,
      setPanelOpen,
      refresh: load,
      actions,
    }),
    [actions, data, error, isRefreshing, load, panelOpen, status],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
