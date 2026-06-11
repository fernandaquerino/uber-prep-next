import type { PlanBlockExecutionStatus } from "@/lib/domain/progress";

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
