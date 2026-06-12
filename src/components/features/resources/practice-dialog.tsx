"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TechnicalEnglishRecord } from "@/types/database";

interface PracticeDialogProps {
  item: TechnicalEnglishRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (itemId: string, response: string) => Promise<void>;
}

export function PracticeDialog({ item, open, onClose, onSave }: PracticeDialogProps) {
  const [response, setResponse] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!item || !response.trim()) return;
    setIsSaving(true);
    try {
      await onSave(item.id, response.trim());
      setResponse("");
      setShowSuggestion(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    setResponse("");
    setShowSuggestion(false);
    onClose();
  }

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Praticar — {item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Prompt / Cenário
            </p>
            <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-line">
              {item.content}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="practice-response">
              Sua resposta em inglês
            </label>
            <Textarea
              id="practice-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your answer in English..."
              rows={5}
              className="resize-none"
            />
          </div>

          {item.translation && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowSuggestion((s) => !s)}
              >
                {showSuggestion ? "Ocultar sugestão" : "Ver sugestão / tradução"}
              </Button>
              {showSuggestion && (
                <div className="bg-muted/30 text-muted-foreground mt-2 rounded p-3 text-sm whitespace-pre-line">
                  {item.translation}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!response.trim() || isSaving}>
            {isSaving ? "Salvando..." : "Salvar prática"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
