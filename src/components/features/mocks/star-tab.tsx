"use client";

import { useState, useCallback } from "react";
import { useStar } from "@/hooks/use-star";
import { useStarActions } from "@/hooks/use-mock-actions";
import type { StarQuestion } from "@/lib/data/star-questions";
import type { StarAnswer, RubricRating } from "@/types/database";
import { RUBRIC_RATING_LABELS } from "@/lib/domain/mocks/mock.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  Leadership: "text-yellow-500",
  Conflict: "text-orange-500",
  Ownership: "text-green-500",
  Failure: "text-red-500",
  Mentoring: "text-blue-500",
  Ambiguity: "text-purple-500",
  Impact: "text-teal-500",
  "Technical English": "text-pink-500",
};

type StarAnswerForm = {
  situation: string;
  task: string;
  action: string;
  result: string;
  learning: string;
  conciseVersion: string;
  englishVersion: string;
  selfRating: RubricRating;
};

const EMPTY_FORM: StarAnswerForm = {
  situation: "",
  task: "",
  action: "",
  result: "",
  learning: "",
  conciseVersion: "",
  englishVersion: "",
  selfRating: 0,
};

function answerToForm(a: StarAnswer): StarAnswerForm {
  return {
    situation: a.situation,
    task: a.task,
    action: a.action,
    result: a.result,
    learning: a.learning ?? "",
    conciseVersion: a.conciseVersion ?? "",
    englishVersion: a.englishVersion ?? "",
    selfRating: (a.selfRating ?? 0) as RubricRating,
  };
}

const CATEGORIES = [
  "Leadership", "Conflict", "Ownership", "Failure",
  "Mentoring", "Ambiguity", "Impact", "Technical English",
];

export function StarTab({ onRefresh }: { onRefresh: () => void }) {
  const { questions, answers, isLoading, error, refresh } = useStar();
  const { saveStarAnswer, isLoading: saving } = useStarActions(() => { refresh(); onRefresh(); });

  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [practicingId, setPracticingId] = useState<string | null>(null);
  const [form, setForm] = useState<StarAnswerForm>(EMPTY_FORM);
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);

  const openPractice = useCallback((q: StarQuestion, answer: StarAnswer | null) => {
    setPracticingId(q.id);
    setForm(answer ? answerToForm(answer) : EMPTY_FORM);
  }, []);

  const handleSave = useCallback(async () => {
    if (!practicingId) return;
    await saveStarAnswer({
      questionId: practicingId,
      situation: form.situation,
      task: form.task,
      action: form.action,
      result: form.result,
      learning: form.learning || undefined,
      conciseVersion: form.conciseVersion || undefined,
      englishVersion: form.englishVersion || undefined,
      selfRating: form.selfRating || undefined,
    });
    setPracticingId(null);
  }, [practicingId, form, saveStarAnswer]);

  const filtered = categoryFilter === "Todos"
    ? questions
    : questions.filter((q) => q.category === categoryFilter);

  const answeredCount = questions.filter((q) => answers.has(q.id)).length;

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Carregando...</div>;
  if (error) return <div className="text-sm text-destructive p-4">{error}</div>;

  // Inline practice form
  if (practicingId) {
    const q = questions.find((x) => x.id === practicingId)!;
    return (
      <div className="space-y-5">
        <div>
          <button
            className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
            onClick={() => setPracticingId(null)}
          >
            ← Voltar ao banco STAR
          </button>
          <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", CATEGORY_COLORS[q.category])}>
            {q.category}
          </p>
          <h3 className="font-medium">{q.question}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{q.focus}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Sinais fortes</div>
            <ul className="space-y-0.5 text-muted-foreground">
              {q.strongSignals.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Evitar</div>
            <ul className="space-y-0.5 text-muted-foreground">
              {q.pitfalls.map((p, i) => <li key={i}>• {p}</li>)}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          {(["situation", "task", "action", "result"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {field === "situation" ? "Situation" : field === "task" ? "Task" : field === "action" ? "Action" : "Result"}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Textarea
                rows={field === "action" ? 5 : 3}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Aprendizado (opcional)</Label>
            <Textarea rows={2} value={form.learning} onChange={(e) => setForm((f) => ({ ...f, learning: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Versão concisa (opcional)</Label>
            <Textarea rows={2} value={form.conciseVersion} onChange={(e) => setForm((f) => ({ ...f, conciseVersion: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Versão em inglês (opcional)</Label>
            <Textarea rows={4} value={form.englishVersion} onChange={(e) => setForm((f) => ({ ...f, englishVersion: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Avaliação pessoal</Label>
            <Select value={String(form.selfRating)} onValueChange={(v) => setForm((f) => ({ ...f, selfRating: Number(v) as RubricRating }))}>
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {(v) => v != null ? `${v} — ${RUBRIC_RATING_LABELS[Number(v) as RubricRating] ?? String(v)}` : "Selecionar"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {([0, 1, 2, 3, 4, 5] as RubricRating[]).map((r) => (
                  <SelectItem key={r} value={String(r)}>{r} — {RUBRIC_RATING_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          <Button variant="ghost" onClick={() => setPracticingId(null)}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {["Todos", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {answeredCount} de {questions.length} perguntas respondidas
      </p>

      {/* Question cards */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const answer = answers.get(q.id) ?? null;
          const isExpanded = expandedAnswerId === q.id;

          return (
            <div key={q.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", CATEGORY_COLORS[q.category])}>
                    {q.category}
                  </p>
                  <p className="font-medium text-sm">{q.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.focus}</p>
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  {answer && (
                    <button
                      onClick={() => setExpandedAnswerId(isExpanded ? null : q.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                  <Button
                    size="sm"
                    className="text-xs h-7 bg-primary hover:bg-primary/90"
                    onClick={() => openPractice(q, answer)}
                  >
                    {answer ? "Editar" : "Praticar"}
                  </Button>
                </div>
              </div>

              {/* Signals / pitfalls */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <div className="font-semibold uppercase tracking-wide text-muted-foreground mb-1">Sinais fortes</div>
                  <p className="text-muted-foreground leading-relaxed">{q.strongSignals.join(" · ")}</p>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-wide text-muted-foreground mb-1">Evitar</div>
                  <p className="text-muted-foreground leading-relaxed">{q.pitfalls.join(" · ")}</p>
                </div>
              </div>

              {/* Expanded answer */}
              {isExpanded && answer && (
                <div className="border-t pt-3 space-y-2 text-sm">
                  {(["situation", "task", "action", "result"] as const).map((field) => (
                    <div key={field}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{answer[field]}</p>
                    </div>
                  ))}
                  {answer.learning && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Aprendizado</div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{answer.learning}</p>
                    </div>
                  )}
                  {answer.selfRating && answer.selfRating > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {RUBRIC_RATING_LABELS[answer.selfRating as RubricRating]}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
