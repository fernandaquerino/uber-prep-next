"use client";

import { useState } from "react";
import type { LearningJournalViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2 } from "lucide-react";

type Props = {
  journal: LearningJournalViewModel;
  actions: UseReviewActionsResult;
};

export function LearningJournal({ journal, actions }: Props) {
  const [content, setContent] = useState(journal.content);
  const [wins, setWins] = useState(journal.wins);
  const [blockers, setBlockers] = useState(journal.blockers);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await actions.saveJournalEntry(content, wins, blockers);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  const isDirty =
    content !== journal.content || wins !== journal.wins || blockers !== journal.blockers;

  return (
    <section aria-labelledby="journal-heading">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="text-muted-foreground h-4 w-4" aria-hidden />
        <h2 id="journal-heading" className="text-sm font-semibold">
          Diário de aprendizagem
        </h2>
        <span className="text-muted-foreground ml-auto text-xs">{journal.dateLabel}</span>
      </div>

      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="journal-content">O que aprendi hoje</Label>
          <Textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Conceitos, padrões, insights que ficaram…"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journal-wins">Conquistas</Label>
            <Textarea
              id="journal-wins"
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={2}
              placeholder="O que funcionou bem?"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journal-blockers">Dificuldades</Label>
            <Textarea
              id="journal-blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={2}
              placeholder="Onde tive dificuldade?"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Salvo
            </span>
          )}
          <Button size="sm" onClick={handleSave} disabled={loading || !isDirty}>
            {loading ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
