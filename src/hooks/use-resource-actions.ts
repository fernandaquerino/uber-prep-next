"use client";

import { useCallback } from "react";
import type { ResourceStatus } from "@/types/database";
import type { CreateResourceInput, UpdateResourceInput } from "@/lib/domain/resources";

async function getDb() {
  const { getDb: db } = await import("@/lib/db/db");
  return db();
}

export function useResourceActions(refresh: () => void) {
  const createResource = useCallback(
    async (input: CreateResourceInput) => {
      const { createResource: create } = await import("@/lib/application/resources");
      await create(await getDb(), input);
      refresh();
    },
    [refresh],
  );

  const updateResource = useCallback(
    async (id: string, input: UpdateResourceInput) => {
      const { updateResource: update } = await import("@/lib/application/resources");
      await update(await getDb(), id, input);
      refresh();
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const { toggleFavorite: toggle } = await import("@/lib/application/resources");
      await toggle(await getDb(), id);
      refresh();
    },
    [refresh],
  );

  const archiveResource = useCallback(
    async (id: string) => {
      const { archiveResource: archive } = await import("@/lib/application/resources");
      await archive(await getDb(), id);
      refresh();
    },
    [refresh],
  );

  const deleteResource = useCallback(
    async (id: string) => {
      const { deleteResource: del } = await import("@/lib/application/resources");
      await del(await getDb(), id);
      refresh();
    },
    [refresh],
  );

  const updateStatus = useCallback(
    async (resourceId: string, status: ResourceStatus) => {
      const { updateResourceStatus } = await import("@/lib/application/resources");
      await updateResourceStatus(await getDb(), resourceId, status);
      refresh();
    },
    [refresh],
  );

  const openResource = useCallback(
    async (resourceId: string) => {
      const { openResource: open } = await import("@/lib/application/resources");
      await open(await getDb(), resourceId);
      refresh();
    },
    [refresh],
  );

  const updateNotes = useCallback(
    async (resourceId: string, notes: string) => {
      const { updateResourceNotes } = await import("@/lib/application/resources");
      await updateResourceNotes(await getDb(), resourceId, notes);
      refresh();
    },
    [refresh],
  );

  const markForReview = useCallback(
    async (resourceId: string) => {
      const { createResourceReview } = await import("@/lib/application/resources");
      await createResourceReview(await getDb(), resourceId);
    },
    [],
  );

  return {
    createResource,
    updateResource,
    toggleFavorite,
    archiveResource,
    deleteResource,
    updateStatus,
    openResource,
    updateNotes,
    markForReview,
  };
}
