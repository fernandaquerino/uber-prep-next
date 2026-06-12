"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorageDiagnostics } from "@/lib/application/settings";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdvancedTab() {
  const [diagnostics, setDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function runLoad(cancelled: { current: boolean }) {
    Promise.all([import("@/lib/db/db"), import("@/lib/application/settings")])
      .then(([{ getDb }, { getStorageDiagnostics }]) => getStorageDiagnostics(getDb()))
      .then((data) => {
        if (!cancelled.current) {
          setDiagnostics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled.current) {
          setError(err instanceof Error ? err.message : "Erro ao carregar diagnóstico.");
        }
      })
      .finally(() => {
        if (!cancelled.current) setIsLoading(false);
      });
  }

  function handleRefresh() {
    setIsLoading(true);
    setError(null);
    const cancelled = { current: false };
    runLoad(cancelled);
  }

  useEffect(() => {
    const cancelled = { current: false };
    runLoad(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Diagnóstico</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="text-destructive border-destructive/30 bg-destructive/5 flex items-center gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {diagnostics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Versão do app" value={diagnostics.appVersion} />
              <InfoRow label="Versão do schema" value={String(diagnostics.schemaVersion)} />
              {diagnostics.estimatedBytes !== null && (
                <InfoRow
                  label="Armazenamento usado"
                  value={formatBytes(diagnostics.estimatedBytes)}
                />
              )}
              <InfoRow label="Seeds aplicadas" value={String(diagnostics.seedsRun.length)} />
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">Registros por tabela</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {Object.entries(diagnostics.tableCounts).map(([table, count]) => (
                  <div
                    key={table}
                    className="bg-muted flex items-center justify-between rounded px-2.5 py-1.5 text-xs"
                  >
                    <span className="text-muted-foreground">{table}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {diagnostics.seedsRun.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">Seeds aplicadas</p>
                <div className="space-y-0.5">
                  {diagnostics.seedsRun.map((seed) => (
                    <p key={seed} className="text-muted-foreground font-mono text-xs">
                      ✓ {seed}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="mb-1 text-sm font-medium">Sobre o armazenamento</h3>
        <div className="text-muted-foreground space-y-1.5 text-xs">
          <p>• Todos os dados ficam armazenados no seu navegador via IndexedDB.</p>
          <p>• Limpar cache ou dados do site pode apagar seu progresso.</p>
          <p>• Exporte backups regularmente para evitar perda de dados.</p>
          <p>• Nenhuma informação é enviada a servidores externos.</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 flex flex-col gap-0.5 rounded-lg px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
