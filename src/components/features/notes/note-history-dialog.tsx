"use client";

import { useState } from "react";
import { Clock, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteMarkdown } from "./note-markdown";
import type { NoteVersion } from "@/types/database";

const REASON_LABELS: Record<NoteVersion["reason"], string> = {
  manual: "Salvo manualmente",
  before_template: "Antes de aplicar template",
  before_restore: "Antes de restaurar versão",
  restore: "Restauração",
};

type NoteHistoryDialogProps = {
  open: boolean;
  versions: NoteVersion[];
  onClose: () => void;
  onRestore: (versionId: string) => void;
};

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function NoteHistoryDialog({
  open,
  versions,
  onClose,
  onRestore,
}: NoteHistoryDialogProps) {
  const [previewVersion, setPreviewVersion] = useState<NoteVersion | null>(null);

  const sorted = [...versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleRestore = (version: NoteVersion) => {
    onRestore(version.id);
    onClose();
    setPreviewVersion(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de versões
          </DialogTitle>
          <DialogDescription>
            {sorted.length === 0
              ? "Nenhuma versão salva ainda. Use Cmd+S para salvar uma versão manualmente."
              : `${sorted.length} versão(ões) salva(s).`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
          {/* Version list */}
          <div className="w-64 shrink-0 overflow-y-auto border-r border-border pr-3 space-y-1">
            {sorted.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma versão ainda.
              </p>
            )}
            {sorted.map((version) => {
              const isSelected = previewVersion?.id === version.id;
              return (
                <div
                  key={version.id}
                  className={`rounded-md p-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPreviewVersion(version)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setPreviewVersion(version)}
                  aria-current={isSelected ? "true" : undefined}
                >
                  <p className="text-xs font-medium text-foreground truncate">{version.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(version.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {REASON_LABELS[version.reason] ?? version.reason}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Preview pane */}
          <div className="flex-1 overflow-y-auto">
            {previewVersion ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{previewVersion.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(previewVersion.createdAt)} ·{" "}
                      {REASON_LABELS[previewVersion.reason] ?? previewVersion.reason}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(previewVersion)}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restaurar
                  </Button>
                </div>
                <div className="rounded-md border border-border p-4 bg-muted/20 overflow-auto max-h-80">
                  <NoteMarkdown content={previewVersion.content} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Eye className="h-8 w-8 opacity-30" />
                <p className="text-sm">Selecione uma versão para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
