import type { CalendarDate } from "@/lib/domain/schedule";
import type { PlanBlockExecutionStatus } from "@/lib/domain/progress";
import type { AnalyticsSnapshot } from "@/lib/domain/analytics";

// ─── Header ───────────────────────────────────────────────────────────────────

export type DashboardHeaderViewModel = {
  todayFormatted: string;
  weekLabel: string;
  planPeriodFormatted: string;
};

// ─── Focus (current/next study item) ─────────────────────────────────────────

export type FocusItemViewModel = {
  blockId: string;
  title: string;
  category: string;
  categoryLabel: string;
  type: string;
  typeLabel: string;
  estimatedMinutes: number;
  durationFormatted: string;
  status: PlanBlockExecutionStatus;
  statusLabel: string;
  isOverdue: boolean;
  scheduledDate: CalendarDate;
  scheduledDateFormatted: string;
  primaryActionLabel: "Iniciar" | "Continuar" | "Retomar";
};

export type DashboardFocusViewModel = {
  currentItem: FocusItemViewModel | null;
  lastCompletedTitle: string | null;
  isRestDay: boolean;
  nextStudyDayFormatted: string | null;
  todayBlocksCompleted: number;
  todayBlocksTotal: number;
};

// ─── Week quick summary (right column in focus area) ─────────────────────────

export type DashboardWeekQuickSummary = {
  weekLabel: string;
  completed: number;
  total: number;
  inProgress: number;
  stuck: number;
  overdue: number;
  hasPositiveState: boolean;
};

// ─── Priorities (compact, max 3) ─────────────────────────────────────────────

export type PrioritySeverity = "high" | "medium" | "positive";

export type DashboardPriorityViewModel = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  severity: PrioritySeverity;
};

// ─── Progress general ─────────────────────────────────────────────────────────

export type DashboardProgressViewModel = {
  completed: number;
  total: number;
  percentage: number;
  inProgress: number;
  stuck: number;
  skipped: number;
  resolutionCount: number;
  resolutionPercentage: number;
};

// ─── Progress by category ─────────────────────────────────────────────────────

export type CategoryProgressState = "not_started" | "in_progress" | "completed";

export type DashboardCategoryProgressViewModel = {
  category: string;
  label: string;
  completed: number;
  total: number;
  percentage: number;
  inProgress: number;
  stuck: number;
  state: CategoryProgressState;
};

// ─── 7-day week view ─────────────────────────────────────────────────────────

export type WeekDayStatus =
  | "completed"
  | "partial"
  | "pending"
  | "overdue"
  | "today"
  | "future"
  | "rest";

export type DashboardWeekDayViewModel = {
  date: CalendarDate;
  dayNumber: string;
  weekdayShort: string;
  isToday: boolean;
  isRestDay: boolean;
  completed: number;
  total: number;
  overdue: number;
  status: WeekDayStatus;
  statusLabel: string;
  ariaLabel: string;
};

export type DashboardCurrentWeekViewModel = {
  days: DashboardWeekDayViewModel[];
};

// ─── Upcoming items ───────────────────────────────────────────────────────────

export type DashboardUpcomingItemViewModel = {
  blockId: string;
  title: string;
  category: string;
  categoryLabel: string;
  type: string;
  typeLabel: string;
  estimatedMinutes: number;
  durationFormatted: string;
  scheduledDate: CalendarDate;
  scheduledDateFormatted: string;
  isOverdue: boolean;
  executionStatus: PlanBlockExecutionStatus;
};

// ─── Activity calendar ────────────────────────────────────────────────────────

export type ActivityDayViewModel = {
  date: CalendarDate;
  completedCount: number;
  isRestDay: boolean;
  isToday: boolean;
  intensity: 0 | 1 | 2 | 3;
  tooltipLabel: string;
};

export type ActivityWeekViewModel = {
  weekStart: CalendarDate;
  days: ActivityDayViewModel[];
};

export type DashboardActivityViewModel = {
  weeks: ActivityWeekViewModel[];
  hasActivity: boolean;
  totalCompletedDays: number;
};

// ─── Consistency ─────────────────────────────────────────────────────────────

export type DashboardConsistencyViewModel = {
  currentStreak: number;
  longestStreak: number;
  studiedDaysThisWeek: number;
  totalStudiedDays: number;
  streakDescription: string;
};

// ─── Timer ───────────────────────────────────────────────────────────────────

export type DashboardTimerViewModel = {
  activeTitle: string | null;
  activeStatus: "running" | "paused" | null;
  activeCategory: string | null;
  todaySeconds: number;
  todaySessionCount: number;
  weekSeconds: number;
  weekSessionCount: number;
};

// ─── Full view model ─────────────────────────────────────────────────────────

export type DashboardViewModel = {
  header: DashboardHeaderViewModel;
  focus: DashboardFocusViewModel;
  weekQuickSummary: DashboardWeekQuickSummary;
  priorities: DashboardPriorityViewModel[];
  progress: DashboardProgressViewModel;
  categoryProgress: DashboardCategoryProgressViewModel[];
  currentWeek: DashboardCurrentWeekViewModel;
  upcoming: DashboardUpcomingItemViewModel[];
  activity: DashboardActivityViewModel;
  consistency: DashboardConsistencyViewModel;
  timer: DashboardTimerViewModel;
  analytics: AnalyticsSnapshot;
};

// ─── Page states ─────────────────────────────────────────────────────────────

export type DashboardPageState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "no_start_date" }
  | { status: "ready"; viewModel: DashboardViewModel };
