import type { CalendarDate, Weekday } from "@/lib/domain/schedule";
import type { PlanBlockExecutionStatus, EffectiveScheduledDay } from "@/lib/domain/progress";
import { CATEGORIES } from "@/lib/data/plan";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const WEEKDAY_LABELS_SHORT: Record<Weekday, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

export function formatCalendarDate(date: CalendarDate, format: "long" | "short" = "long"): string {
  const [year, month, day] = date.split("-").map(Number);
  const jsDate = new Date(Date.UTC(year, month - 1, day));

  if (format === "short") {
    return jsDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    });
  }

  return jsDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatWeekdayLabel(weekday: Weekday, short = false): string {
  return short ? WEEKDAY_LABELS_SHORT[weekday] : WEEKDAY_LABELS[weekday];
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Compact minutes label for dense UI (week grid headers/cards): "125min". */
export function formatMinutesCompact(minutes: number): string {
  return `${minutes}min`;
}

export function getStatusLabel(status: PlanBlockExecutionStatus): string {
  const labels: Record<PlanBlockExecutionStatus, string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    completed: "Concluído",
    stuck: "Travado",
    skipped: "Pulado",
  };
  return labels[status];
}

export function getCategoryMeta(category: string) {
  return CATEGORIES.find((item) => item.key === category);
}

export function getCategoryLabel(category: string) {
  return getCategoryMeta(category)?.label ?? category;
}

export function getDayProgressStatus(day: EffectiveScheduledDay): string {
  if (day.isRestDay) return "rest";
  const items = day.items;
  if (items.length === 0) return "empty";
  const allDone = items.every(
    (i) => i.executionStatus === "completed" || i.executionStatus === "skipped",
  );
  if (allDone) return "completed";
  const anyInProgress = items.some((i) => i.executionStatus === "in_progress");
  if (anyInProgress) return "in_progress";
  const anyStuck = items.some((i) => i.executionStatus === "stuck");
  if (anyStuck) return "stuck";
  const anyDone = items.some(
    (i) => i.executionStatus === "completed" || i.executionStatus === "skipped",
  );
  if (anyDone) return "partial";
  return "not_started";
}

export function hasOverdueItems(day: EffectiveScheduledDay): boolean {
  return day.items.some((i) => i.isOverdue);
}
