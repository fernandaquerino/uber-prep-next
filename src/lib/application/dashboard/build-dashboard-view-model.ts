import type { CalendarDate, ScheduledWeek } from "@/lib/domain/schedule";
import type {
  CurrentStudyState,
  EffectiveScheduledDay,
  PlanCompletionSummary,
} from "@/lib/domain/progress";
import {
  getPlanProgressByCategory,
  getCurrentWeekDays,
  getWeekItemSummary,
  getUpcomingStudyItems,
  getActivityWeeks,
} from "@/lib/domain/progress";
import { getCategoryLabel, getBlockTypeLabel } from "@/lib/presentation/category-visuals";
import type {
  DashboardViewModel,
  DashboardHeaderViewModel,
  DashboardFocusViewModel,
  DashboardWeekQuickSummary,
  DashboardPriorityViewModel,
  DashboardProgressViewModel,
  DashboardCategoryProgressViewModel,
  DashboardCurrentWeekViewModel,
  DashboardWeekDayViewModel,
  DashboardUpcomingItemViewModel,
  DashboardActivityViewModel,
  DashboardConsistencyViewModel,
  WeekDayStatus,
  ActivityDayViewModel,
} from "@/lib/presentation/dashboard/dashboard-view-model";
import type { ActivityDay, DashboardStreak } from "./get-dashboard-data";
import {
  formatMinutes,
  formatCalendarDate,
  formatWeekdayLabel,
} from "@/components/features/plan/plan-utils";

const WEEKDAY_SHORT: Record<string, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluído",
  stuck: "Travado",
  skipped: "Pulado",
};

const WEEK_STATUS_LABELS: Record<WeekDayStatus, string> = {
  completed: "Concluído",
  partial: "Parcial",
  pending: "Pendente",
  overdue: "Atrasado",
  today: "Hoje",
  future: "Futuro",
  rest: "Descanso",
};

function buildHeader(
  today: CalendarDate,
  weeks: ScheduledWeek[],
  startDate: CalendarDate,
  endDate: CalendarDate,
): DashboardHeaderViewModel {
  const currentWeekIdx = weeks.findIndex((w) => w.weekStart <= today && today <= w.weekEnd);
  const weekNumber = currentWeekIdx === -1 ? 1 : currentWeekIdx + 1;
  const totalWeeks = weeks.length;

  return {
    todayFormatted: formatCalendarDate(today, "long"),
    weekLabel: `Semana ${weekNumber} de ${totalWeeks}`,
    planPeriodFormatted: `${formatCalendarDate(startDate, "short")} a ${formatCalendarDate(endDate, "short")}`,
  };
}

function buildFocus(
  state: CurrentStudyState,
  today: CalendarDate,
  effectiveSchedule: EffectiveScheduledDay[],
): DashboardFocusViewModel {
  const todayDay = effectiveSchedule.find((d) => d.date === today);
  const isRestDay = todayDay?.isRestDay ?? false;

  const todayItems = todayDay?.items ?? [];
  const todayBlocksCompleted = todayItems.filter((i) => i.executionStatus === "completed").length;
  const todayBlocksTotal = todayItems.length;

  const nextStudyDay = isRestDay
    ? (effectiveSchedule
        .filter((d) => !d.isRestDay && d.date > today && d.items.length > 0)
        .find(Boolean) ?? null)
    : null;

  const nextStudyDayFormatted = nextStudyDay
    ? `${formatWeekdayLabel(nextStudyDay.weekday)}, ${formatCalendarDate(nextStudyDay.date, "long")}`
    : null;

  const { currentItem, lastCompletedItem } = state;

  if (!currentItem) {
    return {
      currentItem: null,
      lastCompletedTitle: lastCompletedItem?.title ?? null,
      isRestDay,
      nextStudyDayFormatted,
      todayBlocksCompleted,
      todayBlocksTotal,
    };
  }

  const primaryActionLabel =
    currentItem.executionStatus === "in_progress"
      ? "Continuar"
      : currentItem.executionStatus === "stuck"
        ? "Retomar"
        : "Iniciar";

  return {
    currentItem: {
      blockId: currentItem.blockId,
      title: currentItem.title,
      category: currentItem.category,
      categoryLabel: getCategoryLabel(currentItem.category),
      type: currentItem.type,
      typeLabel: getBlockTypeLabel(currentItem.type),
      estimatedMinutes: currentItem.estimatedMinutes,
      durationFormatted: formatMinutes(currentItem.estimatedMinutes),
      status: currentItem.executionStatus,
      statusLabel: STATUS_LABELS[currentItem.executionStatus] ?? currentItem.executionStatus,
      isOverdue: currentItem.isOverdue,
      scheduledDate: currentItem.scheduledDate,
      scheduledDateFormatted: formatCalendarDate(currentItem.scheduledDate, "long"),
      primaryActionLabel,
    },
    lastCompletedTitle: lastCompletedItem?.title ?? null,
    isRestDay,
    nextStudyDayFormatted,
    todayBlocksCompleted,
    todayBlocksTotal,
  };
}

