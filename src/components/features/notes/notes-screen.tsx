"use client";

import { useCallback, useMemo, useState } from "react";
import { Bookmark, FileText, Plus, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/use-notes";
import { useNote } from "@/hooks/use-note";
import { useNoteActions } from "@/hooks/use-note-actions";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "@/lib/domain/notes/note.types";
import type { NoteRecord, NoteVersion } from "@/types/database";
import { NoteDetail } from "./note-detail";

function exportNote(note: NoteRecord) {
  const content = `# ${note.title}\n\n${note.content}`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NotesScreen() {
  const { data, isLoading, error, refresh } = useNotes();
  const actions = useNoteActions(refresh);

  const [search, setSearch] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNewId, setEditingNewId] = useState<string | null>(null);
  const [noteRev, setNoteRev] = useState(0);

  const selectedNote = useNote(selectedNoteId, noteRev);

  const notes = useMemo<NoteListItem[]>(() => {
    if (!data) return [];
    let list = data.notes.filter((n) => n.lifecycleStatus === "active");

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data, search]);

  const handleCreate = useCallback(async () => {
    const id = await actions.createNote({
      type: "category",
      title: "Nova nota",
      category: "general",
      tags: [],
      content: "",
      isPrimary: false,
    });
    if (id) {
      setSelectedNoteId(id);
      setEditingNewId(id);
    }
  }, [actions]);

  const handleSave = useCallback(
    async (
      id: string,
      input: { title: string; content: string; tags: string[]; category: string },
    ) => {
      await actions.updateNote(id, input);
      setNoteRev((r) => r + 1);
    },
    [actions],
  );

  const handleCreateVersion = useCallback(
    (noteId: string, reason: NoteVersion["reason"]) => actions.saveNoteVersion(noteId, reason),
    [actions],
  );

  const handleRestoreVersion = useCallback(
    async (noteId: string, versionId: string) => {
      await actions.restoreNoteVersion(noteId, versionId);
      setNoteRev((r) => r + 1);
    },
    [actions],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedNoteId) return;
    await actions.deleteNote(selectedNoteId);
    setSelectedNoteId(null);
    setEditingNewId(null);
  }, [actions, selectedNoteId]);

  const handleExport = useCallback(() => {
    if (selectedNote) exportNote(selectedNote);
  }, [selectedNote]);

  if (error) {
    return (
      <div className="border-destructive/50 bg-destructive/10 m-6 rounded-lg border p-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      {/* List panel */}
      <div className="border-r-border bg-surface flex w-80 shrink-0 flex-col border-r">
        <div className="border-b-border border-b p-3.5">
          <div className="relative">
            <SearchIcon
              className="text-text-muted absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notas…"
              aria-label="Buscar notas"
              className="text-text-primary placeholder:text-text-muted bg-surface-muted border-border focus:border-primary h-9 w-full rounded-lg border py-2 pr-3 pl-8 text-sm transition-all outline-none focus:shadow-[0_0_0_3px_var(--primary-subtle)]"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-1">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-text-muted flex flex-col items-center gap-2 px-4 py-12 text-center">
              <FileText className="size-7 opacity-40" aria-hidden />
              <p className="text-sm">
                {search.trim() ? "Nenhuma nota encontrada." : "Nenhuma nota ainda."}
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {notes.map((note) => (
                <li key={note.id}>
                  <NoteCard
                    note={note}
                    selected={note.id === selectedNoteId}
                    onSelect={() => {
                      setSelectedNoteId(note.id);
                      setEditingNewId(null);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t-border border-t p-3">
          <Button className="w-full" onClick={() => void handleCreate()}>
            <Plus aria-hidden />
            Nova nota
          </Button>
        </div>
      </div>

      {/* Detail panel */}
      <div className="bg-background min-w-0 flex-1">
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            versions={data?.versions ?? []}
            initialMode={selectedNote.id === editingNewId ? "edit" : "view"}
            onSave={handleSave}
            onCreateVersion={handleCreateVersion}
            onRestoreVersion={handleRestoreVersion}
            onExport={handleExport}
            onDelete={() => void handleDelete()}
          />
        ) : (
          <div className="text-text-muted flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <FileText className="size-10 opacity-30" aria-hidden />
            <div>
              <p className="text-text-secondary text-sm font-medium">Selecione uma nota</p>
              <p className="text-xs">Escolha uma nota à esquerda ou crie uma nova.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  selected,
  onSelect,
}: {
  note: NoteListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const visual = getCategoryVisual(note.category ?? "general");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border-l-2 px-3 py-3 text-left transition-colors",
        selected
          ? "border-l-primary bg-primary-subtle"
          : "hover:bg-surface-muted border-l-transparent",
      )}
    >
      <div className="flex items-start gap-1.5">
        {note.isPrimary && (
          <Bookmark
            className={cn("mt-0.5 size-3.5 shrink-0", selected ? "text-primary" : "text-text-muted")}
            aria-hidden
          />
        )}
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-semibold",
            selected ? "text-primary" : "text-text-primary",
          )}
        >
          {note.title}
        </p>
      </div>

      {note.excerpt && (
        <p className="text-text-muted mt-1 line-clamp-2 text-xs leading-relaxed">{note.excerpt}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <span className="bg-surface-muted text-text-secondary inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]">
          <span className={cn("size-1.5 rounded-full", visual.dot)} aria-hidden />
          {visual.label}
        </span>
        <span className="text-text-muted text-[11px]">{note.updatedAt.slice(0, 10)}</span>
      </div>
    </button>
  );
}
