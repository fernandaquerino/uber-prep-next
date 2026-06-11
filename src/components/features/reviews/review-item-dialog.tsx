"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/features/plan/category-badge";
import { ReviewResultForm } from "./review-result-form";
import type { ReviewQueueItemViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { ReviewResult } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";
import { cn } from "@/lib/utils";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { addCalendarDays, parseCalendarDate } from "@/lib/domain/schedule";
import { formatCalendarDate } from "@/components/features/plan/plan-utils";

type Props = {
  item: ReviewQueueItemViewModel | null;
  open: boolean;
  onClose: () => void;
  onCompleted: (result: ReviewResult, nextDate: CalendarDate | null) => void;
  actions: UseReviewActionsResult;
};

type View = "detail" | "result" | "postpone" | "dismiss_confirm" | "done";

export function ReviewItemDialog({ item, open, onClose, onCompleted, actions }: Props) {
  const [view, setView] = useState<View>("detail");
  const [loading, setLoading] = useState(false);
  const [nextDate, setNextDate] = useState<CalendarDate | null>(null);

  function handleClose() {
    setView("detail");
    onClose();
  }

  async function handleResult(result: ReviewResult, response?: string) {
    if (!item) return;
    setLoading(true);
    try {
      // Compute next review date for display
      const { calculateNextReviewDate, getNextCycleIndex } =
        await import("@/lib/domain/reviews/review-cycle");
      const today = parseCalendarDate(new Date().toISOString().slice(0, 10));
      const nextIdx = getNextCycleIndex(item.cycleIndex, result);
      const nextD = calculateNextReviewDate({
        completedOn: today,
        currentCycleIndex: item.cycleIndex,
        result,
      });

      await actions.completeReview(item.reviewId, result, response);
      setNextDate(nextD);
      setView("done");
      onCompleted(result, nextD);
      void nextIdx;
    } finally {
      setLoading(false);
    }
  }

  async function handlePostpone(date: CalendarDate) {
    if (!item) return;
    setLoading(true);
    try {
      await actions.postponeReview(item.reviewId, date);
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss() {
    if (!item) return;
    setLoading(true);
    try {
      await actions.dismissReview(item.reviewId);
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby="review-desc">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug">{item.title}</DialogTitle>
          <DialogDescription id="review-desc" className="flex flex-wrap items-center gap-2 pt-1">
            {item.category && <CategoryBadge category={item.category} />}
            {item.typeLabel && (
              <span className="text-muted-foreground text-xs">{item.typeLabel}</span>
            )}
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">{item.cycleLabel}</span>
            {item.daysOverdue > 0 && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-destructive flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  {item.overdueLabel}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {view === "detail" && (
          <div className="flex flex-col gap-4">
            {/* Reason */}
            <div
              className={cn(
                "rounded-md border-l-4 px-3 py-2 text-sm",
                item.priority === "critical" || item.priority === "high"
                  ? "border-l-destructive bg-destructive/5"
                  : "border-l-border bg-muted/30",
              )}
            >
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Motivo
              </p>
              <p>{item.reasonLabel}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Fechar
              </Button>
              <span className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("postpone")}
                disabled={loading}
              >
                Adiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("dismiss_confirm")}
                disabled={loading}
                className="text-muted-foreground"
              >
                Dispensar
              </Button>
              <Button size="sm" onClick={() => setView("result")} disabled={loading}>
                Revisar agora
              </Button>
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="flex flex-col gap-4">
            {item.durationFormatted && (
              <p className="text-muted-foreground text-sm">
                Duração estimada: {item.durationFormatted}
              </p>
            )}
            <ReviewResultForm
              onSubmit={handleResult}
              onSkip={() => setView("postpone")}
              loading={loading}
            />
            <div className="flex border-t pt-2">
              <Button variant="ghost" size="sm" onClick={() => setView("detail")}>
                Voltar
              </Button>
            </div>
          </div>
        )}

        {view === "postpone" && (
          <PostponeView
            item={item}
            loading={loading}
            onPostpone={handlePostpone}
            onCancel={() => setView("detail")}
          />
        )}

        {view === "dismiss_confirm" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              Ao dispensar, esta revisão não será reagendada. O histórico de revisões anteriores
              será preservado.
            </p>
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("detail")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDismiss} disabled={loading}>
                {loading ? "Dispensando…" : "Confirmar dispensa"}
              </Button>
            </div>
          </div>
        )}

        {view === "done" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm font-medium">Revisão concluída.</p>
            {nextDate ? (
              <p className="text-muted-foreground text-sm">
                Próxima revisão: {formatCalendarDate(nextDate, "long")}.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Ciclo de revisão concluído para este conteúdo.
              </p>
            )}
            <div className="mt-1 flex justify-end self-end">
              <Button size="sm" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Postpone view ────────────────────────────────────────────────────────────

type PostponeViewProps = {
  item: ReviewQueueItemViewModel;
  loading: boolean;
  onPostpone: (date: CalendarDate) => void;
  onCancel: () => void;
};

function PostponeView({ item, loading, onPostpone, onCancel }: PostponeViewProps) {
  const today = parseCalendarDate(new Date().toISOString().slice(0, 10));
  const tomorrow = addCalendarDays(today, 1);
  const in3days = addCalendarDays(today, 3);
  const in7days = addCalendarDays(today, 7);
  const [custom, setCustom] = useState("");

  void item;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">Escolha quando revisitar este conteúdo.</p>
      <div className="flex flex-col gap-2">
        <QuickPostponeButton
          label="Amanhã"
          date={tomorrow}
          onSelect={onPostpone}
          disabled={loading}
        />
        <QuickPostponeButton
          label="Em 3 dias"
          date={in3days}
          onSelect={onPostpone}
          disabled={loading}
        />
        <QuickPostponeButton
          label="Em 7 dias"
          date={in7days}
          onSelect={onPostpone}
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
        <input
          type="date"
          className="border-input bg-background focus-visible:ring-ring flex-1 rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          value={custom}
          min={tomorrow}
          onChange={(e) => setCustom(e.target.value)}
          aria-label="Data personalizada"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!custom || loading}
          onClick={() => custom && onPostpone(parseCalendarDate(custom))}
        >
          Ok
        </Button>
      </div>
      <div className="flex border-t pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function QuickPostponeButton({
  label,
  date,
  onSelect,
  disabled,
}: {
  label: string;
  date: CalendarDate;
  onSelect: (d: CalendarDate) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      disabled={disabled}
      className="hover:bg-muted focus-visible:ring-ring flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
    >
      <span>{label}</span>
      <span className="text-muted-foreground text-xs">{formatCalendarDate(date, "long")}</span>
    </button>
  );
}
