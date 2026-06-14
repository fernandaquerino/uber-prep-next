"use client";

import { useState } from "react";
import { Download, History, MoreVertical, Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { cn } from "@/lib/utils";
import type { NoteRecord, NoteVersion } from "@/types/database";
import { NoteMarkdown } from "./note-markdown";
import { NoteHistoryDialog } from "./note-history-dialog";

type NoteDetailProps = {
  note: NoteRecord;
  versions: NoteVersion[];
  initialMode?: "view" | "edit";
  onSave: (id: string, input: { title: string; content: string; tags: string[] }) => Promise<void>;
  onCreateVersion: (noteId: string, reason: NoteVersion["reason"]) => Promise<void>;
  onRestoreVersion: (noteId: string, versionId: string) => Promise<void>;
  onExport: () => void;
  onDelete: () => void;
};

export function NoteDetail(props: NoteDetailProps) {
  // Reset all local state when switching notes (avoids setState-in-effect).
  return <NoteDetailInner key={props.note.id} {...props} />;
}

function NoteDetailInner({
  note,
  versions,
  initialMode = "view",
  onSave,
  onCreateVersion,
  onRestoreVersion,
  onExport,
  onDelete,
}: NoteDetailProps) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagsInput, setTagsInput] = useState(note.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const visual = getCategoryVisual(note.category ?? "general");
  const noteVersions = versions.filter((v) => v.noteId === note.id);

  async function handleSave() {
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await onCreateVersion(note.id, "manual");
      await onSave(note.id, { title: title.trim() || "Sem título", content, tags });
      setMode("view");
    } finally {
      setSaving(false);
    }
  }

  function handleRestore(versionId: string) {
    return onRestoreVersion(note.id, versionId);
  }

  const tags = note.tags;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b-border flex items-start justify-between gap-4 border-b px-6 py-5">
        <div className="min-w-0 flex-1">
          {mode === "edit" ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota"
              aria-label="Título da nota"
              className="h-auto border-none bg-transparent px-0 text-xl font-bold shadow-none focus-visible:ring-0"
            />
          ) : (
            <h2 className="text-text-primary truncate text-xl font-bold">{note.title}</h2>
          )}

          {/* Category + tags */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="border-border text-text-secondary inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs">
              <span className={cn("size-1.5 rounded-full", visual.dot)} aria-hidden />
              {visual.label}
            </span>

            {mode === "edit" ? (
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tags separadas por vírgula"
                aria-label="Tags"
                className="h-7 max-w-xs flex-1 text-xs"
              />
            ) : (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-muted text-text-muted rounded-md px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {mode === "edit" ? (
            <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
              <Save aria-hidden />
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setMode("edit")}>
              <Pencil aria-hidden />
              Editar
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            aria-label="Histórico de versões"
          >
            <History aria-hidden />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="Mais ações" />}
            >
              <MoreVertical aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                <Download aria-hidden />
                Exportar .md
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 aria-hidden />
                Excluir nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {mode === "edit" ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever em markdown…"
            aria-label="Conteúdo da nota"
            className="bg-surface-muted/40 h-full min-h-[60vh] w-full resize-none rounded-xl font-mono text-sm leading-relaxed"
          />
        ) : (
          <NoteMarkdown content={note.content} />
        )}
      </div>

      <NoteHistoryDialog
        open={showHistory}
        versions={noteVersions}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestore}
      />
    </div>
  );
}
