"use client";

import { useState } from "react";
import type { WeeklyReflectionViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight, Star } from "lucide-react";

type Props = {
  reflection: WeeklyReflectionViewModel;
  actions: UseReviewActionsResult;
  onNavigate: (weekNumber: number) => void;
};

export function WeeklyReflection({ reflection, actions, onNavigate }: Props) {
  const [content, setContent] = useState(reflection.content);
  const [wins, setWins] = useState(reflection.wins);
  const [blockers, setBlockers] = useState(reflection.blockers);
  const [whatWorked, setWhatWorked] = useState(reflection.whatWorked);
  const [whatToAdjust, setWhatToAdjust] = useState(reflection.whatToAdjust);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await actions.saveWeeklyReflection(reflection.weekNumber, {
        content,
        wins,
        blockers,
        whatWorked,
        whatToAdjust,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  const isDirty =
    content !== reflection.content ||
    wins !== reflection.wins ||
    blockers !== reflection.blockers ||
    whatWorked !== reflection.whatWorked ||
    whatToAdjust !== reflection.whatToAdjust;

  return (
    <section aria-labelledby="reflection-heading">
      <div className="mb-3 flex items-center gap-2">
        <Star className="text-muted-foreground h-4 w-4" aria-hidden />
        <h2 id="reflection-heading" className="text-sm font-semibold">
          Reflexão da semana
        </h2>
        <span className="text-muted-foreground ml-auto text-xs">{reflection.weekLabel}</span>
      </div>

      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(reflection.weekNumber - 1)}
            disabled={!reflection.canGoToPrevious}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </Button>
          <span className="text-muted-foreground text-sm">{reflection.weekLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(reflection.weekNumber + 1)}
            disabled={!reflection.canGoToNext}
            aria-label="Próxima semana"
          >
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        {!reflection.hasContent && (
          <p className="text-muted-foreground text-sm">Registre sua reflexão desta semana.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-wins">O que evoluiu?</Label>
            <Textarea
              id="ref-wins"
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={2}
              placeholder="Conquistas e avanços…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-blockers">O que ficou difícil?</Label>
            <Textarea
              id="ref-blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={2}
              placeholder="Obstáculos e dificuldades…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-what-worked">O que funcionou bem?</Label>
            <Textarea
              id="ref-what-worked"
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              rows={2}
              placeholder="Abordagens eficazes…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-adjust">O que ajustar?</Label>
            <Textarea
              id="ref-adjust"
              value={whatToAdjust}
              onChange={(e) => setWhatToAdjust(e.target.value)}
              rows={2}
              placeholder="Mudanças para a próxima semana…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ref-content">Observações gerais</Label>
          <Textarea
            id="ref-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder="Qualquer outra reflexão…"
          />
        </div>

        {reflection.updatedAt && (
          <p className="text-muted-foreground text-xs">
            Atualizado em {new Date(reflection.updatedAt).toLocaleString("pt-BR")}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Salvo
            </span>
          )}
          <Button size="sm" onClick={handleSave} disabled={loading || !isDirty}>
            {loading ? "Salvando…" : "Salvar reflexão"}
          </Button>
        </div>
      </div>
    </section>
  );
}
