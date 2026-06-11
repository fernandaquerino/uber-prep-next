"use client";

import { useState } from "react";
import type { CalendarDate, ScheduledStudyDay } from "@/lib/domain/schedule";
import {
  parseCalendarDate,
  isValidCalendarDate,
  buildStudySchedule,
  DEFAULT_WEEKDAY_AVAILABILITY,
} from "@/lib/domain/schedule";
import type { ChangeStartDateOption } from "@/lib/application/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCalendarDate } from "./plan-utils";
import { cn } from "@/lib/utils";

type ChangeStartDateDialogProps = {
  currentStartDate: CalendarDate;
  hasProgress: boolean;
  open: boolean;
  onConfirm: (input: {
    newStartDate: CalendarDate;
    newBaseSchedule: ScheduledStudyDay[];
    option: ChangeStartDateOption;
  }) => Promise<void>;
  onClose: () => void;
};

type Option = { value: ChangeStartDateOption; label: string; description: string };

const OPTIONS_WITH_PROGRESS: Option[] = [
  {
    value: "recalculate_maintaining",
    label: "Recalcular mantendo progresso",
    description:
      "Blocos concluídos e histórico são preservados. Blocos pendentes ganham novas datas.",
  },
  {
    value: "restart",
    label: "Reiniciar plano",
    description:
      "Todo o progresso será apagado e o plano começa do zero na nova data. Esta ação não pode ser desfeita.",
  },
];

export function ChangeStartDateDialog({
  currentStartDate,
  hasProgress,
  open,
  onConfirm,
  onClose,
}: ChangeStartDateDialogProps) {
  const [newDate, setNewDate] = useState(currentStartDate);
  const [option, setOption] = useState<ChangeStartDateOption>("recalculate_maintaining");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    if (!isValidCalendarDate(newDate)) {
      setError("Data inválida.");
      return;
    }
    const parsed = parseCalendarDate(newDate);

    let newBaseSchedule: ScheduledStudyDay[];
    try {
      newBaseSchedule = buildStudySchedule(STUDY_PLAN, {
        startDate: parsed,
        timezone: "America/Sao_Paulo",
        weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
      });
    } catch {
      setError("Não foi possível calcular o novo cronograma para esta data.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm({ newStartDate: parsed, newBaseSchedule, option });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar data de início.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="change-date-desc">
        <DialogHeader>
          <DialogTitle>Alterar data de início</DialogTitle>
          <DialogDescription id="change-date-desc">
            Data atual: <strong>{formatCalendarDate(currentStartDate)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-start-date">Nova data de início</Label>
            <Input
              id="new-start-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value as CalendarDate)}
            />
          </div>

          {hasProgress && (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Opção de alteração">
              {OPTIONS_WITH_PROGRESS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={option === opt.value}
                  onClick={() => setOption(opt.value)}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                    option === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-muted-foreground text-xs">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {option === "restart" && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              Atenção: todo o progresso será permanentemente apagado.
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={option === "restart" ? "destructive" : "default"}
          >
            {loading ? "Salvando…" : "Confirmar alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
