"use client";

import { useState } from "react";
import { useReviewToday } from "@/hooks/use-review-today";
import { useReviewActions } from "@/hooks/use-review-actions";
import type { ReviewTodayViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { ReviewResult } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import { ReviewSummary } from "./review-summary";
import { ReviewQueueList } from "./review-queue-list";
import { NextStudyPreview } from "./next-study-preview";
import { LearningJournal } from "./learning-journal";
import { WeeklyReflection } from "./weekly-reflection";
import { ManualReviewDialog } from "./manual-review-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/feedback/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { RefreshCw, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReviewTodaySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

// ─── No start date ────────────────────────────────────────────────────────────

function NoStartDate() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <Calendar className="text-muted-foreground h-10 w-10" aria-hidden />
      <div>
        <p className="text-sm font-medium">Data de início não configurada</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure a data inicial do plano para começar a revisar.
        </p>
      </div>
      <Link
        href="/configuracoes"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Configurar
      </Link>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

type ContentProps = {
  viewModel: ReviewTodayViewModel;
  refresh: () => void;
};

function ReviewTodayContent({ viewModel, refresh }: ContentProps) {
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [reflectionWeek, setReflectionWeek] = useState(viewModel.reflection.weekNumber);

  const actions = useReviewActions({
    onSuccess: refresh,
    onError: (err) => toast.error(err.message),
  });

  function handleCompleted(_reviewId: string, result: ReviewResult, nextDate: CalendarDate | null) {
    const resultLabels: Record<ReviewResult, string> = {
      again: "Não lembrei",
      hard: "Difícil",
      good: "Bom",
      easy: "Fácil",
    };
    const label = resultLabels[result];
    if (nextDate) {
      toast.success(`Revisão concluída — ${label}. Próxima: ${nextDate}.`);
    } else {
      toast.success(`Ciclo concluído — ${label}.`);
    }
    refresh();
  }

  // Build a modified reflection for navigation to another week
  const adjustedReflection =
    reflectionWeek !== viewModel.reflection.weekNumber
      ? {
          ...viewModel.reflection,
          weekNumber: reflectionWeek,
          weekLabel: `Semana ${reflectionWeek} de ${viewModel.reflection.canGoToNext ? viewModel.reflection.weekNumber + 1 : viewModel.reflection.weekNumber}`,
          content: "",
          wins: "",
          blockers: "",
          whatWorked: "",
          whatToAdjust: "",
          hasContent: false,
          canGoToPrevious: reflectionWeek > 1,
          canGoToNext: reflectionWeek < viewModel.reflection.weekNumber,
          updatedAt: undefined,
        }
      : viewModel.reflection;

  return (
    <>
      {/* Summary */}
      <ReviewSummary summary={viewModel.summary} />

      {/* Main grid: queue + next study */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReviewQueueList
            queue={viewModel.queue}
            actions={actions}
            onCompleted={handleCompleted}
            onRequestManualReview={() => setManualDialogOpen(true)}
          />
        </div>
        <div>
          <NextStudyPreview preview={viewModel.nextStudy} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" role="separator" />

      {/* Journal + Reflection grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LearningJournal
          key={viewModel.journal.date}
          journal={viewModel.journal}
          actions={actions}
        />
        <WeeklyReflection
          key={reflectionWeek}
          reflection={adjustedReflection}
          actions={actions}
          onNavigate={setReflectionWeek}
        />
      </div>

      {/* Manual review dialog */}
      <ManualReviewDialog
        open={manualDialogOpen}
        onClose={() => setManualDialogOpen(false)}
        actions={actions}
      />
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function ReviewTodayScreen() {
  const { state, refresh, isRefreshing } = useReviewToday();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Revisar hoje</h1>
            <p className="text-muted-foreground text-sm">
              {state.status === "ready"
                ? state.viewModel.summary.headerSubtitle
                : "Revise conteúdos devidos e registre o que aprendeu."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isRefreshing}
            aria-label={isRefreshing ? "Atualizando…" : "Atualizar"}
            className="mt-1 shrink-0"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>
        <Separator />
      </div>

      {state.status === "loading" && <ReviewTodaySkeleton />}
      {state.status === "no_start_date" && <NoStartDate />}
      {state.status === "error" && (
        <ErrorState
          title="Erro ao carregar revisões"
          description={state.error.message}
          onRetry={refresh}
        />
      )}
      {state.status === "ready" && (
        <ReviewTodayContent viewModel={state.viewModel} refresh={refresh} />
      )}
    </div>
  );
}
