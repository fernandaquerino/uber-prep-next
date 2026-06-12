"use client";

import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimer } from "@/hooks/use-timer";
import { formatTimerDuration, getTimerSummary, TIMER_SOURCE_LABELS } from "@/lib/domain/timer";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import type { TimerSessionRecord } from "@/types/database";

export function TimerHistory({ sessions }: { sessions: TimerSessionRecord[] }) {
  const { actions } = useTimer();
  const summary = useMemo(() => getTimerSummary(sessions), [sessions]);

  async function editSession(session: TimerSessionRecord) {
    const title = window.prompt("Título da sessão", session.title);
    if (title === null) return;

    const duration = window.prompt(
      "Duração em minutos",
      String(Math.round(session.actualDurationSeconds / 60)),
    );
    if (duration === null) return;

    await actions.updateSession({
      id: session.id,
      title,
      actualDurationSeconds: Number(duration) * 60,
    });
  }

  async function deleteSession(session: TimerSessionRecord) {
    if (
      !window.confirm(
        `Excluir "${session.title}"? Esta sessão deixará de contar nas métricas de tempo.`,
      )
    ) {
      return;
    }

    await actions.deleteSession(session.id);
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="font-medium">Você ainda não registrou sessões de foco.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Sessões concluídas e registros manuais aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-3" aria-labelledby="timer-history-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="timer-history-heading" className="text-sm font-semibold">
            Histórico recente
          </h2>
          <p className="text-muted-foreground text-xs">
            {summary.sessionCount} sessões · {formatTimerDuration(summary.totalSeconds)}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {sessions.map((session) => (
          <TimerHistoryItem
            key={session.id}
            session={session}
            onEdit={() => void editSession(session)}
            onDelete={() => void deleteSession(session)}
          />
        ))}
      </div>
    </section>
  );
}

function TimerHistoryItem({
  session,
  onEdit,
  onDelete,
}: {
  session: TimerSessionRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visual = getCategoryVisual(session.category);

  return (
    <article className="bg-card rounded-lg border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Badge variant="outline" className={visual.badge}>
              {visual.label}
            </Badge>
            <Badge variant="outline">{TIMER_SOURCE_LABELS[session.sourceType]}</Badge>
            <Badge variant="outline">
              {session.status === "completed" ? "Concluída" : "Encerrada"}
            </Badge>
          </div>
          <p className="truncate text-sm font-medium">{session.title}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {new Date(session.endedAt).toLocaleString("pt-BR")} ·{" "}
            {formatTimerDuration(session.actualDurationSeconds)}
          </p>
          {session.notes && <p className="text-muted-foreground mt-1 text-xs">{session.notes}</p>}
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar sessão">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Excluir sessão">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}
