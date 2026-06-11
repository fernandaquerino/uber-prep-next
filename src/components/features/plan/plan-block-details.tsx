"use client";

import { useState } from "react";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanBlockForm } from "./plan-block-form";
import { formatCalendarDate, formatMinutes, getCategoryLabel, getStatusLabel } from "./plan-utils";
import type { UsePlanActionsResult } from "@/hooks/use-plan-actions";

type PlanBlockDetailsProps = {
  block: EffectiveScheduledBlock | null;
  open: boolean;
  onClose: () => void;
  actions: UsePlanActionsResult;
  onActionDone: () => void;
};

type View = "details" | "complete" | "stuck";

export function PlanBlockDetails({
  block,
  open,
  onClose,
  actions,
  onActionDone,
}: PlanBlockDetailsProps) {
  const [view, setView] = useState<View>("details");
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setView("details");
    onClose();
  }

  async function doAction(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
      onActionDone();
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby="block-desc">
        <DialogHeader>
          <DialogTitle>{block.title}</DialogTitle>
          <DialogDescription id="block-desc">
            {getCategoryLabel(block.category)} · {formatMinutes(block.estimatedMinutes)} estimados
          </DialogDescription>
        </DialogHeader>

        {view === "details" && (
          <BlockDetailsView
            block={block}
            loading={loading}
            onClose={handleClose}
            onShowComplete={() => setView("complete")}
            onShowStuck={() => setView("stuck")}
            onStart={() => doAction(() => actions.startBlock(block.blockId))}
            onReturnToPending={() => doAction(() => actions.returnToPending(block.blockId))}
            onSkip={() => doAction(() => actions.skipBlock(block.blockId))}
            onRestore={() => doAction(() => actions.restoreBlock(block.blockId))}
          />
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
      </DialogContent>
    </Dialog>
  );
}

type BlockDetailsViewProps = {
  block: EffectiveScheduledBlock;
  loading: boolean;
  onClose: () => void;
  onShowComplete: () => void;
  onShowStuck: () => void;
  onStart: () => void;
  onReturnToPending: () => void;
  onSkip: () => void;
  onRestore: () => void;
};

function BlockDetailsView({
  block,
  loading,
  onClose,
  onShowComplete,
  onShowStuck,
  onStart,
  onReturnToPending,
  onSkip,
  onRestore,
}: BlockDetailsViewProps) {
  const isCompleted = block.executionStatus === "completed";
  const isSkipped = block.executionStatus === "skipped";
  const isInProgress = block.executionStatus === "in_progress";
  const isStuck = block.executionStatus === "stuck";
  const isPending = block.executionStatus === "pending";

  return (
    <>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{getStatusLabel(block.executionStatus)}</Badge>
          {block.isOverdue && <Badge variant="destructive">Atrasado</Badge>}
          {block.isRescheduled && <Badge variant="outline">Reagendado</Badge>}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Row label="Data original" value={formatCalendarDate(block.originalScheduledDate)} />
          {block.isRescheduled && (
            <Row label="Data efetiva" value={formatCalendarDate(block.scheduledDate)} />
          )}
          {block.actualMinutes !== undefined && (
            <Row label="Tempo real" value={formatMinutes(block.actualMinutes)} />
          )}
          {block.difficulty !== undefined && (
            <Row label="Dificuldade" value={`${block.difficulty}/5`} />
          )}
          {block.confidence !== undefined && (
            <Row label="Confiança" value={`${block.confidence}/5`} />
          )}
          {block.patternUsed && <Row label="Padrão" value={block.patternUsed} />}
        </dl>

        {block.notes && (
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Notas
            </p>
            <p className="text-sm leading-relaxed">{block.notes}</p>
          </div>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        {isPending && (
          <>
            <Button size="sm" onClick={onStart} disabled={loading}>
              Iniciar
            </Button>
            <Button size="sm" variant="outline" onClick={onShowComplete} disabled={loading}>
              Concluir
            </Button>
            <Button size="sm" variant="ghost" onClick={onShowStuck} disabled={loading}>
              Travei
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              Pular
            </Button>
          </>
        )}
        {isInProgress && (
          <>
            <Button size="sm" onClick={onShowComplete} disabled={loading}>
              Concluir
            </Button>
            <Button size="sm" variant="ghost" onClick={onShowStuck} disabled={loading}>
              Travei
            </Button>
            <Button size="sm" variant="ghost" onClick={onReturnToPending} disabled={loading}>
              Pausar
            </Button>
          </>
        )}
        {isStuck && (
          <>
            <Button size="sm" onClick={onShowComplete} disabled={loading}>
              Concluir mesmo assim
            </Button>
            <Button size="sm" variant="outline" onClick={onReturnToPending} disabled={loading}>
              Retomar
            </Button>
          </>
        )}
        {isCompleted && (
          <Button size="sm" variant="ghost" onClick={onReturnToPending} disabled={loading}>
            Desfazer conclusão
          </Button>
        )}
        {isSkipped && (
          <Button size="sm" variant="outline" onClick={onRestore} disabled={loading}>
            Restaurar
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </>
  );
}

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
      <p className="text-muted-foreground text-sm">Registre o que travou para revisitar depois.</p>

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
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium ${
                difficulty === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
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
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
