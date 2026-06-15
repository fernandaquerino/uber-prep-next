"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatTimerDuration,
  getActiveTimerElapsedSeconds,
  getCountdownRemainingSeconds,
  isCountdownComplete,
} from "@/lib/domain/timer";
import type { ActiveTimerRecord } from "@/types/database";

export function useTimerNow(activeTimer?: ActiveTimerRecord | null) {
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!activeTimer || activeTimer.status === "paused") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(new Date().toISOString());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeTimer]);

  return now;
}

export function TimerDisplay({
  activeTimer,
  size = "default",
  onCountdownComplete,
}: {
  activeTimer: ActiveTimerRecord;
  size?: "compact" | "default" | "large";
  onCountdownComplete?: () => void;
}) {
  const now = useTimerNow(activeTimer);
  const elapsed = useMemo(() => getActiveTimerElapsedSeconds(activeTimer, now), [activeTimer, now]);
  const remaining = useMemo(
    () => getCountdownRemainingSeconds(activeTimer, now),
    [activeTimer, now],
  );
  const displaySeconds = activeTimer.mode === "countdown" ? (remaining ?? 0) : elapsed;

  useEffect(() => {
    if (activeTimer.status === "running" && isCountdownComplete(activeTimer, now)) {
      onCountdownComplete?.();
    }
  }, [activeTimer, now, onCountdownComplete]);

  const className = size === "large" ? "text-5xl" : size === "compact" ? "text-xs" : "text-3xl";

  return (
    <time
      className={`font-mono font-semibold tabular-nums ${className}`}
      dateTime={`PT${displaySeconds}S`}
      aria-label={
        activeTimer.mode === "countdown"
          ? `Tempo restante ${formatTimerDuration(displaySeconds)}`
          : `Tempo decorrido ${formatTimerDuration(displaySeconds)}`
      }
    >
      {formatTimerDuration(displaySeconds)}
    </time>
  );
}
