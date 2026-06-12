"use client";

import { useCallback, useRef } from "react";
import { Clock3, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTimer } from "@/hooks/use-timer";
import { playTimerDing } from "@/lib/utils/timerSound";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { TimerDisplay } from "./timer-display";
import { TimerPanel } from "./timer-panel";

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

  return (
    <>
      <div className="flex items-center gap-1">
        {active ? (
          <div className="border-border bg-background hidden items-center gap-2 rounded-md border px-2 py-1 md:flex">
            <span className={`h-2 w-2 rounded-full ${visual?.dot ?? "bg-muted-foreground"}`} />
            <button
              type="button"
              className="max-w-[180px] truncate text-left text-xs font-medium"
              onClick={() => setPanelOpen(true)}
              aria-label={`Abrir timer: ${active.title}`}
            >
              {active.title}
            </button>
            <TimerDisplay
              activeTimer={active}
              size="compact"
              onCountdownComplete={handleCountdownComplete}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                active.status === "running" ? void actions.pause() : void actions.resume()
              }
              aria-label={active.status === "running" ? "Pausar timer" : "Retomar timer"}
            >
              {active.status === "running" ? (
                <Pause className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden />
              )}
            </Button>
          </div>
        ) : null}

        <Button
          variant={active ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPanelOpen(true)}
          aria-label={active ? "Abrir timer ativo" : "Abrir timer"}
        >
          <Clock3 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{active ? "Timer" : "Foco"}</span>
        </Button>
      </div>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-[min(440px,100vw)] overflow-y-auto p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Timer e foco</SheetTitle>
            <SheetDescription>Painel global do timer de estudo.</SheetDescription>
          </SheetHeader>
          <TimerPanel />
        </SheetContent>
      </Sheet>
    </>
  );
}
