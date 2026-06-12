"use client";

import { useState, useEffect, useCallback } from "react";
import type { SystemDesignDraft } from "@/types/database";
import { SYSTEM_DESIGN_TEMPLATES } from "@/lib/data/system-design-templates";

export type UseSystemDesignResult = {
  templates: typeof SYSTEM_DESIGN_TEMPLATES;
  drafts: Map<string, SystemDesignDraft>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

async function loadDrafts(): Promise<SystemDesignDraft[]> {
  const { getDb } = await import("@/lib/db/db");
  const db = getDb();
  return db.systemDesignDrafts.toArray();
}

export function useSystemDesign(): UseSystemDesignResult {
  const [drafts, setDrafts] = useState<SystemDesignDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadDrafts()
      .then((data) => {
        if (!cancelled) {
          setDrafts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar drafts.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  const draftsMap = new Map(drafts.map((d) => [d.templateId, d]));

  return { templates: SYSTEM_DESIGN_TEMPLATES, drafts: draftsMap, isLoading, error, refresh };
}

export function useSystemDesignActions(onSuccess?: () => void) {
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

  const saveDraft = useCallback(
    (
      templateId: string,
      answers: Record<string, string>,
      checklistState: Record<string, boolean>,
    ) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { saveSystemDesignDraft } =
          await import("@/lib/application/system-design/system-design-use-cases");
        return saveSystemDesignDraft(getDb(), templateId, answers, checklistState);
      }),
    [wrap],
  );

  const resetDraft = useCallback(
    (templateId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const { resetSystemDesignDraft } =
          await import("@/lib/application/system-design/system-design-use-cases");
        await resetSystemDesignDraft(getDb(), templateId);
      }),
    [wrap],
  );

  const registerAsMock = useCallback(
    (templateId: string) =>
      wrap(async () => {
        const { getDb } = await import("@/lib/db/db");
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const { registerDraftAsMock } =
          await import("@/lib/application/system-design/system-design-use-cases");
        return registerDraftAsMock(getDb(), templateId, today);
      }),
    [wrap],
  );

  return { isLoading, error, saveDraft, resetDraft, registerAsMock };
}
