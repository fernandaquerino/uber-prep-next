"use client";

import { useState } from "react";
import { Bell, BellOff, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTimer } from "@/hooks/use-timer";
import { formatTimerDuration } from "@/lib/domain/timer";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { TimerControls } from "./timer-controls";
import { TimerDisplay } from "./timer-display";
import { TimerHistory } from "./timer-history";
import { TimerManualEntryDialog } from "./timer-manual-entry-dialog";
import { TimerSessionForm } from "./timer-session-form";

export function TimerPanel() {
  const { data, status, error, isRefreshing, refresh, actions } = useTimer();
  const [manualOpen, setManualOpen] = useState(false);

  if (status === "loading") {
    return <div className="text-muted-foreground p-4 text-sm">Carregando timer…</div>;
  }

  if (status === "error") {
    return (
      <div className="grid gap-3 p-4">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={() => void refresh()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const active = data.activeTimer;

  return (
    <div className="grid gap-5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Timer e foco</h2>
          <p className="text-muted-foreground text-sm">
            Tempo oficial de estudo, separado das métricas internas de quizzes e playground.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isRefreshing}
          onClick={() => void refresh()}
          aria-label="Atualizar timer"
        >
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
        </Button>
      </div>

      <section className="grid gap-3 rounded-lg border p-4" aria-live="polite">
        {active ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{active.title}</p>
                <p className="text-muted-foreground text-xs">
                  {getCategoryVisual(active.category).label} ·{" "}
                  {active.status === "running" ? "Rodando" : "Pausado"}
                </p>
              </div>
              <TimerDisplay activeTimer={active} />
            </div>
            <TimerControls activeTimer={active} />
          </>
        ) : (
          <>
            <p className="font-medium">Nenhuma sessão em andamento.</p>
            <TimerSessionForm />
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <SummaryCard label="Hoje" value={formatTimerDuration(data.todaySummary.totalSeconds)} />
        <SummaryCard label="Semana" value={formatTimerDuration(data.weekSummary.totalSeconds)} />
        <SummaryCard label="Sessões hoje" value={String(data.todaySummary.sessionCount)} />
        <SummaryCard
          label="Média"
          value={formatTimerDuration(data.weekSummary.averageSessionSeconds)}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Adicionar manual
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void actions.updateSettings({ soundEnabled: !data.settings.soundEnabled })}
        >
          {data.settings.soundEnabled ? (
            <Bell className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <BellOff className="h-3.5 w-3.5" aria-hidden />
          )}
          Som {data.settings.soundEnabled ? "ligado" : "desligado"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void actions.requestNotifications()}>
          Notificações
        </Button>
      </div>

      <Separator />

      <TimerHistory sessions={data.recentSessions} />

      <TimerManualEntryDialog open={manualOpen} onOpenChange={setManualOpen} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="bg-card rounded-lg border p-3">
      <p className="font-mono text-xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </article>
  );
}
