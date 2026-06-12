"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NotesNavigation } from "./notes-navigation";
import { NoteEditor } from "./note-editor";
import { useNotes } from "@/hooks/use-notes";
import { useNoteActions } from "@/hooks/use-note-actions";
import { getTopicById } from "@/lib/data/note-topics";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type { NoteListItem } from "@/lib/domain/notes/note.types";
import type { NoteRecord, NoteVersion } from "@/types/database";
import { cn } from "@/lib/utils";

type NavMode = "areas" | "topics";

function formatRelativeDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return iso.slice(0, 10);
  }
}

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

  const [navMode, setNavMode] = useState<NavMode>("areas");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Get the full NoteRecord from the DB snapshot
  const selectedNote = useMemo<NoteRecord | null>(() => {
    if (!data || !selectedNoteId) return null;
    const item = data.notes.find((n) => n.id === selectedNoteId);
    if (!item) return null;
    // Reconstruct NoteRecord from NoteListItem — the page data stores all fields
    return item as unknown as NoteRecord;
  }, [data, selectedNoteId]);

  // Notes for current context
  const contextNotes = useMemo<NoteListItem[]>(() => {
    if (!data) return [];
    let notes = data.notes.filter((n) => n.lifecycleStatus === "active");

    if (search.trim()) {
      const q = search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q)),
      );
      return notes;
    }

    if (navMode === "areas" && selectedCategory) {
      notes = notes.filter((n) => n.category === selectedCategory);
    } else if (navMode === "topics" && selectedTopicId) {
      notes = notes.filter((n) => n.topicId === selectedTopicId);
    } else if (navMode === "areas" && !selectedCategory) {
      // show all active notes when no category selected
    } else if (navMode === "topics" && !selectedTopicId) {
      notes = [];
    }

    return notes;
  }, [data, search, navMode, selectedCategory, selectedTopicId]);

  const handleCreateNote = useCallback(async () => {
    const defaultTitle =
      navMode === "topics" && selectedTopicId
        ? (getTopicById(selectedTopicId)?.label ?? "Nova nota")
        : navMode === "areas" && selectedCategory
          ? getCategoryLabel(selectedCategory)
          : "Nova nota";

    const id = await actions.createNote({
      type: navMode === "topics" && selectedTopicId ? "topic" : "category",
      title: defaultTitle,
      category: selectedCategory ?? undefined,
      topicId: selectedTopicId ?? undefined,
      tags: [],
      content: "",
      isPrimary: true,
    });

    if (id) {
      setSelectedNoteId(id);
    }
  }, [actions, navMode, selectedCategory, selectedTopicId]);

  const handleSaveNote = useCallback(
    async (id: string, title: string, content: string) => {
      await actions.updateNote(id, { title, content });
    },
    [actions],
  );

  const handleCreateVersion = useCallback(
    async (noteId: string, reason: NoteVersion["reason"]) => {
      await actions.saveNoteVersion(noteId, reason);
    },
    [actions],
  );

  const handleRestoreVersion = useCallback(
    async (noteId: string, versionId: string) => {
      await actions.restoreNoteVersion(noteId, versionId);
    },
    [actions],
  );

  const handleExportNote = useCallback(() => {
    if (!selectedNote) return;
    exportNote(selectedNote as NoteRecord);
  }, [selectedNote]);

  if (error) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const noteCounts = data
    ? { byCategory: data.countsByCategory, byTopic: data.countsByTopic }
    : { byCategory: {}, byTopic: {} };

  const hasContext = !!(
    search.trim() ||
    (navMode === "areas" && selectedCategory !== null) ||
    (navMode === "topics" && selectedTopicId !== null)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Notas</h1>
          <p className="text-muted-foreground text-sm">
            Anotações de estudo em markdown por área e tópico.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedNote && (
            <Button variant="outline" size="sm" onClick={handleExportNote} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
          )}
          <Button size="sm" onClick={handleCreateNote} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nova nota
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          placeholder="Buscar em todas as notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Buscar notas"
        />
      </div>

      {/* Navigation */}
      {!search.trim() && (
        <NotesNavigation
          mode={navMode}
          onModeChange={(m) => {
            setNavMode(m);
            setSelectedCategory(null);
            setSelectedTopicId(null);
          }}
          selectedCategory={selectedCategory}
          selectedTopicId={selectedTopicId}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedNoteId(null);
          }}
          onSelectTopic={(id) => {
            setSelectedTopicId(id);
            setSelectedNoteId(null);
          }}
          noteCounts={noteCounts}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          {/* Note list sidebar */}
          <div className="space-y-1">
            {!hasContext && !search.trim() && navMode === "topics" && !selectedTopicId ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Selecione um tópico para ver as notas.
              </p>
            ) : contextNotes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <FileText className="text-muted-foreground h-8 w-8 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  {search.trim() ? "Nenhuma nota corresponde à busca." : "Nenhuma nota aqui ainda."}
                </p>
                {!search.trim() && hasContext && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateNote}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Criar nota
                  </Button>
                )}
              </div>
            ) : (
              <>
                {contextNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId;
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedNoteId(isSelected ? null : note.id)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                      )}
                      aria-pressed={isSelected}
                    >
                      <p className="truncate text-sm font-medium">{note.title}</p>
                      {note.excerpt && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                          {note.excerpt}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatRelativeDate(note.updatedAt)}
                      </p>
                    </button>
                  );
                })}

                {hasContext && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground mt-1 w-full gap-1.5"
                    onClick={handleCreateNote}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova nota
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Editor */}
          <div className="min-h-[400px]">
            <NoteEditor
              note={selectedNote}
              versions={data?.versions ?? []}
              onSave={handleSaveNote}
              onCreateVersion={handleCreateVersion}
              onRestoreVersion={handleRestoreVersion}
            />
          </div>
        </div>
      )}
    </div>
  );
}
