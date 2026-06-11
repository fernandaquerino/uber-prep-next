"use client";

import { useState } from "react";
import type { CompletePlanBlockInput } from "@/lib/domain/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CompleteBlockFormData = Omit<CompletePlanBlockInput, "blockId" | "completedAt">;

type PlanBlockFormProps = {
  onSubmit: (data: CompleteBlockFormData) => void;
  onCancel: () => void;
  loading?: boolean;
};

const DIFFICULTY_LABELS = [
  { value: 1, label: "Muito fácil" },
  { value: 2, label: "Fácil" },
  { value: 3, label: "Moderado" },
  { value: 4, label: "Difícil" },
  { value: 5, label: "Muito difícil" },
];

const CONFIDENCE_LABELS = [
  { value: 1, label: "Não consigo explicar" },
  { value: 2, label: "Baixa confiança" },
  { value: 3, label: "Consigo com apoio" },
  { value: 4, label: "Consigo sozinho" },
  { value: 5, label: "Consigo ensinar" },
];

export function PlanBlockForm({ onSubmit, onCancel, loading = false }: PlanBlockFormProps) {
  const [actualMinutes, setActualMinutes] = useState<string>("");
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [patternUsed, setPatternUsed] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const minutes = actualMinutes.trim() ? Number(actualMinutes) : undefined;
    if (minutes !== undefined && (!Number.isFinite(minutes) || minutes < 0)) {
      setError("Minutos reais deve ser um número não negativo.");
      return;
    }

    onSubmit({
      actualMinutes: minutes,
      difficulty,
      confidence,
      notes: notes.trim() || undefined,
      patternUsed: patternUsed.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="actualMinutes">Minutos reais (opcional)</Label>
        <Input
          id="actualMinutes"
          type="number"
          min={0}
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          placeholder="Ex: 90"
          aria-describedby="minutes-hint"
        />
        <p id="minutes-hint" className="text-muted-foreground text-xs">
          Quanto tempo você levou de fato?
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Dificuldade (opcional)</legend>
        <div className="flex gap-1.5" role="group" aria-label="Selecionar dificuldade">
          {DIFFICULTY_LABELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(difficulty === value ? undefined : value)}
              aria-pressed={difficulty === value}
              aria-label={`Dificuldade ${value}: ${label}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                difficulty === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {difficulty !== undefined && (
          <p className="text-muted-foreground mt-1 text-xs">
            {DIFFICULTY_LABELS[difficulty - 1]?.label}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Confiança (opcional)</legend>
        <div className="flex gap-1.5" role="group" aria-label="Selecionar confiança">
          {CONFIDENCE_LABELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setConfidence(confidence === value ? undefined : value)}
              aria-pressed={confidence === value}
              aria-label={`Confiança ${value}: ${label}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                confidence === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {confidence !== undefined && (
          <p className="text-muted-foreground mt-1 text-xs">
            {CONFIDENCE_LABELS[confidence - 1]?.label}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patternUsed">Padrão usado (opcional)</Label>
        <Input
          id="patternUsed"
          value={patternUsed}
          onChange={(e) => setPatternUsed(e.target.value)}
          placeholder="Ex: Sliding Window, Hash Map, Two Pointers…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações, insights, dúvidas…"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Concluir bloco"}
        </Button>
      </div>
    </form>
  );
}
