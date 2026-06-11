import type { CalendarDate } from "@/lib/domain/schedule";
import type {
  CurrentStudyState,
  EffectiveScheduledBlock,
  EffectiveScheduledDay,
  PlanCompletionSummary,
} from "@/lib/domain/progress";

export type ActivityDay = {
  date: CalendarDate;
  completedCount: number;
  isRestDay: boolean;
};

export type DashboardStreak = {
  current: number;
  longestEver: number;
};

export type RecommendationPriority = "high" | "medium" | "low";

export type DashboardRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  action?: { label: string; href: string };
};

export type TodayProgress = {
  completedCount: number;
  totalCount: number;
  completedMinutes: number;
  estimatedMinutes: number;
  isRestDay: boolean;
};

export type DashboardData = {
  today: CalendarDate;
  startDate: CalendarDate;
  currentStudyState: CurrentStudyState;
  completionSummary: PlanCompletionSummary;
  todayProgress: TodayProgress;
  activityDays: ActivityDay[];
  streak: DashboardStreak;
  overdueItems: EffectiveScheduledBlock[];
  upcomingItems: EffectiveScheduledBlock[];
  recommendations: DashboardRecommendation[];
  todayDay: EffectiveScheduledDay | null;
};

export type DashboardPageState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "no_start_date" }
  | { status: "ready"; data: DashboardData };
