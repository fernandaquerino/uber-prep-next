import type { PlanBlockExecutionStatus, EffectiveScheduledDay } from "@/lib/domain/progress";
import type { CalendarDate } from "@/lib/domain/schedule";

// ─── Quick Filters ─────────────────────────────────────────────────────────────

export type QuickFilter = "all" | "today" | "overdue" | "in_progress" | "stuck";

export const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
  all: "Todos",
  today: "Hoje",
  overdue: "Atrasados",
  in_progress: "Em andamento",
  stuck: "Travados",
};

// ─── Block Actions ─────────────────────────────────────────────────────────────

export type BlockActionId =
  | "start"
  | "complete"
  | "stuck"
  | "resume"
  | "pause"
  | "return_to_pending"
  | "restore"
  | "reschedule"
  | "skip"
  | "undo_complete";

export type BlockActionKind = "primary" | "secondary" | "menu" | "destructive";

export type BlockActionDef = {
  id: BlockActionId;
  label: string;
  kind: BlockActionKind;
};

export type BlockActions = {
  primary: BlockActionDef | null;
  secondary: BlockActionDef | null;
  menu: BlockActionDef[];
};

export function getBlockActions(status: PlanBlockExecutionStatus): BlockActions {
  switch (status) {
    case "pending":
      return {
        primary: { id: "start", label: "Iniciar", kind: "primary" },
        secondary: null,
        menu: [
          { id: "complete", label: "Concluir sem iniciar", kind: "menu" },
          { id: "stuck", label: "Travei", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "in_progress":
      return {
        primary: { id: "complete", label: "Concluir", kind: "primary" },
        secondary: { id: "stuck", label: "Travei", kind: "secondary" },
        menu: [
          { id: "pause", label: "Pausar", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "stuck":
      return {
        primary: { id: "resume", label: "Retomar", kind: "primary" },
        secondary: { id: "complete", label: "Concluir mesmo assim", kind: "secondary" },
        menu: [
          { id: "return_to_pending", label: "Voltar para pendente", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "completed":
      return {
        primary: null,
        secondary: null,
        menu: [{ id: "undo_complete", label: "Desfazer conclusão", kind: "menu" }],
      };
    case "skipped":
      return {
        primary: { id: "restore", label: "Restaurar", kind: "primary" },
        secondary: null,
        menu: [],
      };
    default:
      return { primary: null, secondary: null, menu: [] };
  }
}

// ─── Block Actions for Modal ───────────────────────────────────────────────────

export type ModalBlockActions = {
  primary: BlockActionDef | null;
  menu: BlockActionDef[];
};

export function getModalBlockActions(status: PlanBlockExecutionStatus): ModalBlockActions {
  switch (status) {
    case "pending":
      return {
        primary: { id: "start", label: "Iniciar", kind: "primary" },
        menu: [
          { id: "complete", label: "Concluir sem iniciar", kind: "menu" },
          { id: "stuck", label: "Marcar que travei", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "in_progress":
      return {
        primary: { id: "complete", label: "Concluir", kind: "primary" },
        menu: [
          { id: "stuck", label: "Marcar que travei", kind: "menu" },
          { id: "pause", label: "Pausar", kind: "menu" },
          { id: "return_to_pending", label: "Voltar para pendente", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "stuck":
      return {
        primary: { id: "resume", label: "Retomar", kind: "primary" },
        menu: [
          { id: "complete", label: "Concluir mesmo assim", kind: "menu" },
          { id: "return_to_pending", label: "Voltar para pendente", kind: "menu" },
          { id: "reschedule", label: "Reagendar", kind: "menu" },
          { id: "skip", label: "Pular", kind: "destructive" },
        ],
      };
    case "completed":
      return {
        primary: null,
        menu: [{ id: "undo_complete", label: "Desfazer conclusão", kind: "menu" }],
      };
    case "skipped":
      return {
        primary: { id: "restore", label: "Restaurar", kind: "primary" },
        menu: [],
      };
    default:
      return { primary: null, menu: [] };
  }
}

// ─── Day Capacity ──────────────────────────────────────────────────────────────

export type DayCapacityStatus = "within" | "near_limit" | "over";

export function getDayCapacityStatus(
  plannedMinutes: number,
  availableMinutes: number,
): DayCapacityStatus {
  if (plannedMinutes > availableMinutes) return "over";
  if (availableMinutes > 0 && plannedMinutes >= availableMinutes * 0.9) return "near_limit";
  return "within";
}

export type DayCapacityInfo = {
  plannedMinutes: number;
  availableMinutes: number;
  exceededMinutes: number;
  freeMinutes: number;
  status: DayCapacityStatus;
};

export function getDayCapacityInfo(
  plannedMinutes: number,
  availableMinutes: number,
): DayCapacityInfo {
  const status = getDayCapacityStatus(plannedMinutes, availableMinutes);
  const exceededMinutes = Math.max(0, plannedMinutes - availableMinutes);
  const freeMinutes = Math.max(0, availableMinutes - plannedMinutes);
  return { plannedMinutes, availableMinutes, exceededMinutes, freeMinutes, status };
}

// ─── Week Stats (summary cards) ────────────────────────────────────────────────

export type WeekStats = {
  /** Total estimated minutes of every study block scheduled in the week. */
  plannedMinutes: number;
  /** Real (or estimated when unknown) minutes of blocks marked completed. */
  completedMinutes: number;
  /** Number of overdue blocks in the week. */
  overdueCount: number;
  /**
   * Schedule adherence: of the blocks that were already due (scheduled *before*
   * today), the share that were kept on schedule — i.e. resolved (completed or
   * skipped) rather than left overdue. Today is excluded because there is still
   * time to do it. `null` when nothing has come due yet, so the UI can
   * distinguish "no data" from 0%.
   */
  adherencePercent: number | null;
};

export function computeWeekStats(days: EffectiveScheduledDay[], today: CalendarDate): WeekStats {
  let plannedMinutes = 0;
  let completedMinutes = 0;
  let overdueCount = 0;
  let dueCount = 0;
  let resolvedDueCount = 0;

  for (const day of days) {
    if (day.isRestDay) continue;
    for (const item of day.items) {
      plannedMinutes += item.estimatedMinutes;
      const isResolved =
        item.executionStatus === "completed" || item.executionStatus === "skipped";
      if (item.executionStatus === "completed") {
        completedMinutes += item.actualMinutes ?? item.estimatedMinutes;
      }
      if (item.isOverdue) overdueCount += 1;
      // Schedule adherence only considers blocks that were already due — i.e.
      // scheduled before today. Today's pending work isn't a miss yet.
      if (day.date < today) {
        dueCount += 1;
        if (isResolved) resolvedDueCount += 1;
      }
    }
  }

  const adherencePercent =
    dueCount === 0 ? null : Math.round((resolvedDueCount / dueCount) * 100);

  return { plannedMinutes, completedMinutes, overdueCount, adherencePercent };
}

// ─── Grid status presentation ──────────────────────────────────────────────────

export type GridStatusVisual = {
  label: string;
  dot: string;
  text: string;
};

/**
 * Status presentation for the compact week-grid cards. Differs from the badge
 * map by labelling future/pending blocks as "Agendado" and surfacing overdue
 * pending blocks as "Atrasado".
 */
export function getGridStatusVisual(
  status: PlanBlockExecutionStatus,
  isOverdue: boolean,
): GridStatusVisual {
  if (isOverdue && status !== "completed" && status !== "skipped") {
    return { label: "Atrasado", dot: "bg-danger", text: "text-danger" };
  }
  switch (status) {
    case "completed":
      return { label: "Concluído", dot: "bg-success", text: "text-success" };
    case "in_progress":
      return { label: "Em andamento", dot: "bg-primary", text: "text-primary" };
    case "stuck":
      return { label: "Travado", dot: "bg-warning", text: "text-warning" };
    case "skipped":
      return { label: "Pulado", dot: "bg-muted", text: "text-muted" };
    case "pending":
    default:
      return { label: "Agendado", dot: "bg-info", text: "text-info" };
  }
}
