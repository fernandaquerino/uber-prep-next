"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Check, Clock, Edit3, Eye, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoteMarkdown } from "./note-markdown";
import { NoteToolbar } from "./note-toolbar";
import { NoteTemplateDialog } from "./note-template-dialog";
import { NoteHistoryDialog } from "./note-history-dialog";
import type { NoteRecord, NoteVersion } from "@/types/database";
import { cn } from "@/lib/utils";

const AUTOSAVE_DELAY = 1500;
const EDITOR_MODE_KEY = "notes:editor-mode";

type EditorMode = "edit" | "split" | "preview";
type SaveStatus = "saved" | "saving" | "dirty" | "error";

const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  saved: "salvo automaticamente",
  saving: "salvando...",
  dirty: "não salvo",
  error: "erro ao salvar",
};

type NoteEditorProps = {
  note: NoteRecord | null;
  versions: NoteVersion[];
  onSave: (id: string, title: string, content: string) => Promise<void>;
  onCreateVersion: (noteId: string, reason: NoteVersion["reason"]) => Promise<void>;
  onRestoreVersion: (noteId: string, versionId: string) => Promise<void>;
};

function getInitialMode(): EditorMode {
  if (typeof window === "undefined") return "edit";
  const stored = localStorage.getItem(EDITOR_MODE_KEY);
  if (stored === "edit" || stored === "split" || stored === "preview") return stored;
  return "edit";
}

export function NoteEditor(props: NoteEditorProps) {
  // Use a key on the inner component to reset all state when the note changes.
  // This avoids calling setState inside a useEffect (lint rule react-hooks/set-state-in-effect).
  return <NoteEditorInner key={props.note?.id ?? "empty"} {...props} />;
}

