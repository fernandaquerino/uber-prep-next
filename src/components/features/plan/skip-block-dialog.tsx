"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type SkipBlockDialogProps = {
  blockTitle: string;
  open: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  onClose: () => void;
};

export function SkipBlockDialog({ blockTitle, open, onConfirm, onClose }: SkipBlockDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby="skip-desc">
        <DialogHeader>
          <DialogTitle>Pular conteúdo</DialogTitle>
          <DialogDescription id="skip-desc">
            &ldquo;{blockTitle}&rdquo; será marcado como pulado e não contará como concluído. Você
            poderá restaurar depois.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="skip-reason">Motivo (opcional)</Label>
          <Textarea
            id="skip-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Por que está pulando este conteúdo?"
            rows={2}
          />
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Pulando…" : "Pular conteúdo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
