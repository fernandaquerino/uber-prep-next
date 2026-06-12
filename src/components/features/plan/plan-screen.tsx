"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { usePlanPage } from "@/hooks/use-plan-page";
import { usePlanActions } from "@/hooks/use-plan-actions";
import type { CalendarDate, ScheduledStudyDay, ScheduledWeek } from "@/lib/domain/schedule";
import { DEFAULT_WEEKDAY_AVAILABILITY, parseCalendarDate } from "@/lib/domain/schedule";
import type { HandleMissedStudyDayInput, EffectiveScheduledDay } from "@/lib/domain/progress";
import { PlanHeader } from "./plan-header";
import { PlanSummary } from "./plan-summary";
import { PlanCurrentItem } from "./plan-current-item";
import { PlanWeekNavigation } from "./plan-week-navigation";
import { PlanWeek } from "./plan-week";
import { PlanQuickFilters } from "./plan-quick-filters";
import { PlanBlockDetails } from "./plan-block-details";
import { SkipBlockDialog } from "./skip-block-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { MissedDayDialog } from "./missed-day-dialog";
import { ChangeStartDateDialog } from "./change-start-date-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import type { ChangeStartDateOption } from "@/lib/application/progress";
import type { QuickFilter } from "@/lib/presentation/plan-view-models";

// Stable empty arrays to avoid new references on every render
const EMPTY_BASE_SCHEDULE: ScheduledStudyDay[] = [];
const EMPTY_EFFECTIVE_SCHEDULE: EffectiveScheduledDay[] = [];
const EMPTY_WEEKS: ScheduledWeek[] = [];

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return parseCalendarDate(`${y}-${m}-${d}`);
}

function filterDays(
  days: EffectiveScheduledDay[],
  filter: QuickFilter,
  today: CalendarDate,
): EffectiveScheduledDay[] {
  if (filter === "all") return days;
  return days
    .map((day) => {
      if (day.isRestDay) return null;
      const filtered = day.items.filter((item) => {
        switch (filter) {
          case "today":
            return day.date === today;
          case "overdue":
            return item.isOverdue;
          case "in_progress":
            return item.executionStatus === "in_progress";
          case "stuck":
            return item.executionStatus === "stuck";
          default:
            return true;
        }
      });
      if (filtered.length === 0) return null;
      return { ...day, items: filtered };
    })
    .filter((d): d is EffectiveScheduledDay => d !== null);
}

