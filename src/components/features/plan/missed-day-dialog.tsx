"use client";

import { useState } from "react";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { HandleMissedStudyDayInput, MissedDayStrategy } from "@/lib/domain/progress";
import { DEFAULT_WEEKDAY_AVAILABILITY } from "@/lib/domain/schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCalendarDate } from "./plan-utils";
import { cn } from "@/lib/utils";

type MissedDayDialogProps = {
  missedDate: CalendarDate | null;
  today: CalendarDate;
  open: boolean;
  onConfirm: (input: Omit<HandleMissedStudyDayInput, "now">) => Promise<void>;
  onClose: () => void;
};

const STRATEGIES: { value: MissedDayStrategy; label: string; description: string }[] = [
  {
    value: "shift_pending",
    label: "Mover plano para frente",
    description:
      "Os conteúdos pendentes serão movidos para os próximos dias disponíveis, preservando a ordem e os dias de descanso.",
  },
  {
    value: "keep_overdue",
    label: "Manter atrasado",
    description: "Os conteúdos continuam nas datas originais e aparecerão como atrasados.",
  },
  {
    value: "skip_items",
    label: "Pular conteúdos",
    description: "Os conteúdos serão marcados como pulados e não contarão como concluídos.",
  },
  {
    value: "reschedule_items",
    label: "Reagendar individualmente",
    description: "Escolha uma nova data para cada conteúdo pendente.",
  },
];

export function MissedDayDialog({
  missedDate,
  today,
  open,
  onConfirm,
  onClose,
}: MissedDayDialogProps) {
  const [selected, setSelected] = useState<MissedDayStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!missedDate) return null;

  async function handleConfirm() {
    if (!selected || !missedDate) return;
    setError(null);
    setLoading(true);
    try {
      await onConfirm({
        missedDate,
        today,
        strategy: selected,
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
      });
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dia perdido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby="missed-day-desc">
        <DialogHeader>
          <DialogTitle>Dia não estudado</DialogTitle>
          <DialogDescription id="missed-day-desc">
            {formatCalendarDate(missedDate)} — escolha o que fazer com os conteúdos pendentes.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-2"
          role="radiogroup"
          aria-label="Estratégia para dia perdido"
        >
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy.value}
              type="button"
              role="radio"
              aria-checked={selected === strategy.value}
              onClick={() => setSelected(strategy.value)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                selected === strategy.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span className="text-sm font-medium">{strategy.label}</span>
              <span className="text-muted-foreground text-xs">{strategy.description}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !selected}>
            {loading ? "Processando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
