"use client";

import { useState, useCallback } from "react";
import type { CreateNoteInput, UpdateNoteInput } from "@/lib/domain/notes/note.types";
import type { NoteVersion } from "@/types/database";

async function getDb() {
  const { getDb: _getDb } = await import("@/lib/db/db");
  return _getDb();
}

export function useNoteActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn();
        onSuccess?.();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  const createNote = useCallback(
    (input: CreateNoteInput) =>
      wrap(async () => {
        const db = await getDb();
        const { createNote: _create } = await import("@/lib/application/notes");
        return _create(db, input);
      }),
    [wrap],
  );

  const updateNote = useCallback(
    (id: string, input: UpdateNoteInput) =>
      wrap(async () => {
        const db = await getDb();
        const { updateNote: _update } = await import("@/lib/application/notes");
        await _update(db, id, input);
      }),
    [wrap],
  );

  const archiveNote = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { archiveNote: _archive } = await import("@/lib/application/notes");
        await _archive(db, id);
      }),
    [wrap],
  );

  const restoreArchivedNote = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { restoreArchivedNote: _restore } = await import("@/lib/application/notes");
        await _restore(db, id);
      }),
    [wrap],
  );

  const deleteNote = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { deleteNote: _delete } = await import("@/lib/application/notes");
        await _delete(db, id);
      }),
    [wrap],
  );

  const saveNoteVersion = useCallback(
    (noteId: string, reason: NoteVersion["reason"]) =>
      wrap(async () => {
        const db = await getDb();
        const { saveNoteVersion: _save } = await import("@/lib/application/notes");
        await _save(db, noteId, reason);
      }),
    [wrap],
  );

  const restoreNoteVersion = useCallback(
    (noteId: string, versionId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { restoreNoteVersion: _restore } = await import("@/lib/application/notes");
        await _restore(db, noteId, versionId);
      }),
    [wrap],
  );

  return {
    createNote,
    updateNote,
    archiveNote,
    restoreArchivedNote,
    deleteNote,
    saveNoteVersion,
    restoreNoteVersion,
    isLoading,
    error,
  };
}
