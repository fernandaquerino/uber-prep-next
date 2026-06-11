"use client";

import { useEffect, useState } from "react";
import type { MetadataRecord, MigrationStatus } from "@/types/database";

export type DatabaseStatus =
  | { state: "loading" }
  | { state: "ready"; metadata: MetadataRecord | null }
  | { state: "error"; error: Error };

export function useDatabaseStatus(): DatabaseStatus {
  const [status, setStatus] = useState<DatabaseStatus>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { getDb } = await import("@/lib/db/db");
        const { runSeeds } = await import("@/lib/db/seed");
        const { METADATA_ID } = await import("@/lib/db/constants");

        const db = getDb();
        await runSeeds(db);
        const metadata = (await db.metadata.get(METADATA_ID)) ?? null;

        if (!cancelled) {
          setStatus({ state: "ready", metadata });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus({ state: "error", error: err instanceof Error ? err : new Error(String(err)) });
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

export function useMigrationStatus(): MigrationStatus | null {
  const status = useDatabaseStatus();
  if (status.state !== "ready") return null;
  return status.metadata?.migrationStatus ?? "none";
}
