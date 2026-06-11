"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MigrationReport } from "@/types/database";

export type MigrationPhase = "idle" | "checking" | "not-needed" | "running" | "done" | "error";

export type LegacyMigrationState = {
  phase: MigrationPhase;
  report: MigrationReport | null;
  error: Error | null;
  needsMigration: boolean;
};

export type UseLegacyMigration = LegacyMigrationState & {
  start(): void;
  dismiss(): void;
};

export function useLegacyMigration(): UseLegacyMigration {
  const [state, setState] = useState<LegacyMigrationState>({
    phase: "idle",
    report: null,
    error: null,
    needsMigration: false,
  });

  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function check() {
      setState((s) => ({ ...s, phase: "checking" }));
      try {
        const { LEGACY_STORAGE_KEYS } = await import("@/types/legacy");
        const { getDb } = await import("@/lib/db/db");
        const { METADATA_ID } = await import("@/lib/db/constants");

        const db = getDb();
        const meta = await db.metadata.get(METADATA_ID);

        if (meta?.migrationStatus === "completed") {
          setState((s) => ({ ...s, phase: "not-needed", needsMigration: false }));
          return;
        }

        const hasLegacyData = Object.values(LEGACY_STORAGE_KEYS)
          .filter((k) => k !== LEGACY_STORAGE_KEYS.migrationDone)
          .some((key) => {
            try {
              return Boolean(window.localStorage.getItem(key));
            } catch {
              return false;
            }
          });

        if (!hasLegacyData) {
          setState((s) => ({ ...s, phase: "not-needed", needsMigration: false }));
        } else {
          setState((s) => ({ ...s, phase: "idle", needsMigration: true }));
        }
      } catch {
        setState((s) => ({ ...s, phase: "idle", needsMigration: false }));
      }
    }

    void check();
  }, []);

  const start = useCallback(() => {
    setState((s) => ({ ...s, phase: "running", error: null }));

    async function run() {
      try {
        const { getDb } = await import("@/lib/db/db");
        const { runLegacyMigration } = await import("@/lib/db/migrations");

        const db = getDb();
        const report = await runLegacyMigration(db);
        setState((s) => ({ ...s, phase: "done", report, needsMigration: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          phase: "error",
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    }

    void run();
  }, []);

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, phase: "not-needed", needsMigration: false }));
  }, []);

  return { ...state, start, dismiss };
}
