"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ResetModule } from "@/lib/application/settings";

interface DataBackupTabProps {
  onResetModule: (module: ResetModule, confirmText?: string) => Promise<void>;
}

type ResetTarget = {
  module: ResetModule;
  label: string;
  description: string;
  dangerous: boolean;
};

const RESET_TARGETS: ResetTarget[] = [
  { module: "settings", label: "Configurações", description: "Remove todas as configurações salvas.", dangerous: false },
  { module: "plan", label: "Progresso do plano", description: "Remove registros de progresso e reagendamentos.", dangerous: false },
  { module: "reviews", label: "Revisões", description: "Apaga toda a fila de revisão.", dangerous: false },
  { module: "flashcards", label: "Flashcards", description: "Remove todos os flashcards criados.", dangerous: true },
  { module: "quizzes", label: "Quizzes", description: "Remove histórico de tentativas.", dangerous: false },
  { module: "timer", label: "Sessões de timer", description: "Apaga o histórico de sessões.", dangerous: false },
  { module: "mocks", label: "Mocks", description: "Remove todos os registros de mock.", dangerous: true },
  { module: "notes", label: "Notas", description: "Apaga todas as notas e reflexões.", dangerous: true },
  { module: "resources", label: "Recursos", description: "Remove recursos e itens de inglês técnico.", dangerous: false },
];

export function DataBackupTab({ onResetModule }: DataBackupTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showTotalReset, setShowTotalReset] = useState(false);
  const [totalConfirmInput, setTotalConfirmInput] = useState("");

  async function handleExport() {
    setIsExporting(true);
    try {
      const { getDb } = await import("@/lib/db/db");
      const { createBackupRepository } = await import("@/lib/repositories/backup.repository");
      const file = await createBackupRepository(getDb()).export();
      const json = JSON.stringify(file, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `uber-prep-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsImporting(true);
    setImportSummary(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const { getDb } = await import("@/lib/db/db");
      const { createBackupRepository } = await import("@/lib/repositories/backup.repository");
      const result = await createBackupRepository(getDb()).import(json, "merge");
      const totalImported = Object.values(result.counts).reduce((s, n) => s + n, 0);
      const errorCount = result.errors.length;
      const lines = [
        `Importado: ${totalImported} registros`,
        errorCount > 0 ? `Erros: ${errorCount}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      setImportSummary(lines);
      toast.success("Backup importado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Arquivo inválido.");
    } finally {
      setIsImporting(false);
    }
  }

  async function confirmReset() {
    if (!resetTarget) return;
    setIsResetting(true);
    try {
      await onResetModule(resetTarget.module);
      toast.success(`${resetTarget.label} resetado com sucesso.`);
      setResetTarget(null);
          } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao resetar.");
    } finally {
      setIsResetting(false);
    }
  }

  async function confirmTotalReset() {
    setIsResetting(true);
    try {
      await onResetModule("all", totalConfirmInput);
      toast.success("Todos os dados foram removidos.");
      setShowTotalReset(false);
      setTotalConfirmInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao resetar.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Export */}
      <section>
        <h3 className="text-sm font-medium mb-1">Exportar backup</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Salva todos os dados do app em um arquivo JSON no seu dispositivo.
        </p>
        <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
          {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {isExporting ? "Exportando..." : "Baixar backup completo"}
        </Button>
      </section>

      <hr className="border-border" />

      {/* Import */}
      <section>
        <h3 className="text-sm font-medium mb-1">Importar backup</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Restaura dados de um backup anterior. Os dados existentes serão mesclados.
        </p>
        <div className="space-y-2">
          <Label htmlFor="import-file" className="sr-only">
            Selecionar arquivo
          </Label>
          <div className="flex items-center gap-2">
            <label
              htmlFor="import-file"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors hover:bg-muted ${
                isImporting ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isImporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isImporting ? "Importando..." : "Selecionar arquivo JSON"}
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="sr-only"
            />
          </div>

          {importSummary && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="size-4" />
              {importSummary}
            </div>
          )}
        </div>
      </section>

      <hr className="border-border" />

      {/* Module Reset */}
      <section>
        <h3 className="text-sm font-medium mb-1">Resetar por módulo</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Apaga dados de um módulo específico. Ação irreversível.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RESET_TARGETS.map((target) => (
            <div
              key={target.module}
              className="flex items-center justify-between p-3 rounded-lg border text-sm"
            >
              <div>
                <p className="font-medium">{target.label}</p>
                <p className="text-xs text-muted-foreground">{target.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive shrink-0 ml-2"
                onClick={() => setResetTarget(target)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* Total Reset */}
      <section>
        <h3 className="text-sm font-medium text-destructive mb-1">Reset total</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Remove todos os dados do aplicativo. Esta ação não pode ser desfeita.
        </p>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
          onClick={() => { setShowTotalReset(true); setTotalConfirmInput(""); }}
        >
          <AlertTriangle className="size-4" />
          Apagar todos os dados
        </Button>
      </section>

      {/* Module reset dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(v) => { if (!v) setResetTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar {resetTarget?.label}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{resetTarget?.description}</p>
            {resetTarget?.dangerous && (
              <div className="flex gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                Esta ação apaga dados que não podem ser recuperados sem backup.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={confirmReset}
              disabled={isResetting}
            >
              {isResetting ? "Resetando..." : "Resetar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Total reset dialog */}
      <Dialog open={showTotalReset} onOpenChange={(v) => { if (!v) { setShowTotalReset(false); setTotalConfirmInput(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar todos os dados?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ação irreversível</p>
                <p>Todo o progresso, notas, flashcards e configurações serão apagados permanentemente.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total-reset-confirm">
                Digite <strong>RESETAR</strong> para confirmar
              </Label>
              <Input
                id="total-reset-confirm"
                value={totalConfirmInput}
                onChange={(e) => setTotalConfirmInput(e.target.value)}
                placeholder="RESETAR"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTotalReset(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={confirmTotalReset}
              disabled={totalConfirmInput !== "RESETAR" || isResetting}
            >
              {isResetting ? "Apagando..." : "Apagar tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
