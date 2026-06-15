"use client";

import { useMemo, useState } from "react";
import { Minimize2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/use-timer";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import {
  formatTimerDuration,
  getActiveTimerElapsedSeconds,
  getCountdownRemainingSeconds,
} from "@/lib/domain/timer";
import type { ActiveTimerRecord } from "@/types/database";
import { useTimerNow } from "./timer-display";
import { TimerSessionEnd } from "./timer-session-end";

type Props = {
  activeTimer: ActiveTimerRecord;
  onMinimize: () => void;
  onFinished: () => void;
};

/** Parse the structured notes written by the focus form. */
function parseFocusNotes(notes?: string): { goal?: string; activity?: string } {
  if (!notes) return {};
  const result: { goal?: string; activity?: string } = {};
  for (const line of notes.split("\n")) {
    const goal = line.match(/^Objetivo:\s*(.+)$/);
    const activity = line.match(/^Atividade:\s*(.+)$/);
    if (goal) result.goal = goal[1].trim();
    if (activity) result.activity = activity[1].trim();
  }
  return result;
}

export function TimerFocusExpanded({ activeTimer, onMinimize, onFinished }: Props) {
  const { actions } = useTimer();
  const [quickNote, setQuickNote] = useState("");
  const [showEnd, setShowEnd] = useState(false);

  const now = useTimerNow(activeTimer);
  const paused = activeTimer.status === "paused";
  const visual = getCategoryVisual(activeTimer.category);
  const { goal } = parseFocusNotes(activeTimer.notes);

  const elapsed = useMemo(() => getActiveTimerElapsedSeconds(activeTimer, now), [activeTimer, now]);
  const remaining = useMemo(
    () => getCountdownRemainingSeconds(activeTimer, now) ?? 0,
    [activeTimer, now],
  );
  const target = activeTimer.targetDurationSeconds ?? 0;
  const pct = target > 0 ? Math.min(100, (elapsed / target) * 100) : 0;
  const targetMinutes = Math.round(target / 60);

  if (showEnd) {
    return (
      <TimerSessionEnd
        activeTimer={activeTimer}
        elapsedSeconds={elapsed}
        quickNote={quickNote}
        onContinue={() => setShowEnd(false)}
        onSaved={onFinished}
      />
    );
  }

  return (
    <div className="flex flex-col items-center px-10 py-9 text-center">
      {/* Category pill */}
      <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
        <span className={cn("rounded-md border px-3 py-1 text-xs font-medium", visual.badge)}>
          {visual.label}
        </span>
        {activeTimer.title && (
          <span className="text-secondary-foreground text-[13px]">/ {activeTimer.title}</span>
        )}
      </div>

      {/* Goal */}
      {goal && (
        <p className="bg-surface-muted text-muted-foreground mb-6 rounded-lg px-4 py-2 text-xs leading-relaxed italic">
          “{goal}”
        </p>
      )}

      {/* Circular timer */}
      <div className={cn("mb-5", paused ? "text-warning" : visual.text)}>
        <CircularProgress value={pct} paused={paused}>
          <div className="font-mono">
            <div className="text-foreground font-mono text-4xl font-bold tabular-nums">
              {formatTimerDuration(remaining)}
            </div>
            <div className="text-muted-foreground mt-1 font-mono text-xs tracking-[0.05em]">
              {paused ? "PAUSADO" : remaining === 0 ? "CONCLUÍDO" : `/ ${targetMinutes}min`}
            </div>
          </div>
        </CircularProgress>
      </div>

      {/* Controls */}
      <div className="mb-7 flex items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={() => (paused ? void actions.resume() : void actions.pause())}
          aria-label={paused ? "Retomar" : "Pausar"}
          className={cn(
            "flex h-15 w-15 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105",
            paused ? "bg-success" : "bg-primary",
          )}
        >
          {paused ? (
            <Play className="size-6" aria-hidden />
          ) : (
            <Pause className="size-6" aria-hidden />
          )}
        </button>
        <Button variant="outline" size="lg" onClick={() => setShowEnd(true)}>
          Finalizar
        </Button>
      </div>

      {/* Quick note */}
      <textarea
        name="timer-note"
        value={quickNote}
        onChange={(event) => setQuickNote(event.target.value)}
        placeholder="Anotação rápida… (não interrompe o timer)"
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-15 w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none focus-visible:ring-3"
      />

      <button
        type="button"
        onClick={onMinimize}
        className="text-muted-foreground hover:text-foreground mt-3.5 flex cursor-pointer items-center gap-1.5 text-[11px] transition-colors"
      >
        <Minimize2 className="size-3" aria-hidden />
        Minimizar · timer continua rodando
      </button>
    </div>
  );
}

function CircularProgress({
  value,
  paused,
  children,
}: {
  value: number;
  paused: boolean;
  children: React.ReactNode;
}) {
  const size = 180;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-border"
          stroke="currentColor"
          opacity={0.25}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="#ff6363"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "drop-shadow-[0_0_6px_var(--primary)] transition-[stroke-dashoffset] duration-500",
            !paused && "drop-shadow-sm",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