export function PlanScreen() {
  const { state, selectedWeekId, setSelectedWeekId, refresh } = usePlanPage();

  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [skipBlockId, setSkipBlockId] = useState<string | null>(null);
  const [rescheduleBlockId, setRescheduleBlockId] = useState<string | null>(null);
  const [missedDate, setMissedDate] = useState<CalendarDate | null>(null);
  const [changeStartDateOpen, setChangeStartDateOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const today = getTodayCalendarDate();

  const handleSuccess = useCallback(async () => {
    refresh();
  }, [refresh]);

  const handleError = useCallback((error: Error) => {
    toast.error("Erro ao salvar", { description: error.message });
  }, []);

  const actions = usePlanActions({ onSuccess: handleSuccess, onError: handleError });

  const isReady = state.status === "ready";
  const startDate = isReady ? state.data.startDate : today;
  const baseSchedule = isReady ? state.data.baseSchedule : EMPTY_BASE_SCHEDULE;
  const effectiveSchedule = isReady ? state.data.effectiveSchedule : EMPTY_EFFECTIVE_SCHEDULE;
  const weeks = isReady ? state.data.weeks : EMPTY_WEEKS;
  const currentStudyState = isReady ? state.data.currentStudyState : null;
  const completionSummary = isReady ? state.data.completionSummary : null;
  const hasProgress = isReady
    ? completionSummary!.completed > 0 ||
      completionSummary!.inProgress > 0 ||
      completionSummary!.stuck > 0 ||
      completionSummary!.skipped > 0
    : false;

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) ?? weeks[0];

  const openBlock = openBlockId
    ? (effectiveSchedule.flatMap((d) => d.items).find((b) => b.blockId === openBlockId) ?? null)
    : null;

  const skipBlock = skipBlockId
    ? (effectiveSchedule.flatMap((d) => d.items).find((b) => b.blockId === skipBlockId) ?? null)
    : null;

  const rescheduleBlock = rescheduleBlockId
    ? (effectiveSchedule.flatMap((d) => d.items).find((b) => b.blockId === rescheduleBlockId) ??
      null)
    : null;

  // Quick filter counts (across all weeks)
  const filterCounts = useMemo(() => {
    const allItems = effectiveSchedule.flatMap((d) => d.items);
    return {
      all: allItems.length,
      today: effectiveSchedule.filter((d) => d.date === today).flatMap((d) => d.items).length,
      overdue: allItems.filter((i) => i.isOverdue).length,
      in_progress: allItems.filter((i) => i.executionStatus === "in_progress").length,
      stuck: allItems.filter((i) => i.executionStatus === "stuck").length,
    } satisfies Record<QuickFilter, number>;
  }, [effectiveSchedule, today]);

  // Filtered days for current week view
  const filteredEffectiveSchedule = useMemo(
    () =>
      quickFilter === "all" ? effectiveSchedule : filterDays(effectiveSchedule, quickFilter, today),
    [effectiveSchedule, quickFilter, today],
  );

  async function handleStartBlock(blockId: string) {
    await actions.startBlock(blockId);
    toast.success("Bloco iniciado", {
      action: { label: "Desfazer", onClick: () => {} },
    });
  }

  async function handleSkipConfirm(reason?: string) {
    if (!skipBlockId) return;
    await actions.skipBlock(skipBlockId, reason);
    toast.success("Bloco pulado", {
      description: "Você pode restaurar este bloco a qualquer momento.",
    });
    setSkipBlockId(null);
  }

  async function handleRescheduleConfirm(targetDate: CalendarDate) {
    if (!rescheduleBlockId) return;
    await actions.rescheduleBlock({
      blockId: rescheduleBlockId,
      targetDate,
      today,
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
      baseSchedule,
    });
    toast.success("Bloco reagendado");
    setRescheduleBlockId(null);
  }

  async function handleMissedDayConfirm(input: Omit<HandleMissedStudyDayInput, "now">) {
    await actions.handleMissedDay({ ...input, baseSchedule });
    toast.success("Dia processado com sucesso");
    setMissedDate(null);
  }

  async function handleChangeStartDate(input: {
    newStartDate: CalendarDate;
    newBaseSchedule: ScheduledStudyDay[];
    option: ChangeStartDateOption;
  }) {
    await actions.changeStartDate(input);
    toast.success("Data de início alterada");
    setChangeStartDateOpen(false);
    // The entire schedule is rebuilt after a start-date change; reset derived UI
    // state so it is recalculated from the new data.
    setOpenBlockId(null);
    setSelectedWeekId(null);
    refresh();
  }

  return (
    <>
      {state.status === "loading" && <PlanSkeleton />}

      {state.status === "error" && (
        <EmptyState
          title="Erro ao carregar o plano"
          description={state.error.message}
          action={
            <Button onClick={refresh} variant="outline" size="sm">
              Tentar novamente
            </Button>
          }
        />
      )}

      {state.status === "no_start_date" && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Plano de Estudos</h1>
          <EmptyState
            icon={<CalendarIcon className="h-8 w-8" aria-hidden />}
            title="Configure o início do plano"
            description="Escolha uma data inicial para gerar a agenda de estudos."
            action={
              <Button onClick={() => setChangeStartDateOpen(true)} size="sm">
                Escolher início
              </Button>
            }
          />
        </div>
      )}

      {state.status === "ready" && currentStudyState && completionSummary && (
        <div className="flex flex-col gap-4">
          <PlanHeader
            startDate={startDate}
            baseSchedule={baseSchedule}
            onChangeStartDate={() => setChangeStartDateOpen(true)}
          />

          {currentStudyState.isPlanCompleted ? (
            <PlanCompletedBanner summary={completionSummary} />
          ) : (
            <PlanCurrentItem
              currentStudyState={currentStudyState}
              onStartBlock={handleStartBlock}
              onOpenBlock={setOpenBlockId}
            />
          )}

          <PlanSummary summary={completionSummary} currentStudyState={currentStudyState} />

          {weeks.length > 0 && selectedWeekId && (
            <>
              <PlanWeekNavigation
                weeks={weeks}
                effectiveDays={effectiveSchedule}
                selectedWeekId={selectedWeekId}
                today={today}
                onSelectWeek={setSelectedWeekId}
              />

              <PlanQuickFilters
                active={quickFilter}
                counts={filterCounts}
                onChange={setQuickFilter}
              />

              {selectedWeek && (
                <PlanWeek
                  week={selectedWeek}
                  effectiveDays={filteredEffectiveSchedule}
                  isFiltered={quickFilter !== "all"}
                  today={today}
                  onStartBlock={handleStartBlock}
                  onCompleteBlock={(blockId) => setOpenBlockId(blockId)}
                  onStuckBlock={(blockId) => setOpenBlockId(blockId)}
                  onReturnToPending={(blockId) => actions.returnToPending(blockId)}
                  onSkipBlock={(blockId) => setSkipBlockId(blockId)}
                  onRestoreBlock={(blockId) => actions.restoreBlock(blockId)}
                  onRescheduleBlock={(blockId) => setRescheduleBlockId(blockId)}
                  onOpenBlock={(blockId) => setOpenBlockId(blockId)}
                  onMissedDay={setMissedDate}
                />
              )}

              {quickFilter !== "all" && filteredEffectiveSchedule.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  Nenhum bloco encontrado para este filtro nesta semana.
                </p>
              )}
            </>
          )}

          <PlanBlockDetails
            block={openBlock}
            open={openBlockId !== null}
            onClose={() => setOpenBlockId(null)}
            actions={actions}
          />

          <SkipBlockDialog
            blockTitle={skipBlock?.title ?? ""}
            open={skipBlockId !== null}
            onConfirm={handleSkipConfirm}
            onClose={() => setSkipBlockId(null)}
          />

          <RescheduleDialog
            block={rescheduleBlock}
            baseSchedule={baseSchedule}
            today={today}
            open={rescheduleBlockId !== null}
            onConfirm={handleRescheduleConfirm}
            onClose={() => setRescheduleBlockId(null)}
          />

          <MissedDayDialog
            missedDate={missedDate}
            today={today}
            open={missedDate !== null}
            onConfirm={handleMissedDayConfirm}
            onClose={() => setMissedDate(null)}
          />
        </div>
      )}

      {/* Rendered in all states so the dialog is available when no start date is set */}
      <ChangeStartDateDialog
        currentStartDate={startDate}
        hasProgress={hasProgress}
        open={changeStartDateOpen}
        onConfirm={handleChangeStartDate}
        onClose={() => setChangeStartDateOpen(false)}
      />
    </>
  );
}

function PlanSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando plano de estudos">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

type PlanCompletedBannerProps = {
  summary: import("@/lib/domain/progress").PlanCompletionSummary;
};

function PlanCompletedBanner({ summary }: PlanCompletedBannerProps) {
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
      <h2 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-200">
        Plano finalizado 🎉
      </h2>
      <p className="text-xs text-green-700 dark:text-green-300">
        {summary.completed} bloco{summary.completed !== 1 ? "s" : ""} concluído
        {summary.completed !== 1 ? "s" : ""}
        {summary.skipped > 0 && ` · ${summary.skipped} pulado${summary.skipped !== 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
