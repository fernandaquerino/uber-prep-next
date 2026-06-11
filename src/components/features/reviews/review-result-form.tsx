"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewResult } from "@/types/database";
import { RESULT_LABELS_MAP } from "@/lib/presentation/reviews/build-review-view-model";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (result: ReviewResult, response?: string) => void | Promise<void>;
  onSkip?: () => void;
  loading?: boolean;
};

const RESULT_OPTIONS: { value: ReviewResult; description: string; className: string }[] = [
  {
    value: "again",
    description: "Não consegui lembrar ou reproduzir.",
    className: "border-destructive/50 text-destructive hover:bg-destructive/10",
  },
  {
    value: "hard",
    description: "Lembrei com dificuldade ou parcialmente.",
    className:
      "border-amber-400/50 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20",
  },
  {
    value: "good",
    description: "Lembrei bem após algum esforço.",
    className:
      "border-blue-400/50 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  },
  {
    value: "easy",
    description: "Lembrei facilmente, sem hesitação.",
    className:
      "border-emerald-400/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
  },
];

export function ReviewResultForm({ onSubmit, onSkip, loading }: Props) {
  const [response, setResponse] = useState("");
  const [selected, setSelected] = useState<ReviewResult | null>(null);

  async function handleSelect(result: ReviewResult) {
    setSelected(result);
    await onSubmit(result, response.trim() || undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Active recall prompt */}
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-muted-foreground text-sm">
          Antes de ver as notas, tente explicar o conceito ou descrever a solução.
        </p>
        <Textarea
          className="mt-2"
          rows={3}
          placeholder="Escreva sua resposta aqui (opcional)…"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          aria-label="Resposta de lembrança ativa"
        />
      </div>

      {/* Result buttons */}
      <fieldset aria-label="Como foi a revisão?">
        <legend className="mb-2 text-sm font-medium">Como foi?</legend>
        <div className="grid grid-cols-2 gap-2">
          {RESULT_OPTIONS.map(({ value, description, className }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={loading || selected !== null}
              aria-pressed={selected === value}
              className={cn(
                "flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm transition-colors",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                "disabled:opacity-50",
                className,
                selected === value && "ring-ring ring-2",
              )}
            >
              <span className="font-medium">{RESULT_LABELS_MAP[value]}</span>
              <span className="text-muted-foreground mt-0.5 text-xs">{description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {onSkip && (
        <div className="flex justify-start">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip} disabled={loading}>
            Pular por agora
          </Button>
        </div>
      )}
    </div>
  );
}
