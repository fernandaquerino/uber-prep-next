"use client";

import { useLegacyMigration } from "@/hooks/use-legacy-migration";
import { MigrationDialog } from "./migration-dialog";

export function LegacyMigrationCheck() {
  const { phase, report, error, needsMigration, start, dismiss } = useLegacyMigration();

  const dialogOpen = needsMigration || phase === "running" || phase === "done" || phase === "error";

  return (
    <MigrationDialog
      open={dialogOpen}
      phase={phase === "checking" || phase === "not-needed" ? "idle" : phase}
      report={report}
      error={error}
      onStart={start}
      onDismiss={dismiss}
    />
  );
}
