"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SettingsRecord, ReviewAutoCreateSettings } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import { DEFAULT_REVIEW_INTERVALS } from "@/lib/domain/settings";

interface ReviewsTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

type AutoCreateKey = keyof ReviewAutoCreateSettings;

const AUTO_CREATE_LABELS: Record<AutoCreateKey, string> = {
  onBlockComplete: "Ao concluir bloco do plano",
  onQuizError: "Ao errar questão de quiz",
  onFlashcard: "Ao estudar flashcard",
  onMockGap: "Ao identificar gap em mock",
  includeOnRestDays: "Incluir revisões em dias de descanso",
};

export function ReviewsTab({ settings, onUpdate }: ReviewsTabProps) {
  const [intervals, setIntervals] = useState<number[]>(settings.reviewIntervals);
  const [newInterval, setNewInterval] = useState("");
  const [autoCreate, setAutoCreate] = useState<ReviewAutoCreateSettings>(settings.reviewAutoCreate);
  const [isSaving, setIsSaving] = useState(false);

  function addInterval() {
    const val = parseInt(newInterval, 10);
    if (!val || val < 1 || val > 365) return;
    if (intervals.includes(val)) return;
    const sorted = [...intervals, val].sort((a, b) => a - b);
    setIntervals(sorted);
    setNewInterval("");
  }

  function removeInterval(val: number) {
    if (intervals.length <= 1) {
      toast.error("Precisa de pelo menos um intervalo.");
      return;
    }
    setIntervals(intervals.filter((i) => i !== val));
  }

  function toggleAutoCreate(key: AutoCreateKey) {
    setAutoCreate((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    if (intervals.length === 0) {
      toast.error("Configure pelo menos um intervalo.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate({
        reviewIntervals: intervals,
        reviewAutoCreate: autoCreate,
      });
      toast.success("Configurações de revisão salvas.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetToDefault() {
    setIntervals([...DEFAULT_REVIEW_INTERVALS]);
    toast.info("Intervalos restaurados para o padrão.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Ciclos de repetição espaçada</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Dias após a atividade em que a revisão será agendada, em sequência.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {intervals.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {v} dia{v !== 1 ? "s" : ""}
              <button
                type="button"
                onClick={() => removeInterval(v)}
                className="text-primary/70 hover:text-primary ml-0.5"
                aria-label={`Remover intervalo de ${v} dias`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={365}
            placeholder="Dias"
            value={newInterval}
            onChange={(e) => setNewInterval(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addInterval(); }}
            className="h-8 w-28 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={addInterval} className="gap-1">
            <Plus className="size-3.5" />
            Adicionar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetToDefault} className="text-muted-foreground">
            Restaurar padrão
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Padrão: {DEFAULT_REVIEW_INTERVALS.join(", ")} dias
        </p>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-1">Criação automática de revisões</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Escolha quando revisões são criadas automaticamente na fila.
        </p>

        <div className="space-y-2">
          {(Object.keys(AUTO_CREATE_LABELS) as AutoCreateKey[]).map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={autoCreate[key]}
                onChange={() => toggleAutoCreate(key)}
                className="rounded"
              />
              <span className="text-sm">{AUTO_CREATE_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar revisões"}
      </Button>
    </div>
  );
}
