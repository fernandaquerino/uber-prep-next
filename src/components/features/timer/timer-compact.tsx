"use client";

import { useCallback, useRef } from "react";
import { Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { playTimerDing } from "@/lib/utils/timerSound";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { TimerDisplay } from "./timer-display";
import { TimerFocusForm } from "./timer-focus-form";
import { TimerFocusExpanded } from "./timer-focus-expanded";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function TimerCompact() {
  const { data, panelOpen, setPanelOpen, actions } = useTimer();
  const completedRef = useRef<string | null>(null);
  const active = data?.activeTimer ?? null;

  const handleCountdownComplete = useCallback(() => {
    const completionKey = active
      ? `${active.startedAt}:${active.targetDurationSeconds ?? 0}:${active.title}`
      : null;
    if (!active || !completionKey || completedRef.current === completionKey) return;
    completedRef.current = completionKey;

    if (data?.settings.soundEnabled) {
      playTimerDing();
    }

    if (
      data?.settings.notificationsEnabled &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Sessão concluída", {
        body: `Você completou ${active.title}.`,
      });
    }

    void actions.complete();
  }, [actions, active, data?.settings.notificationsEnabled, data?.settings.soundEnabled]);

  const visual = active ? getCategoryVisual(active.category) : null;

  console.log({ active, visual });

  return (
    <>
      <div className="flex items-center gap-1">
        {active ? (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-label={`Abrir timer: ${active.title}`}
            className={cn(
              "bg-primary-subtle border-primary text-primary hover:bg-primary-active flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-all",
              active.status === "paused" &&
                "bg-warning-subtle border-warning text-warning hover:bg-warning-subtle",
            )}
          >
            <Timer size={13} />
            <TimerDisplay
              activeTimer={active}
              size="compact"
              onCountdownComplete={handleCountdownComplete}
            />
            <span className="max-w-20 truncate text-[10px] opacity-70">· {visual?.label}</span>
            {active.status === "paused" && (
              <span className="text-[10px] opacity-70">· pausado</span>
            )}
          </button>
        ) : (
          <Button size="sm" onClick={() => setPanelOpen(true)} aria-label="Abrir timer">
            <Zap className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{active ? "Timer" : "Foco"}</span>
          </Button>
        )}
      </div>

      <Dialog open={panelOpen} onOpenChange={(open) => !open && setPanelOpen(false)}>
        <DialogContent className={cn("gap-0 p-0", active ? "sm:max-w-lg" : "sm:max-w-md")}>
          {active ? (
            <>
              <DialogTitle className="sr-only">Sessão de foco em andamento</DialogTitle>
              <DialogDescription className="sr-only">
                Controle a sessão de foco ativa: pausar, retomar ou finalizar.
              </DialogDescription>
              <TimerFocusExpanded
                activeTimer={active}
                onMinimize={() => setPanelOpen(false)}
                onFinished={() => setPanelOpen(false)}
              />
            </>
          ) : (
            <>
              <DialogHeader className="border-border flex-row items-center gap-2.5 border-b px-6 py-4">
                <span className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-[9px]">
                  <Zap className="text-primary h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="grid gap-0.5">
                  <DialogTitle>Modo Foco</DialogTitle>
                  <DialogDescription className="text-[11px]">
                    Configure sua sessão
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="px-6 pt-5 pb-6">
                <TimerFocusForm onStarted={() => setPanelOpen(false)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
