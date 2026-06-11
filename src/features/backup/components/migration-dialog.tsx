"use client";

import type { MigrationReport } from "@/types/database";

type Props = {
  open: boolean;
  phase: "idle" | "running" | "done" | "error";
  report: MigrationReport | null;
  error: Error | null;
  onStart(): void;
  onDismiss(): void;
};

export function MigrationDialog({ open, phase, report, error, onStart, onDismiss }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="migration-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="bg-background w-full max-w-md rounded-lg p-6 shadow-xl">
        {phase === "idle" && (
          <>
            <h2 id="migration-dialog-title" className="mb-2 text-lg font-semibold">
              Migrar dados anteriores
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Encontramos dados salvos de uma versão anterior do Uber Prep. Deseja importá-los para
              o novo banco local?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground rounded px-4 py-2 text-sm"
              >
                Ignorar
              </button>
              <button
                onClick={onStart}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
              >
                Migrar agora
              </button>
            </div>
          </>
        )}

        {phase === "running" && (
          <>
            <h2 id="migration-dialog-title" className="mb-2 text-lg font-semibold">
              Migrando dados…
            </h2>
            <p className="text-muted-foreground text-sm">
              Por favor, aguarde. Não feche o navegador.
            </p>
          </>
        )}

        {phase === "done" && report && (
          <>
            <h2 id="migration-dialog-title" className="mb-2 text-lg font-semibold">
              Migração concluída
            </h2>
            <MigrationSummary report={report} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={onDismiss}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </>
        )}

        {phase === "error" && (
          <>
            <h2 id="migration-dialog-title" className="text-destructive mb-2 text-lg font-semibold">
              Erro na migração
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {error?.message ?? "Erro desconhecido"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground rounded px-4 py-2 text-sm"
              >
                Ignorar
              </button>
              <button
                onClick={onStart}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MigrationSummary({ report }: { report: MigrationReport }) {
  const totalImported = Object.values(report.imported).reduce((a, b) => a + b, 0);
  const totalConflicts = report.conflicts.length;
  const totalInvalid = report.invalidRecords.length;
  const totalAudioFail = report.audioFailures.length;

  return (
    <div className="text-muted-foreground space-y-1 text-sm">
      <p>
        Status:{" "}
        <span className="text-foreground font-medium">
          {report.status === "success"
            ? "Sucesso"
            : report.status === "partial"
              ? "Parcial"
              : "Falha"}
        </span>
      </p>
      <p>
        Registros importados: <span className="text-foreground font-medium">{totalImported}</span>
      </p>
      {totalConflicts > 0 && (
        <p>
          Conflitos ignorados: <span className="text-foreground font-medium">{totalConflicts}</span>
        </p>
      )}
      {totalInvalid > 0 && (
        <p>
          Registros inválidos: <span className="text-destructive font-medium">{totalInvalid}</span>
        </p>
      )}
      {totalAudioFail > 0 && (
        <p>
          Áudios não migrados: <span className="font-medium text-amber-600">{totalAudioFail}</span>
        </p>
      )}
    </div>
  );
}
