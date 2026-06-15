"use client";

import { useState, useEffect } from "react";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  ExternalLinkIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { PlanBlockForm } from "./plan-block-form";
import { formatCalendarDate, formatMinutes, getStatusLabel } from "./plan-utils";
import { getCategoryVisual, getBlockTypeLabel } from "@/lib/presentation/category-visuals";
import { getGridStatusVisual } from "@/lib/presentation/plan-view-models";
import type { UsePlanActionsResult } from "@/hooks/use-plan-actions";
import { useTimerActions } from "@/hooks/use-timer-actions";
import { cn } from "@/lib/utils";

type PlanBlockDetailsProps = {
  block: EffectiveScheduledBlock | null;
  open: boolean;
  onClose: () => void;
  onReschedule: (blockId: string) => void;
  actions: UsePlanActionsResult;
};

type InnerView = "details" | "complete" | "stuck";
type Tab = "status" | "notes" | "solution";

export function PlanBlockDetails({
  block,
  open,
  onClose,
  onReschedule,
  actions,
}: PlanBlockDetailsProps) {
  const [view, setView] = useState<InnerView>("details");
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [loading, setLoading] = useState(false);
  const [hasActiveReview, setHasActiveReview] = useState(false);

  // Check review status when the panel opens
  useEffect(() => {
    if (!open || !block) return;
    let cancelled = false;
    (async () => {
      try {
        const { getDb } = await import("@/lib/db/db");
        const { hasActiveReviewForBlock } =
          await import("@/lib/application/reviews/review-use-cases");
        const db = await getDb();
        const result = await hasActiveReviewForBlock(db, block.blockId);
        if (!cancelled) setHasActiveReview(result);
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, block]);

  function handleClose() {
    setView("details");
    setActiveTab("status");
    onClose();
  }

  async function doAction(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
      // Return from sub-forms (complete/stuck) to the main details view.
      // The panel stays open after every action; refresh is triggered by
      // usePlanActions.wrap → onSuccess.
      setView("details");
    } finally {
      setLoading(false);
    }
  }

  if (!block) return null;

  const visual = getCategoryVisual(block.category);
  const status = getGridStatusVisual(block.executionStatus, block.isOverdue);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Detalhes do bloco</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Topic */}
          <p className="text-muted text-xs">Tópico</p>
          <h2 className="text-text-primary mt-0.5 text-xl leading-tight font-semibold">
            {block.title}
          </h2>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                visual.badge,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", visual.dot)} aria-hidden />
              {visual.label}
            </span>
            <span className="border-border bg-surface-muted text-text-secondary inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium">
              {getBlockTypeLabel(block.type)}
            </span>
            <span
              className={cn(
                "border-border bg-surface-muted inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                status.text,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
              {status.label}
            </span>
          </div>

          <div className="mt-5">
            {view === "details" && (
              <>
                <TabBar activeTab={activeTab} onChange={setActiveTab} />

                <div className="mt-4">
                  {activeTab === "status" && (
                    <StatusTab
                      block={block}
                      loading={loading}
                      hasActiveReview={hasActiveReview}
                      onShowComplete={() => setView("complete")}
                      onShowStuck={() => setView("stuck")}
                      onStart={() => doAction(() => actions.startBlock(block.blockId))}
                      onReturnToPending={() =>
                        doAction(() => actions.returnToPending(block.blockId))
                      }
                      onSkip={() => doAction(() => actions.skipBlock(block.blockId))}
                      onRestore={() => doAction(() => actions.restoreBlock(block.blockId))}
                      onReschedule={() => onReschedule(block.blockId)}
                      onMarkForReview={() =>
                        doAction(async () => {
                          await actions.markForReview(block.blockId);
                          setHasActiveReview(true);
                        })
                      }
                      onUnmarkForReview={() =>
                        doAction(async () => {
                          await actions.unmarkForReview(block.blockId);
                          setHasActiveReview(false);
                        })
                      }
                    />
                  )}

                  {activeTab === "notes" && (
                    <NotesTab
                      block={block}
                      loading={loading}
                      onSave={(notes, patternUsed) =>
                        doAction(() =>
                          actions.updateBlockDetails({ blockId: block.blockId, notes, patternUsed }),
                        )
                      }
                      onClose={handleClose}
                    />
                  )}

                  {activeTab === "solution" && (
                    <SolutionTab
                      block={block}
                      loading={loading}
                      onSave={(solution, timeComplexity, spaceComplexity, solutionNotes) =>
                        doAction(() =>
                          actions.updateBlockDetails({
                            blockId: block.blockId,
                            solution,
                            timeComplexity,
                            spaceComplexity,
                            solutionNotes,
                          }),
                        )
                      }
                      onClose={handleClose}
                    />
                  )}
                </div>
              </>
            )}

            {view === "complete" && (
              <PlanBlockForm
                onSubmit={(data) =>
                  doAction(() => actions.completeBlock({ blockId: block.blockId, ...data }))
                }
                onCancel={() => setView("details")}
                loading={loading}
              />
            )}

            {view === "stuck" && (
              <StuckForm
                onSubmit={(notes, difficulty) =>
                  doAction(() => actions.markStuck({ blockId: block.blockId, notes, difficulty }))
                }
                onCancel={() => setView("details")}
                loading={loading}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

type TabBarProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

function TabBar({ activeTab, onChange }: TabBarProps) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "status", label: "Status" },
    { key: "notes", label: "Anotações" },
    { key: "solution", label: "Solução" },
  ];

  return (
    <div className="border-border border-b" role="tablist" aria-label="Seções do bloco">
      <div className="flex gap-0">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tab-panel-${key}`}
            onClick={() => onChange(key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-primary text-text-primary"
                : "text-muted hover:text-text-primary border-transparent",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Status Tab ──────────────────────────────────────────────────────────────

type StatusTabProps = {
  block: EffectiveScheduledBlock;
  loading: boolean;
  hasActiveReview: boolean;
  onShowComplete: () => void;
  onShowStuck: () => void;
  onStart: () => void;
  onReturnToPending: () => void;
  onSkip: () => void;
  onRestore: () => void;
  onReschedule: () => void;
  onMarkForReview: () => void;
  onUnmarkForReview: () => void;
};

function StatusTab({
  block,
  loading,
  hasActiveReview,
  onShowComplete,
  onShowStuck,
  onStart,
  onReturnToPending,
  onSkip,
  onRestore,
  onReschedule,
  onMarkForReview,
  onUnmarkForReview,
}: StatusTabProps) {
  const timerActions = useTimerActions();
  const isCompleted = block.executionStatus === "completed";
  const isSkipped = block.executionStatus === "skipped";
  const isInProgress = block.executionStatus === "in_progress";
  const isStuck = block.executionStatus === "stuck";
  const isPending = block.executionStatus === "pending";
  const isReviewable = block.type !== "pausa";

  function startFocus() {
    void timerActions.start({
      mode: "countdown",
      sourceType: "plan_block",
      sourceId: block.blockId,
      category: block.category,
      title: block.title,
      targetDurationSeconds: Math.max(60, block.estimatedMinutes * 60),
    });
  }

  return (
    <div id="tab-panel-status" role="tabpanel" aria-label="Status" className="flex flex-col gap-4">
      {/* Prominent resource link */}
      {block.resourceUrl && (
        <a
          href={block.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border hover:bg-surface-muted flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span>Abrir recurso</span>
          <ExternalLinkIcon className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      )}

      {/* Key facts */}
      <dl className="flex flex-col gap-1.5">
        <InfoRow label="Duração planejada" value={`${block.estimatedMinutes} minutos`} />
        <InfoRow label="Tipo de atividade" value={getBlockTypeLabel(block.type)} />
        {/* TODO: prioridade ainda não existe no domínio do bloco */}
        <InfoRow label="Prioridade" value="Normal" muted />
        <InfoRow label="Status" value={getStatusLabel(block.executionStatus)} />
        <InfoRow label="Data original" value={formatCalendarDate(block.originalScheduledDate)} />
        {block.isRescheduled && (
          <InfoRow label="Data efetiva" value={formatCalendarDate(block.scheduledDate)} />
        )}
        {block.isOverdue && <InfoRow label="Situação" value="Atrasado" />}
        {block.actualMinutes !== undefined && (
          <InfoRow label="Tempo real" value={formatMinutes(block.actualMinutes)} />
        )}
        {block.difficulty !== undefined && (
          <InfoRow label="Dificuldade" value={`${block.difficulty}/5`} />
        )}
        {block.confidence !== undefined && (
          <InfoRow label="Confiança" value={`${block.confidence}/5`} />
        )}
        {block.patternUsed && <InfoRow label="Padrão" value={block.patternUsed} />}
      </dl>

      {block.notes && (
        <div>
          <p className="text-muted mb-1 text-xs font-medium tracking-wide uppercase">Notas</p>
          <p className="text-sm leading-relaxed">{block.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t pt-4">
        {!isCompleted && !isSkipped && (
          <Button className="w-full" onClick={startFocus} disabled={loading}>
            <ZapIcon aria-hidden />
            Iniciar no Modo Foco
          </Button>
        )}

        {isPending && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onShowComplete} disabled={loading}>
              Marcar concluído
            </Button>
            <Button variant="secondary" onClick={onReschedule} disabled={loading}>
              <CalendarIcon aria-hidden />
              Reagendar
            </Button>
            <Button variant="secondary" onClick={onStart} disabled={loading}>
              Iniciar
            </Button>
            <Button variant="secondary" onClick={onShowStuck} disabled={loading}>
              Travei
            </Button>
          </div>
        )}

        {isInProgress && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onShowComplete} disabled={loading}>
              Concluir
            </Button>
            <Button variant="secondary" onClick={onReschedule} disabled={loading}>
              <CalendarIcon aria-hidden />
              Reagendar
            </Button>
            <Button variant="secondary" onClick={onReturnToPending} disabled={loading}>
              Pausar
            </Button>
            <Button variant="secondary" onClick={onShowStuck} disabled={loading}>
              Travei
            </Button>
          </div>
        )}

        {isStuck && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onReturnToPending} disabled={loading}>
              Retomar
            </Button>
            <Button variant="secondary" onClick={onReschedule} disabled={loading}>
              <CalendarIcon aria-hidden />
              Reagendar
            </Button>
            <Button
              variant="secondary"
              className="col-span-2"
              onClick={onShowComplete}
              disabled={loading}
            >
              Concluir mesmo assim
            </Button>
          </div>
        )}

        {isCompleted && (
          <Button variant="secondary" onClick={onReturnToPending} disabled={loading}>
            Desfazer conclusão
          </Button>
        )}

        {isSkipped && (
          <Button variant="secondary" onClick={onRestore} disabled={loading}>
            Restaurar bloco
          </Button>
        )}

        {isReviewable && (
          <Button
            variant="ghost"
            onClick={hasActiveReview ? onUnmarkForReview : onMarkForReview}
            disabled={loading}
            className={hasActiveReview ? "text-warning" : "text-text-secondary"}
          >
            {hasActiveReview ? "Remover da revisão" : "Marcar para revisar"}
          </Button>
        )}

        {!isCompleted && !isSkipped && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={loading}
            className="text-text-secondary w-full justify-start"
          >
            Pular bloco
          </Button>
        )}

        {/* TODO: implementar remoção de bloco (use case ausente no domínio) */}
        <Button
          variant="ghost"
          disabled
          title="Em breve"
          className="text-danger w-full justify-start"
        >
          <Trash2Icon aria-hidden />
          Remover bloco
        </Button>
      </div>
    </div>
  );
}

// ─── Notes Tab ───────────────────────────────────────────────────────────────

type NotesTabProps = {
  block: EffectiveScheduledBlock;
  loading: boolean;
  onSave: (notes: string | undefined, patternUsed: string | undefined) => void;
  onClose: () => void;
};

function NotesTab({ block, loading, onSave, onClose }: NotesTabProps) {
  const [notes, setNotes] = useState(block.notes ?? "");
  const [patternUsed, setPatternUsed] = useState(block.patternUsed ?? "");

  return (
    <div
      id="tab-panel-notes"
      role="tabpanel"
      aria-label="Anotações"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes-field">Notas</Label>
        <Textarea
          id="notes-field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Insights, dúvidas, o que aprendeu…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pattern-field">Padrão usado</Label>
        <Input
          id="pattern-field"
          value={patternUsed}
          onChange={(e) => setPatternUsed(e.target.value)}
          placeholder="Ex: Sliding Window, Hash Map, Two Pointers…"
        />
      </div>

      <div className="flex items-center gap-2 border-t pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          Fechar
        </Button>
        <span className="flex-1" />
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() => onSave(notes.trim() || undefined, patternUsed.trim() || undefined)}
        >
          {loading ? "Salvando…" : "Salvar anotações"}
        </Button>
      </div>
    </div>
  );
}

// ─── Solution Tab ─────────────────────────────────────────────────────────────

type SolutionTabProps = {
  block: EffectiveScheduledBlock;
  loading: boolean;
  onSave: (
    solution: string | undefined,
    timeComplexity: string | undefined,
    spaceComplexity: string | undefined,
    solutionNotes: string | undefined,
  ) => void;
  onClose: () => void;
};

function SolutionTab({ block, loading, onSave, onClose }: SolutionTabProps) {
  const [solution, setSolution] = useState(block.solution ?? "");
  const [timeComplexity, setTimeComplexity] = useState(block.timeComplexity ?? "");
  const [spaceComplexity, setSpaceComplexity] = useState(block.spaceComplexity ?? "");
  const [solutionNotes, setSolutionNotes] = useState(block.solutionNotes ?? "");

  return (
    <div
      id="tab-panel-solution"
      role="tabpanel"
      aria-label="Solução"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="solution-field">Solução / Abordagem</Label>
        <Textarea
          id="solution-field"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          rows={5}
          placeholder="Descreva a solução ou abordagem usada…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="time-complexity-field">Complexidade de tempo</Label>
          <Input
            id="time-complexity-field"
            value={timeComplexity}
            onChange={(e) => setTimeComplexity(e.target.value)}
            placeholder="Ex: O(n), O(n log n)"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-complexity-field">Complexidade de espaço</Label>
          <Input
            id="space-complexity-field"
            value={spaceComplexity}
            onChange={(e) => setSpaceComplexity(e.target.value)}
            placeholder="Ex: O(1), O(n)"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="solution-notes-field">Observações sobre a solução</Label>
        <Textarea
          id="solution-notes-field"
          value={solutionNotes}
          onChange={(e) => setSolutionNotes(e.target.value)}
          rows={2}
          placeholder="Alternativas consideradas, trade-offs, edge cases…"
        />
      </div>

      <div className="flex items-center gap-2 border-t pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          Fechar
        </Button>
        <span className="flex-1" />
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() =>
            onSave(
              solution.trim() || undefined,
              timeComplexity.trim() || undefined,
              spaceComplexity.trim() || undefined,
              solutionNotes.trim() || undefined,
            )
          }
        >
          {loading ? "Salvando…" : "Salvar solução"}
        </Button>
      </div>
    </div>
  );
}

// ─── Stuck Form ───────────────────────────────────────────────────────────────

type StuckFormProps = {
  onSubmit: (notes: string | undefined, difficulty: number | undefined) => void;
  onCancel: () => void;
  loading: boolean;
};

function StuckForm({ onSubmit, onCancel, loading }: StuckFormProps) {
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(notes.trim() || undefined, difficulty);
      }}
    >
      <p className="text-muted text-sm">Registre o que travou para revisitar depois.</p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Dificuldade (opcional)</legend>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setDifficulty(difficulty === v ? undefined : v)}
              aria-pressed={difficulty === v}
              aria-label={`Dificuldade ${v}`}
              className={cn(
                "border-border hover:bg-surface-muted flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium",
                difficulty === v && "bg-primary text-text-primary border-primary",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="stuck-notes" className="text-sm font-medium">
          Notas (opcional)
        </label>
        <textarea
          id="stuck-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          placeholder="O que travou? Que erro apareceu?"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Registrar trava"}
        </Button>
      </div>
    </form>
  );
}

function InfoRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="bg-surface-muted flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
      <dt className="text-text-secondary text-sm">{label}</dt>
      <dd className={cn("text-sm font-medium", muted ? "text-muted" : "text-text-primary")}>
        {value}
      </dd>
    </div>
  );
}