function buildWeekQuickSummary(
  weekDays: ReturnType<typeof getCurrentWeekDays>,
  effectiveSchedule: EffectiveScheduledDay[],
  weeks: ScheduledWeek[],
  today: CalendarDate,
): DashboardWeekQuickSummary {
  const summary = getWeekItemSummary(weekDays, effectiveSchedule);
  const currentWeekIdx = weeks.findIndex((w) => w.weekStart <= today && today <= w.weekEnd);
  const weekNumber = currentWeekIdx === -1 ? 1 : currentWeekIdx + 1;
  const totalWeeks = weeks.length;

  return {
    weekLabel: `Semana ${weekNumber} de ${totalWeeks}`,
    ...summary,
    hasPositiveState: summary.overdue === 0 && summary.stuck === 0,
  };
}

function buildPriorities(
  state: CurrentStudyState,
  summary: PlanCompletionSummary,
  dueReviewCount: number,
): DashboardPriorityViewModel[] {
  const priorities: DashboardPriorityViewModel[] = [];

  if (state.isPlanCompleted) {
    priorities.push({
      id: "plan_complete",
      title: "Plano concluído",
      description: "Você concluiu todos os blocos. Revise os tópicos marcados.",
      actionLabel: "Ver revisões",
      actionHref: "/revisar",
      severity: "positive",
    });
    return priorities.slice(0, 3);
  }

  if (state.overdueItems.length > 0) {
    const n = state.overdueItems.length;
    priorities.push({
      id: "overdue",
      title: `${n} ${n === 1 ? "bloco atrasado" : "blocos atrasados"}`,
      description:
        n === 1
          ? `"${state.overdueItems[0].title}" está atrasado. Conclua ou reagende.`
          : `Resolva o item mais antigo antes de avançar.`,
      actionLabel: "Ver pendências",
      actionHref: "/plano",
      severity: "high",
    });
  }

  if (dueReviewCount > 0 && priorities.length < 3) {
    const n = dueReviewCount;
    priorities.push({
      id: "reviews_due",
      title: `${n} ${n === 1 ? "revisão devida" : "revisões devidas"}`,
      description:
        n === 1
          ? "Há um conteúdo para revisar hoje."
          : `${n} conteúdos para revisar. Revise antes de avançar no plano.`,
      actionLabel: "Revisar agora",
      actionHref: "/revisar",
      severity: "high",
    });
  }

  if (summary.stuck > 0 && priorities.length < 3) {
    const n = summary.stuck;
    priorities.push({
      id: "stuck",
      title: `${n} ${n === 1 ? "bloco travado" : "blocos travados"}`,
      description: "Retome, reagende ou registre uma anotação antes de continuar.",
      actionLabel: "Abrir plano",
      actionHref: "/plano",
      severity: "high",
    });
  }

  if (summary.inProgress > 0 && priorities.length < 3) {
    priorities.push({
      id: "in_progress",
      title: "Continue de onde parou",
      description: state.currentItem
        ? `"${state.currentItem.title}" está em andamento.`
        : `${summary.inProgress} bloco${summary.inProgress !== 1 ? "s" : ""} em andamento.`,
      actionLabel: "Ver plano",
      actionHref: "/plano",
      severity: "medium",
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      id: "on_track",
      title: "Você está no ritmo",
      description: "Sem atrasos nem travamentos. Continue avançando.",
      actionLabel: "Ver plano",
      actionHref: "/plano",
      severity: "positive",
    });
  }

  return priorities.slice(0, 3);
}

