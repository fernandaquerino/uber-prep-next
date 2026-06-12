"use client";

import { useCallback } from "react";
import type {
  CreateTechnicalEnglishInput,
  UpdateTechnicalEnglishInput,
} from "@/lib/domain/technical-english";

async function getDb() {
  const { getDb: db } = await import("@/lib/db/db");
  return db();
}

export function useTechnicalEnglishActions(refresh: () => void) {
  const createItem = useCallback(
    async (input: CreateTechnicalEnglishInput) => {
      const { createTechnicalEnglishItem } = await import(
        "@/lib/application/technical-english"
      );
      await createTechnicalEnglishItem(await getDb(), input);
      refresh();
    },
    [refresh],
  );

  const updateItem = useCallback(
    async (id: string, input: UpdateTechnicalEnglishInput) => {
      const { updateTechnicalEnglishItem } = await import(
        "@/lib/application/technical-english"
      );
      await updateTechnicalEnglishItem(await getDb(), id, input);
      refresh();
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const { toggleTechEnglishFavorite } = await import(
        "@/lib/application/technical-english"
      );
      await toggleTechEnglishFavorite(await getDb(), id);
      refresh();
    },
    [refresh],
  );

  const archiveItem = useCallback(
    async (id: string) => {
      const { archiveTechnicalEnglishItem } = await import(
        "@/lib/application/technical-english"
      );
      await archiveTechnicalEnglishItem(await getDb(), id);
      refresh();
    },
    [refresh],
  );

  const savePractice = useCallback(
    async (itemId: string, response: string) => {
      const { saveTechEnglishPractice } = await import(
        "@/lib/application/technical-english"
      );
      await saveTechEnglishPractice(await getDb(), itemId, response);
      refresh();
    },
    [refresh],
  );

  const markForReview = useCallback(
    async (itemId: string) => {
      const { createTechEnglishReview } = await import(
        "@/lib/application/technical-english"
      );
      await createTechEnglishReview(await getDb(), itemId);
    },
    [],
  );

  return {
    createItem,
    updateItem,
    toggleFavorite,
    archiveItem,
    savePractice,
    markForReview,
  };
}
