"use client";

import { useState, useCallback } from "react";
import type { MockRecord, MockEvidence, RubricRating } from "@/types/database";
import { useMockActions } from "@/hooks/use-mock-actions";
import { RUBRIC_DEFINITIONS } from "@/lib/domain/mocks/mock-rubrics";
import { RUBRIC_RATING_LABELS, getMockTypeLabel, MOCK_STATUS_LABELS, CANONICAL_MOCK_TYPES } from "@/lib/domain/mocks/mock.types";
import type { CanonicalMockType } from "@/lib/domain/mocks/mock.types";
import { buildMockListItemVM } from "@/lib/presentation/mocks/build-mock-view-model";
import { AudioRecorder } from "./audio-recorder";
import type { RecordingState } from "./audio-recorder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mic, Trash2, Copy, ChevronDown, ChevronUp, AlertTriangle, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  mocks: MockRecord[];
  evidence: MockEvidence[];
  onRefresh: () => void;
};

type RubricState = Record<string, RubricRating>;

type FormState = {
  date: string;
  type: CanonicalMockType;
  title: string;
  prompt: string;
  response: string;
  strengths: string;
  weaknesses: string;
  feedback: string;
  nextSteps: string;
  rubric: RubricState;
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeEmptyForm(type: CanonicalMockType = "coding"): FormState {
  const rubricDef = RUBRIC_DEFINITIONS[type];
  const rubric: RubricState = {};
  for (const c of rubricDef.criteria) rubric[c.id] = 0;
  return { date: todayStr(), type, title: "", prompt: "", response: "", strengths: "", weaknesses: "", feedback: "", nextSteps: "", rubric };
}

function computeScoreFromRubric(rubric: RubricState): number | null {
  const values = Object.values(rubric).filter((v) => v !== 0);
  if (values.length === 0) return null;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round((avg / 5) * 100);
}

const TYPE_LABELS: Record<CanonicalMockType, string> = {
  coding: "Coding",
  frontend_coding: "Frontend Coding",
  system_design: "System Design",
  behavioral: "Behavioral",
  full_loop: "Full Loop",
};

const RATING_OPTIONS: RubricRating[] = [0, 1, 2, 3, 4, 5];

export function MockRecordsTab({ mocks, evidence, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(makeEmptyForm());
  const [recording, setRecording] = useState<RecordingState>({ status: "idle" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { createMock, updateMock, completeMock, deleteMock, duplicateMock, createReviewsFromGaps, isLoading } =
    useMockActions(onRefresh);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(makeEmptyForm("coding"));
    setRecording({ status: "idle" });
    setShowForm(true);
  }, []);

  const handleTypeChange = useCallback((type: CanonicalMockType) => {
    const rubricDef = RUBRIC_DEFINITIONS[type];
    const rubric: RubricState = {};
    for (const c of rubricDef.criteria) rubric[c.id] = form.rubric[c.id] ?? 0;
    setForm((f) => ({ ...f, type, rubric }));
  }, [form.rubric]);

  const handleRubricChange = useCallback((criterionId: string, value: RubricRating) => {
    setForm((f) => ({ ...f, rubric: { ...f.rubric, [criterionId]: value } }));
  }, []);

  const handleSave = useCallback(async () => {
    const rubricDef = RUBRIC_DEFINITIONS[form.type];
    const criteria = rubricDef.criteria.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      rating: form.rubric[c.id] ?? 0,
    }));
    const evaluated = criteria.filter((c) => c.rating !== 0);
    const score = evaluated.length > 0
      ? Math.round((evaluated.reduce((s, c) => s + c.rating, 0) / evaluated.length / 5) * 100)
      : null;
    const rubricResult = {
      rubricDefinitionId: rubricDef.id,
      version: rubricDef.version,
      criteria,
      score,
    };

    let audioId: string | undefined;
    if (recording.status === "done") {
      const { getDb } = await import("@/lib/db/db");
      const { saveMockAudio } = await import("@/lib/application/mocks/mock-audio-use-cases");
      audioId = await saveMockAudio(getDb(), {
        blob: recording.blob,
        mimeType: recording.mimeType,
        durationSeconds: recording.durationSeconds,
      });
    }

    if (editingId) {
      await updateMock(editingId, {
        date: form.date,
        title: form.title || undefined,
        prompt: form.prompt || undefined,
        response: form.response || undefined,
        strengths: form.strengths ? [form.strengths] : undefined,
        weaknesses: form.weaknesses ? [form.weaknesses] : undefined,
        feedback: form.feedback || undefined,
        nextSteps: form.nextSteps ? [form.nextSteps] : undefined,
        rubricResult,
        audioRecordingId: audioId,
      });
    } else {
      await createMock({
        type: form.type,
        date: form.date,
        title: form.title,
        status: "completed",
        prompt: form.prompt || undefined,
        response: form.response || undefined,
        strengths: form.strengths ? [form.strengths] : [],
        weaknesses: form.weaknesses ? [form.weaknesses] : [],
        feedback: form.feedback || undefined,
        nextSteps: form.nextSteps ? [form.nextSteps] : [],
        rubricResult,
        audioRecordingId: audioId,
      });
    }

    setShowForm(false);
    setEditingId(null);
    setRecording({ status: "idle" });
  }, [form, recording, editingId, createMock, updateMock]);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setRecording({ status: "idle" });
  }, []);

  const rubricDef = RUBRIC_DEFINITIONS[form.type];
  const previewScore = computeScoreFromRubric(form.rubric);

  return (
    <div className="space-y-4">
      {showForm ? (
        // ── Inline form ──────────────────────────────────────────────────────
        <div className="space-y-5">
          {/* Date + Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="mock-date" className="text-xs uppercase tracking-wide text-muted-foreground">
                Data
              </Label>
              <Input
                id="mock-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</Label>
              <div className="flex flex-wrap gap-2">
                {CANONICAL_MOCK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                      form.type === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rubric */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Rubrica de entrevista
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {rubricDef.criteria.map((c) => (
                <div key={c.id} className="space-y-0.5">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </div>
                  <Select
                    value={String(form.rubric[c.id] ?? 0)}
                    onValueChange={(v) => handleRubricChange(c.id, Number(v) as RubricRating)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map((r) => (
                        <SelectItem key={r} value={String(r)} className="text-xs">
                          {r} — {RUBRIC_RATING_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {previewScore !== null && (
              <p className="text-xs text-muted-foreground">
                Score deste mock:{" "}
                <span className={cn("font-semibold", previewScore >= 60 ? "text-green-500" : "text-destructive")}>
                  {previewScore}%
                </span>
              </p>
            )}
          </div>

          {/* Content fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Pergunta / problema
              </Label>
              <Textarea
                rows={3}
                placeholder="Qual foi a pergunta ou problema?"
                value={form.prompt}
                onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Como foi a solução
              </Label>
              <Textarea
                rows={4}
                placeholder="Descreva sua abordagem e solução..."
                value={form.response}
                onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pontos fortes
                </Label>
                <Textarea
                  rows={3}
                  placeholder="O que você fez bem?"
                  value={form.strengths}
                  onChange={(e) => setForm((f) => ({ ...f, strengths: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pontos a melhorar
                </Label>
                <Textarea
                  rows={3}
                  placeholder="O que ficou faltando?"
                  value={form.weaknesses}
                  onChange={(e) => setForm((f) => ({ ...f, weaknesses: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Feedback geral
              </Label>
              <Textarea
                rows={3}
                placeholder="Feedback do mock ou da auto-avaliação..."
                value={form.feedback}
                onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Próximos passos
              </Label>
              <Textarea
                rows={2}
                placeholder="O que estudar ou praticar depois desse mock?"
                value={form.nextSteps}
                onChange={(e) => setForm((f) => ({ ...f, nextSteps: e.target.value }))}
              />
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Gravação
            </Label>
            <AudioRecorder value={recording} onChange={setRecording} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={isLoading}>
              Salvar mock
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        // ── List mode ────────────────────────────────────────────────────────
        <div className="space-y-4">
          {mocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mic className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-muted-foreground mb-1">Nenhum mock registrado ainda</p>
              <p className="text-sm text-muted-foreground mb-4">
                Registre suas entrevistas simuladas para acompanhar a evolução.
              </p>
              <Button onClick={openNew}>+ Registrar mock</Button>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Button size="sm" onClick={openNew}>
                  + Registrar mock
                </Button>
              </div>
              <div className="space-y-2">
                {mocks.map((m) => {
                  const vm = buildMockListItemVM(m, evidence);
                  const isExpanded = expandedId === m.id;
                  return (
                    <MockCard
                      key={m.id}
                      mock={m}
                      gapCount={vm.gapCount}
                      strengthCount={vm.strengthCount}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedId(isExpanded ? null : m.id)}
                      onComplete={() => completeMock(m.id)}
                      onDuplicate={() => duplicateMock(m.id)}
                      onDelete={() => setDeleteTarget(m.id)}
                      onCreateReviews={(descs) => createReviewsFromGaps(m.id, descs)}
                      evidence={evidence.filter((e) => e.mockId === m.id)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mock?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados, evidências e áudio deste mock serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) await deleteMock(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Mock card ─────────────────────────────────────────────────────────────────

type MockCardProps = {
  mock: MockRecord;
  gapCount: number;
  strengthCount: number;
  isExpanded: boolean;
  evidence: MockEvidence[];
  onToggle: () => void;
  onComplete: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCreateReviews: (descriptions: string[]) => void;
};

function MockCard({ mock, gapCount, strengthCount, isExpanded, evidence, onToggle, onComplete, onDuplicate, onDelete, onCreateReviews }: MockCardProps) {
  const score = mock.score ?? null;
  const typeLabel = getMockTypeLabel(mock.type);
  const statusLabel = MOCK_STATUS_LABELS[mock.status as keyof typeof MOCK_STATUS_LABELS] ?? mock.status;
  const gaps = evidence.filter((e) => e.kind === "gap");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            className="flex-1 text-left min-w-0"
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                mock.status === "completed" ? "bg-green-500/15 text-green-700 dark:text-green-400" :
                mock.status === "in_progress" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                "bg-muted text-muted-foreground",
              )}>
                {statusLabel}
              </span>
              <span className="text-xs text-muted-foreground">{typeLabel}</span>
              {score !== null && (
                <span className={cn("text-xs font-semibold", score >= 60 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                  {score}%
                </span>
              )}
              {mock.hasAudio && <Mic className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="font-medium text-sm">
              {mock.title ?? typeLabel}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
              <span>{mock.date}</span>
              {gapCount > 0 && (
                <span className="text-destructive flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  {gapCount} gap{gapCount !== 1 ? "s" : ""}
                </span>
              )}
              {strengthCount > 0 && (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                  <Star className="h-3 w-3" />
                  {strengthCount}
                </span>
              )}
            </div>
          </button>

          <div className="flex gap-1 shrink-0">
            {mock.status !== "completed" && (
              <Button size="icon" variant="ghost" className="h-7 w-7" title="Concluir" onClick={onComplete}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7" title="Duplicar" onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="Excluir" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {isExpanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground self-center" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground self-center" />
            }
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-3 space-y-3">
            {mock.prompt && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Pergunta / problema</div>
                <p className="text-sm whitespace-pre-wrap">{mock.prompt}</p>
              </div>
            )}
            {mock.response && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Solução</div>
                <p className="text-sm whitespace-pre-wrap">{mock.response}</p>
              </div>
            )}
            {mock.feedback && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Feedback</div>
                <p className="text-sm whitespace-pre-wrap">{mock.feedback}</p>
              </div>
            )}
            {mock.rubricResult && mock.rubricResult.criteria.length > 0 && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Rubrica</div>
                <div className="flex flex-wrap gap-2">
                  {mock.rubricResult.criteria.filter((c) => c.rating !== 0).map((c) => (
                    <Badge
                      key={c.id}
                      variant={c.rating >= 4 ? "default" : c.rating <= 2 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {c.label}: {c.rating}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {gaps.length > 0 && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-destructive mb-1">Gaps ({gaps.length})</div>
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {gaps.map((e) => <li key={e.id}>• {e.description}</li>)}
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => onCreateReviews(gaps.map((g) => g.description))}
                >
                  Criar revisões a partir dos gaps
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
