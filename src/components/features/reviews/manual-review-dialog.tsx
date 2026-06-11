"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";

type Props = {
  open: boolean;
  onClose: () => void;
  actions: UseReviewActionsResult;
};

export function ManualReviewDialog({ open, onClose, actions }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setTitle("");
    setScheduledFor(today);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await actions.createManualReview({
        title: title.trim(),
        scheduledFor: parseCalendarDate(scheduledFor) as CalendarDate,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar revisão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="manual-review-desc">
        <DialogHeader>
          <DialogTitle>Adicionar revisão manual</DialogTitle>
          <DialogDescription id="manual-review-desc">
            Crie uma revisão para qualquer tópico sem vínculo com o plano.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-title">Tópico</Label>
            <Input
              id="manual-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Two Pointers, useEffect, STAR method…"
              aria-describedby={error ? "manual-title-error" : undefined}
            />
            {error && (
              <p id="manual-title-error" className="text-destructive text-xs" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-date">Data de revisão</Label>
            <input
              id="manual-date"
              type="date"
              className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={today}
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Criando…" : "Criar revisão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
