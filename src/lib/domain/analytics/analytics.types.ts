import type { SkillAreaId } from "@/lib/data/skill-topics";

export type EvidenceSource =
  | "plan"
  | "review"
  | "flashcard"
  | "quiz"
  | "playground"
  | "timer"
  | "mock"
  | "note"
  | "resource"
  | "technical_english";

export type EvidenceKind =
  | "completion"
  | "practice"
  | "success"
  | "failure"
  | "confidence"
  | "time"
  | "review"
  | "mock_gap"
  | "mock_strength"
  | "note"
  | "resource";

export type EvidenceRecord = {
  id: string;
  source: EvidenceSource;
  sourceId: string;
  category: SkillAreaId;
  topicId?: string;
  kind: EvidenceKind;
  value?: number;
  weight: number;
  occurredAt: string;
  description?: string;
};

export type SkillState =
  | "not_started"
  | "learning"
  | "practicing"
  | "consistent"
  | "mastered"
  | "at_risk";

export type ReadinessConfidence = "insufficient_data" | "low" | "medium" | "high";

export type ReadinessScore = {
  score: number | null;
  confidence: ReadinessConfidence;
  evidenceCount: number;
  sourceCount: number;
  reasons: string[];
  missingEvidence: string[];
  factors: Array<{ id: string; label: string; score: number | null; weight: number }>;
};

export type SkillTopicAnalytics = {
  topicId: string;
  area: SkillAreaId;
  label: string;
  state: SkillState;
  explanation: string;
  evidenceCount: number;
  sourceCount: number;
  lastActivityAt: string | null;
  knowledge: number | null;
  retention: number | null;
  confidence: number | null;
  recentActivity: number;
  reviewCount: number;
  quizCount: number;
  mockCount: number;
  timeSeconds: number;
  noteCount: number;
  resourceCount: number;
  nextAction: string;
};

export type RiskTopic = {
  topicId: string;
  area: SkillAreaId;
  label: string;
  severity: "medium" | "high" | "critical";
  score: number;
  reasons: string[];
  evidenceIds: string[];
  recommendedAction: string;
};

export type AnalyticsRecommendation = {
  id: string;
  title: string;
  reason: string;
  source: EvidenceSource | "analytics";
  impact: string;
  actionLabel: string;
  href: string;
  priority: number;
};

export type ModuleMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  hasData: boolean;
};

export type WeeklyEvolutionPoint = {
  weekStart: string;
  evidenceCount: number;
  studySeconds: number;
  successRate: number | null;
};

export type AnalyticsSnapshot = {
  generatedAt: string;
  evidence: EvidenceRecord[];
  plannedTopicIds: string[];
  skills: SkillTopicAnalytics[];
  readiness: ReadinessScore;
  readinessByArea: Array<{ area: SkillAreaId; label: string; readiness: ReadinessScore }>;
  risks: RiskTopic[];
  strengths: SkillTopicAnalytics[];
  recommendations: AnalyticsRecommendation[];
  moduleMetrics: ModuleMetric[];
  weeklyEvolution: WeeklyEvolutionPoint[];
  timeByCategory: Array<{ category: SkillAreaId; seconds: number }>;
  retention: number | null;
};
