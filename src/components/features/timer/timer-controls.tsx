"use client";

import { Pause, Play, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerActions } from "@/hooks/use-timer-actions";
import type { ActiveTimerRecord } from "@/types/database";

export function TimerControls({ activeTimer }: { activeTimer: ActiveTimerRecord }) {
  const actions = useTimerActions();

  return (
    <div className="flex flex-wrap gap-2">
      {activeTimer.status === "running" ? (
        <Button variant="outline" size="sm" onClick={() => void actions.pause()}>
          <Pause className="h-3.5 w-3.5" aria-hidden />
          Pausar
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => void actions.resume()}>
          <Play className="h-3.5 w-3.5" aria-hidden />
          Retomar
        </Button>
      )}
      <Button size="sm" onClick={() => void actions.complete()}>
        <Square className="h-3.5 w-3.5" aria-hidden />
        Concluir
      </Button>
      <Button variant="outline" size="sm" onClick={() => void actions.stop()}>
        Encerrar
      </Button>
      <Button variant="ghost" size="sm" onClick={() => void actions.cancel()}>
        <X className="h-3.5 w-3.5" aria-hidden />
        Cancelar
      </Button>
    </div>
  );
}