function buildCategoryProgress(
  effectiveSchedule: EffectiveScheduledDay[],
): DashboardCategoryProgressViewModel[] {
  const raw = getPlanProgressByCategory(effectiveSchedule);
  return raw
    .filter((c) => c.total > 0)
    .map((c) => {
      const state: DashboardCategoryProgressViewModel["state"] =
        c.completed === c.total
          ? "completed"
          : c.completed > 0 || c.inProgress > 0 || c.stuck > 0
            ? "in_progress"
            : "not_started";

      return {
        category: c.category,
        label: getCategoryLabel(c.category),
        completed: c.completed,
        total: c.total,
        percentage: Math.round((c.completed / c.total) * 100),
        inProgress: c.inProgress,
        stuck: c.stuck,
        state,
      };
    });
}

function buildCurrentWeek(
  today: CalendarDate,
  effectiveSchedule: EffectiveScheduledDay[],
): DashboardCurrentWeekViewModel {
  const weekDayInfos = getCurrentWeekDays(effectiveSchedule, today);

  const days: DashboardWeekDayViewModel[] = weekDayInfos.map((d) => {
    const statusLabel = WEEK_STATUS_LABELS[d.status];
    const dayNum = d.date.slice(8, 10).replace(/^0/, "");

    let ariaLabel = `${d.weekday}, ${d.date}`;
    if (d.isRestDay) {
      ariaLabel += " — descanso";
    } else {
      ariaLabel += ` — ${statusLabel}`;
      if (d.total > 0) ariaLabel += `, ${d.completed} de ${d.total} blocos`;
    }

    return {
      date: d.date,
      dayNumber: dayNum,
      weekdayShort: WEEKDAY_SHORT[d.weekday] ?? d.weekday.slice(0, 3),
      isToday: d.isToday,
      isRestDay: d.isRestDay,
      completed: d.completed,
      total: d.total,
      overdue: d.overdue,
      status: d.status,
      statusLabel,
      ariaLabel,
    };
  });

  return { days };
}

function buildUpcoming(
  effectiveSchedule: EffectiveScheduledDay[],
  currentBlockId: string | null,
): DashboardUpcomingItemViewModel[] {
  return getUpcomingStudyItems(effectiveSchedule, currentBlockId, 5).map((item) => ({
    blockId: item.blockId,
    title: item.title,
    category: item.category,
    categoryLabel: getCategoryLabel(item.category),
    type: item.type,
    typeLabel: getBlockTypeLabel(item.type),
    estimatedMinutes: item.estimatedMinutes,
    durationFormatted: formatMinutes(item.estimatedMinutes),
    scheduledDate: item.scheduledDate,
    scheduledDateFormatted: formatCalendarDate(item.scheduledDate, "short"),
    isOverdue: item.isOverdue,
    executionStatus: item.executionStatus,
  }));
}

