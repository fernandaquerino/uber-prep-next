"use client";

import { useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/use-timer";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import type { ActiveTimerRecord } from "@/types/database";

type Props = {
  activeTimer: ActiveTimerRecord;
  elapsedSeconds: number;
  quickNote: string;
  onContinue: () => void;
  onSaved: () => void;
};

const FOCUS_RATINGS = [
  { emoji: "😵", label: "Difícil" },
  { emoji: "😐", label: "Regular" },
  { emoji: "🙂", label: "Bom" },
  { emoji: "🔥", label: "Excelente" },
];

function parseActivity(notes?: string): string | undefined {
  return notes?.match(/^Atividade:\s*(.+)$/m)?.[1]?.trim();
}

export function TimerSessionEnd({
  activeTimer,
  elapsedSeconds,
  quickNote,
  onContinue,
  onSaved,
}: Props) {
  const { actions } = useTimer();
  const [rating, setRating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minutes = Math.floor(elapsedSeconds / 60);
  const visual = getCategoryVisual(activeTimer.category);
  const activity = parseActivity(activeTimer.notes);

  async function save() {
    setSaving(true);
    const extra = [quickNote.trim() && `Nota: ${quickNote.trim()}`, rating && `Foco: ${rating}`]
      .filter(Boolean)
      .join("\n");
    const notes = [activeTimer.notes, extra].filter(Boolean).join("\n") || undefined;

    await actions.stop({ notes, actualDurationSeconds: elapsedSeconds });
    onSaved();
  }

  const stats = [
    { label: "Tempo", value: `${minutes}min` },
    { label: "Categoria", value: visual.label },
    { label: "Atividade", value: activity ?? "—" },
  ];

  return (
    <div>
      <div className="border-border flex items-center gap-3 border-b px-6 py-5">
        <span className="bg-success-subtle flex size-10 items-center justify-center rounded-[10px]">
          <CheckCircle2 className="text-success size-5" aria-hidden />
        </span>
        <div>
          <p className="font-heading text-base font-bold">Sessão finalizada!</p>
          <p className="text-muted-foreground text-xs">Registre o que foi feito.</p>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-muted rounded-lg px-2 py-2.5 text-center">
              <div className="truncate font-mono text-sm font-bold">{stat.value}</div>
              <div className="text-muted-foreground mt-0.5 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Focus rating */}
        <div>
          <p className="text-secondary-foreground mb-2 text-xs">Como foi o foco?</p>
          <div className="flex gap-1.5">
            {FOCUS_RATINGS.map((item) => {
              const selected = rating === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setRating(item.label)}
                  aria-pressed={selected}
                  className={cn(
                    "hover:border-primary-hover flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-md border-2 px-1 py-2 text-[11px] transition-colors",
                    selected
                      ? "border-primary bg-primary-subtle text-primary"
                      : "border-border bg-surface-muted text-secondary-foreground",
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onContinue}
            disabled={saving}
            size="lg"
          >
            Continuar
          </Button>
          <Button
            className="flex flex-[2] items-center"
            onClick={() => void save()}
            disabled={saving}
            size="lg"
          >
            <Check aria-hidden />
            Salvar sessão
          </Button>
        </div>
      </div>
    </div>
  );
}
