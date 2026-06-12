import type { SkillAreaId } from "@/lib/data/skill-topics";
import type { ReadinessScore, RiskTopic, SkillTopicAnalytics } from "@/lib/domain/analytics";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";

export type WeeklyReportStatus = "past" | "current" | "future";

export type WeeklyReportReflection = {
  content: string;
  wins: string;
  blockers: string;
  whatWorked: string;
  whatToAdjust: string;
  updatedAt?: string;
};

export type WeeklyReportMetrics = {
  plannedBlocks: number;
  completedBlocks: number;
  overdueBlocks: number;
  plannedMinutes: number;
  actualSeconds: number;
  completedReviews: number;
  quizAnswers: number;
  quizAccuracy: number | null;
  flashcardsReviewed: number;
  mocksCompleted: number;
  playgroundPractices: number;
  resourcesStudied: number;
  englishPractices: number;
  notesUpdated: number;
  evidenceCount: number;
};

export type WeeklyReportRecommendation = {
  id: string;
  title: string;
  reason: string;
  href: string;
  priority: number;
};

export type WeeklyReportComparison = {
  previousWeekNumber: number;
  completedBlocksDelta: number;
  actualSecondsDelta: number;
  quizAccuracyDelta: number | null;
  readinessDelta: number | null;
  evidenceDelta: number;
};

export type WeeklyReport = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  status: WeeklyReportStatus;
  isEmpty: boolean;
  metrics: WeeklyReportMetrics;
  timerByCategory: Array<{ category: SkillAreaId; seconds: number }>;
  readiness: ReadinessScore;
  readinessByArea: Array<{ area: SkillAreaId; label: string; readiness: ReadinessScore }>;
  skills: SkillTopicAnalytics[];
  strengths: SkillTopicAnalytics[];
  risks: RiskTopic[];
  recommendations: WeeklyReportRecommendation[];
  reflection: WeeklyReportReflection;
  comparison: WeeklyReportComparison | null;
  generatedAt: string;
};

export type WeeklyReportWeek = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  status: WeeklyReportStatus;
  days: EffectiveScheduledDay[];
};
