"use client";

import { useState } from "react";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import type { CalendarDate, ScheduledStudyDay } from "@/lib/domain/schedule";
import {
  parseCalendarDate,
  isValidCalendarDate,
  DEFAULT_WEEKDAY_AVAILABILITY,
  getWeekday,
} from "@/lib/domain/schedule";
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
import { AlertTriangleIcon } from "lucide-react";
import { formatCalendarDate, formatMinutes } from "./plan-utils";

type RescheduleDialogProps = {
  block: EffectiveScheduledBlock | null;
  baseSchedule: ScheduledStudyDay[];
  today: CalendarDate;
  open: boolean;
  onConfirm: (targetDate: CalendarDate) => Promise<void>;
  onClose: () => void;
};

export function RescheduleDialog({
  block,
  baseSchedule,
  today,
  open,
  onConfirm,
  onClose,
}: RescheduleDialogProps) {
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!block) return null;

  const availability = DEFAULT_WEEKDAY_AVAILABILITY;

  function getTargetDayInfo(dateStr: string) {
    if (!isValidCalendarDate(dateStr)) return null;
    const date = parseCalendarDate(dateStr);
    const weekday = getWeekday(date);
    const dayAvail = availability[weekday];
    const baseDay = baseSchedule.find((d) => d.date === date);
    return { date, weekday, dayAvail, baseDay };
  }

  const targetInfo = targetDate ? getTargetDayInfo(targetDate) : null;
  const isRestDay = targetInfo?.dayAvail?.enabled === false;
  const scheduledOnTarget = targetInfo?.baseDay?.totalEstimatedMinutes ?? 0;
  const afterReschedule = scheduledOnTarget + (block.estimatedMinutes ?? 0);
  const availableOnTarget = targetInfo?.dayAvail?.availableMinutes ?? 0;
  const willOverCapacity = !isRestDay && afterReschedule > availableOnTarget;

  async function handleConfirm() {
    setError(null);
    if (!isValidCalendarDate(targetDate)) {
      setError("Data inválida. Use o formato AAAA-MM-DD.");
      return;
    }
    const date = parseCalendarDate(targetDate);
    if (date < today) {
      setError("Não é possível reagendar para uma data no passado.");
      return;
    }
    if (isRestDay) {
      setError("Este dia está configurado como descanso. Escolha outro dia.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(date);
      setTargetDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reagendar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby="reschedule-desc" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reagendar bloco</DialogTitle>
          <DialogDescription id="reschedule-desc">
            {block.title} — atualmente em <strong>{formatCalendarDate(block.scheduledDate)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target-date">Nova data</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={today}
              aria-describedby="date-help"
            />
            <p id="date-help" className="text-muted-foreground text-xs">
              Data original: {formatCalendarDate(block.originalScheduledDate)}
            </p>
          </div>

          {targetInfo && !isRestDay && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                {formatCalendarDate(targetInfo.date)} — capacidade do dia
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Disponível: {formatMinutes(availableOnTarget)} · Agendado após:{" "}
                {formatMinutes(afterReschedule)}
              </p>
            </div>
          )}

          {isRestDay && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
              <AlertTriangleIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-amber-800 dark:text-amber-200">
                Este dia está configurado como descanso.
              </p>
            </div>
          )}

          {willOverCapacity && !isRestDay && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
              <AlertTriangleIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-amber-800 dark:text-amber-200">
                Este dia ficará acima da capacidade configurada.
                <br />
                Disponível: {formatMinutes(availableOnTarget)} · Após reagendamento:{" "}
                {formatMinutes(afterReschedule)}
              </p>
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
          <Button onClick={handleConfirm} disabled={loading || !targetDate || isRestDay}>
            {loading ? "Salvando…" : "Reagendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
