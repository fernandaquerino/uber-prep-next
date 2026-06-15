"use client";

import { useEffect, useState } from "react";
import type { NoteRecord } from "@/types/database";

/**
 * Loads a single note's full content (the notes page data only carries
 * excerpts). `rev` lets callers force a reload after a save.
 */
export function useNote(id: string | null, rev = 0): NoteRecord | null {
  const [note, setNote] = useState<NoteRecord | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    void (async () => {
      const { getDb } = await import("@/lib/db/db");
      const { getNoteById } = await import("@/lib/application/notes");
      const record = await getNoteById(getDb(), id);
      if (!cancelled) setNote(record);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, rev]);

  // Avoid showing a stale note while a new id has no data loaded yet.
  return id && note?.id === id ? note : null;
}