function buildActivity(
  effectiveSchedule: EffectiveScheduledDay[],
  today: CalendarDate,
  activityDays: ActivityDay[],
): DashboardActivityViewModel {
  const rawWeeks = getActivityWeeks(effectiveSchedule, today);
  let totalCompletedDays = 0;

  const weeks = rawWeeks.map((week) => ({
    weekStart: week.weekStart,
    days: week.days.map((d): ActivityDayViewModel => {
      if (d.completedCount > 0) totalCompletedDays++;
      const label = d.isRestDay
        ? `${formatCalendarDate(d.date, "long")} — descanso`
        : d.completedCount === 0
          ? `${formatCalendarDate(d.date, "long")} — sem atividade`
          : `${formatCalendarDate(d.date, "long")} — ${d.completedCount} bloco${d.completedCount !== 1 ? "s" : ""} concluído${d.completedCount !== 1 ? "s" : ""}`;
      return {
        date: d.date,
        completedCount: d.completedCount,
        isRestDay: d.isRestDay,
        isToday: d.isToday,
        intensity: d.intensity,
        tooltipLabel: label,
      };
    }),
  }));

  const hasActivity = activityDays.some((d) => d.completedCount > 0);

  return { weeks, hasActivity, totalCompletedDays };
}

function buildConsistency(
  streak: DashboardStreak,
  activityDays: ActivityDay[],
  weekDays: ReturnType<typeof getCurrentWeekDays>,
): DashboardConsistencyViewModel {
  const studiedDaysThisWeek = weekDays.filter((d) => d.completed > 0).length;
  const totalStudiedDays = activityDays.filter((d) => d.completedCount > 0).length;

  const streakDescription =
    streak.current === 0
      ? "Conclua um bloco para iniciar a sequência."
      : streak.current === 1
        ? "1 dia seguido. Continue amanhã!"
        : `${streak.current} dias seguidos. Mantenha o ritmo!`;

  return {
    currentStreak: streak.current,
    longestStreak: streak.longestEver,
    studiedDaysThisWeek,
    totalStudiedDays,
    streakDescription,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export type BuildDashboardViewModelInput = {
  today: CalendarDate;
  startDate: CalendarDate;
  effectiveSchedule: EffectiveScheduledDay[];
  currentStudyState: CurrentStudyState;
  completionSummary: PlanCompletionSummary;
  weeks: ScheduledWeek[];
  activityDays: ActivityDay[];
  streak: DashboardStreak;
  dueReviewCount?: number;
};

export function buildDashboardViewModel(input: BuildDashboardViewModelInput): DashboardViewModel {
  const {
    today,
    startDate,
    effectiveSchedule,
    currentStudyState,
    completionSummary,
    weeks,
    activityDays,
    streak,
    dueReviewCount = 0,
  } = input;

  const planEnd = effectiveSchedule.at(-1)?.date ?? startDate;
  const weekDayInfos = getCurrentWeekDays(effectiveSchedule, today);

  const header = buildHeader(today, weeks, startDate, planEnd);
  const focus = buildFocus(currentStudyState, today, effectiveSchedule);
  const weekQuickSummary = buildWeekQuickSummary(weekDayInfos, effectiveSchedule, weeks, today);
  const priorities = buildPriorities(currentStudyState, completionSummary, dueReviewCount);

  const progress: DashboardProgressViewModel = {
    completed: completionSummary.completed,
    total: completionSummary.total,
    percentage: completionSummary.completionPercentage,
    inProgress: completionSummary.inProgress,
    stuck: completionSummary.stuck,
    skipped: completionSummary.skipped,
    resolutionCount: completionSummary.completed + completionSummary.skipped,
    resolutionPercentage: completionSummary.resolutionPercentage,
  };

  const categoryProgress = buildCategoryProgress(effectiveSchedule);
  const currentWeek = buildCurrentWeek(today, effectiveSchedule);
  const upcoming = buildUpcoming(effectiveSchedule, currentStudyState.currentItem?.blockId ?? null);
  const activity = buildActivity(effectiveSchedule, today, activityDays);
  const consistency = buildConsistency(streak, activityDays, weekDayInfos);

  return {
    header,
    focus,
    weekQuickSummary,
    priorities,
    progress,
    categoryProgress,
    currentWeek,
    upcoming,
    activity,
    consistency,
  };
}
