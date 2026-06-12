"use client";

import { useState, useEffect, useCallback } from "react";
import type { NotesPageData } from "@/lib/domain/notes/note.types";

async function loadNotesData(): Promise<NotesPageData> {
  const { getDb } = await import("@/lib/db/db");
  const { getNotesPageData } = await import("@/lib/application/notes");
  const db = getDb();
  return getNotesPageData(db);
}

export type UseNotesResult = {
  data: NotesPageData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useNotes(): UseNotesResult {
  const [data, setData] = useState<NotesPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadNotesData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar notas.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => {
    setRev((r) => r + 1);
  }, []);

  return { data, isLoading, error, refresh };
}
