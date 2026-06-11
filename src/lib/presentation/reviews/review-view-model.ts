import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewResult, ReviewReason } from "@/types/database";
import type { ReviewPriority, ReviewTimingStatus } from "@/lib/domain/reviews";

// ─── Queue item view model ────────────────────────────────────────────────────

export type ReviewQueueItemViewModel = {
  reviewId: string;
  sourceType: string;
  sourceId: string;

  title: string;
  category?: string;
  categoryLabel?: string;
  type?: string;
  typeLabel?: string;

  scheduledFor: CalendarDate;
  scheduledForFormatted: string;
  daysOverdue: number;
  overdueLabel: string;
  timingStatus: ReviewTimingStatus;

  reason: ReviewReason | string;
  reasonLabel: string;
  priority: ReviewPriority;
  priorityLabel: string;

  cycleIndex: number;
  cycleLabel: string;

  estimatedMinutes?: number;
  durationFormatted?: string;

  lastResult?: ReviewResult;
  lastResultLabel?: string;
};

// ─── Summary view model ───────────────────────────────────────────────────────

export type ReviewSummaryViewModel = {
  dueToday: number;
  overdue: number;
  completedToday: number;
  upcoming: number;
  estimatedMinutes: number;
  durationFormatted: string;
  headerSubtitle: string;
};

// ─── Next study preview view model ────────────────────────────────────────────

export type NextStudyItemViewModel = {
  blockId: string;
  title: string;
  category: string;
  categoryLabel: string;
  type: string;
  typeLabel: string;
  estimatedMinutes: number;
  durationFormatted: string;
};

export type NextStudyPreviewViewModel = {
  date: CalendarDate;
  dateLabel: string;
  weekdayLabel: string;
  sectionTitle: string;
  isTomorrow: boolean;
  items: NextStudyItemViewModel[];
  estimatedMinutes: number;
  durationFormatted: string;
};

// ─── Journal view model ───────────────────────────────────────────────────────

export type LearningJournalViewModel = {
  id: string;
  date: string;
  dateLabel: string;
  content: string;
  wins: string;
  blockers: string;
  hasContent: boolean;
};

// ─── Weekly reflection view model ─────────────────────────────────────────────

export type WeeklyReflectionViewModel = {
  id: string;
  weekNumber: number;
  weekLabel: string;
  content: string;
  wins: string;
  blockers: string;
  whatWorked: string;
  whatToAdjust: string;
  hasContent: boolean;
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  updatedAt?: string;
};

// ─── Session view model ───────────────────────────────────────────────────────

export type ReviewSessionViewModel = {
  isActive: boolean;
  currentIndex: number;
  total: number;
  progressLabel: string;
  progressPercentage: number;
};

// ─── Header view model ────────────────────────────────────────────────────────

export type ReviewHeaderViewModel = {
  todayFormatted: string;
  subtitle: string;
};

// ─── Root view model ─────────────────────────────────────────────────────────

export type ReviewTodayViewModel = {
  header: ReviewHeaderViewModel;
  summary: ReviewSummaryViewModel;
  queue: ReviewQueueItemViewModel[];
  session: ReviewSessionViewModel;
  nextStudy: NextStudyPreviewViewModel | null;
  journal: LearningJournalViewModel;
  reflection: WeeklyReflectionViewModel;
};

// ─── Page state ───────────────────────────────────────────────────────────────

export type ReviewTodayPageState =
  | { status: "loading" }
  | { status: "no_start_date" }
  | { status: "error"; error: Error }
  | { status: "ready"; viewModel: ReviewTodayViewModel };