function NoteEditorInner({
  note,
  versions,
  onSave,
  onCreateVersion,
  onRestoreVersion,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [editorMode, setEditorMode] = useState<EditorMode>(getInitialMode);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [showTemplate, setShowTemplate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef<string | null>(note?.id ?? null);
  const pendingSaveRef = useRef<{ title: string; content: string } | null>(null);

  // Flush autosave before unmount.
  // We capture the refs by referencing the ref objects (not .current) so the lint rule is satisfied.
  useEffect(() => {
    const timer = autosaveTimer;
    const pending = pendingSaveRef;
    const noteId = noteIdRef;

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      const save = pending.current;
      const id = noteId.current;
      if (save && id) {
        void onSave(id, save.title, save.content);
      }
    };
    // onSave is stable (wrapped in useCallback by the parent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleAutosave = useCallback(
    (newTitle: string, newContent: string) => {
      pendingSaveRef.current = { title: newTitle, content: newContent };
      setSaveStatus("dirty");

      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }

      autosaveTimer.current = setTimeout(async () => {
        const id = noteIdRef.current;
        if (!id) return;
        setSaveStatus("saving");
        try {
          await onSave(id, newTitle, newContent);
          pendingSaveRef.current = null;
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }, AUTOSAVE_DELAY);
    },
    [onSave],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      scheduleAutosave(value, content);
    },
    [content, scheduleAutosave],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      scheduleAutosave(title, value);
    },
    [title, scheduleAutosave],
  );

  const handleManualSave = useCallback(async () => {
    const id = noteIdRef.current;
    if (!id) return;

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    pendingSaveRef.current = null;

    setSaveStatus("saving");
    try {
      await onCreateVersion(id, "manual");
      await onSave(id, title, content);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [title, content, onCreateVersion, onSave]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "b") {
        e.preventDefault();
        // Bold
        const el = editorRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = content.slice(start, end) || "negrito";
        const replacement = `**${selected}**`;
        const newContent = content.slice(0, start) + replacement + content.slice(end);
        handleContentChange(newContent);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + 2, start + 2 + selected.length);
        });
      } else if (isMeta && e.key === "i") {
        e.preventDefault();
        // Italic
        const el = editorRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = content.slice(start, end) || "itálico";
        const replacement = `_${selected}_`;
        const newContent = content.slice(0, start) + replacement + content.slice(end);
        handleContentChange(newContent);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + 1, start + 1 + selected.length);
        });
      } else if (isMeta && e.key === "s") {
        e.preventDefault();
        void handleManualSave();
      }
    },
    [content, handleContentChange, handleManualSave],
  );

  const setMode = useCallback((m: EditorMode) => {
    setEditorMode(m);
    try {
      localStorage.setItem(EDITOR_MODE_KEY, m);
    } catch {
      // ignore
    }
  }, []);

  const handleApplyTemplate = useCallback(
    (contentOrUpdater: string | ((current: string) => string)) => {
      const id = noteIdRef.current;
      if (!id) return;

      // Save version before applying template
      void onCreateVersion(id, "before_template");

      const newContent =
        typeof contentOrUpdater === "function" ? contentOrUpdater(content) : contentOrUpdater;
      handleContentChange(newContent);
    },
    [content, handleContentChange, onCreateVersion],
  );

  const handleRestoreVersion = useCallback(
    async (versionId: string) => {
      const id = noteIdRef.current;
      if (!id) return;
      await onRestoreVersion(id, versionId);
    },
    [onRestoreVersion],
  );

  // if (!note) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
  //       <Edit3 className="h-8 w-8 opacity-30" />
  //       <p className="text-sm">Selecione ou crie uma nota para editar.</p>
  //     </div>
  //   );
  // }

  const noteVersions = versions.filter((v) => v.noteId === note?.id);

  return (
    <div className="border-border bg-background flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="border-border bg-muted/20 flex items-center justify-between gap-2 border-b px-3 py-2">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título da nota"
          className="h-8 border-none bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
          aria-label="Título da nota"
        />

        <div className="flex shrink-0 items-center gap-1">
          {/* Mode buttons */}
          <div className="border-border flex overflow-hidden rounded-md border">
            {(["edit", "split", "preview"] as EditorMode[]).map((m) => {
              const icons = {
                edit: <Edit3 className="h-3.5 w-3.5" />,
                split: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
                preview: <Eye className="h-3.5 w-3.5" />,
              };
              const labels = { edit: "Editar", split: "Dividir", preview: "Preview" };
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  title={labels[m]}
                  aria-label={labels[m]}
                  aria-pressed={editorMode === m}
                  className={cn(
                    "px-2 py-1 text-xs transition-colors",
                    editorMode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {icons[m]}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => setShowHistory(true)}
            aria-label="Ver histórico de versões"
          >
            <Clock className="h-3.5 w-3.5" />
            {noteVersions.length > 0 && (
              <span className="text-muted-foreground">{noteVersions.length}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {editorMode !== "preview" && (
        <NoteToolbar
          editorRef={editorRef}
          value={content}
          onChange={handleContentChange}
          onInsertTemplate={() => setShowTemplate(true)}
        />
      )}

      {/* Editor body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {(editorMode === "edit" || editorMode === "split") && (
          <Textarea
            ref={editorRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Comece a escrever em markdown..."
            className={cn(
              "h-full min-h-[400px] flex-1 resize-none rounded-none border-none font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0",
              editorMode === "split" ? "border-border border-r" : "",
            )}
            aria-label="Conteúdo da nota"
          />
        )}

        {(editorMode === "split" || editorMode === "preview") && (
          <div className="flex-1 overflow-y-auto p-4">
            <NoteMarkdown content={content} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-border bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-3 py-1.5 text-xs">
        <span className="flex items-center gap-1.5">
          {saveStatus === "saved" && <Check className="h-3 w-3 text-green-500" />}
          {SAVE_STATUS_LABELS[saveStatus]} · suporta markdown
        </span>
        <span>{content.length} caracteres</span>
      </div>

      {/* Dialogs */}
      <NoteTemplateDialog
        open={showTemplate}
        hasContent={!!content.trim()}
        onClose={() => setShowTemplate(false)}
        onApply={handleApplyTemplate}
      />

      <NoteHistoryDialog
        open={showHistory}
        versions={noteVersions}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}
