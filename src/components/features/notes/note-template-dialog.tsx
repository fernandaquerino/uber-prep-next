"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/domain/notes/note-templates";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";

type ConfirmAction = "replace" | "append";

type NoteTemplateDialogProps = {
  open: boolean;
  hasContent: boolean;
  onClose: () => void;
  onApply: (contentOrUpdater: string | ((current: string) => string)) => void;
};

export function NoteTemplateDialog({
  open,
  hasContent,
  onClose,
  onApply,
}: NoteTemplateDialogProps) {
  const [confirmTemplate, setConfirmTemplate] = useState<NoteTemplate | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const handleSelectTemplate = (template: NoteTemplate) => {
    if (!hasContent) {
      onApply(template.content);
      onClose();
      return;
    }
    setConfirmTemplate(template);
  };

  const handleConfirm = (action: ConfirmAction) => {
    if (!confirmTemplate) return;
    setConfirmAction(action);

    if (action === "replace") {
      onApply(confirmTemplate.content);
    } else {
      const tc = confirmTemplate.content;
      onApply((current: string) => (current.trimEnd() ? current.trimEnd() + "\n\n" + tc : tc));
    }

    setConfirmTemplate(null);
    setConfirmAction(null);
    onClose();
  };

  const handleClose = () => {
    setConfirmTemplate(null);
    setConfirmAction(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        {confirmTemplate ? (
          <>
            <DialogHeader>
              <DialogTitle>Aplicar template</DialogTitle>
              <DialogDescription>
                A nota já possui conteúdo. O que você deseja fazer?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={() => handleConfirm("replace")}
                disabled={!!confirmAction}
              >
                Substituir conteúdo
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleConfirm("append")}
                disabled={!!confirmAction}
              >
                Inserir no final
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Templates de notas</DialogTitle>
              <DialogDescription>
                Selecione um template para aplicar à nota atual.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-2">
              {NOTE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template)}
                  className="border-border hover:bg-muted flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors"
                >
                  <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    {template.category && (
                      <p className="text-muted-foreground text-xs">
                        {getCategoryLabel(template.category)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
