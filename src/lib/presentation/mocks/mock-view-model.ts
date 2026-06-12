// ── Shared badge type reused from other VMs ───────────────────────────────────

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export type Badge = {
  label: string;
  variant: BadgeVariant;
};

// ── Mock list item ────────────────────────────────────────────────────────────

export type MockListItemVM = {
  id: string;
  title: string;
  typeLabel: string;
  statusLabel: string;
  statusBadge: Badge;
  scoreBadge: Badge;
  date: string; // YYYY-MM-DD
  dateLabel: string; // "há 3 dias" style or formatted
  hasAudio: boolean;
  hasRubric: boolean;
  evidenceCount: number;
  gapCount: number;
  strengthCount: number;
};

// ── Mock detail ───────────────────────────────────────────────────────────────

export type MockDetailVM = {
  id: string;
  title: string;
  typeLabel: string;
  statusLabel: string;
  statusBadge: Badge;
  date: string;
  prompt: string;
  response: string;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  scoreBadge: Badge;
  rubricResult: MockRubricVM | null;
  evidence: MockEvidenceVM[];
  hasAudio: boolean;
  audioRecordingId: string | null;
  durationLabel: string | null;
};

// ── Rubric VM ─────────────────────────────────────────────────────────────────

export type MockRubricCriterionVM = {
  id: string;
  label: string;
  description: string;
  rating: number;
  ratingLabel: string;
  isEvaluated: boolean;
};

export type MockRubricVM = {
  definitionId: string;
  version: number;
  criteria: MockRubricCriterionVM[];
  scorePercent: number | null;
  evaluatedCount: number;
  totalCount: number;
};

// ── Evidence VM ───────────────────────────────────────────────────────────────

export type MockEvidenceVM = {
  id: string;
  area: string;
  kind: "strength" | "gap";
  kindLabel: string;
  description: string;
  confidence: number;
  hasReview: boolean;
};

// ── Summary stats ─────────────────────────────────────────────────────────────

export type MocksSummaryVM = {
  totalMocks: number;
  completedMocks: number;
  avgScore: number | null;
  avgScoreLabel: string;
  recentGapCount: number;
  lastMockDate: string | null;
  lastMockDateLabel: string;
};

// ── STAR VM ───────────────────────────────────────────────────────────────────

export type StarQuestionVM = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  hasAnswer: boolean;
  selfRating: number | null;
  selfRatingLabel: string;
  answeredAt: string | null;
};

export type StarAnswerVM = {
  id: string;
  questionId: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  learning: string;
  conciseVersion: string;
  englishVersion: string;
  selfRating: number | null;
  selfRatingLabel: string;
  hasAudio: boolean;
  audioRecordingId: string | null;
  durationLabel: string | null;
  updatedAt: string;
};

// ── System Design VM ──────────────────────────────────────────────────────────

export type SystemDesignTemplateVM = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  sectionCount: number;
  checklistCount: number;
  hasDraft: boolean;
  draftProgress: number; // 0–100, % of sections with content
  linkedMockId: string | null;
};

// ── Full Interview VM ─────────────────────────────────────────────────────────

export type FullInterviewSessionVM = {
  id: string;
  title: string;
  statusLabel: string;
  statusBadge: Badge;
  stepCount: number;
  completedSteps: number;
  currentStepIndex: number;
  currentStepTypeLabel: string;
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
};

// ── Checklist VM ──────────────────────────────────────────────────────────────

export type ChecklistGroupVM = {
  id: string;
  label: string;
  items: ChecklistItemVM[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
};

export type ChecklistItemVM = {
  id: string;
  text: string;
  isCustom: boolean;
  checked: boolean;
  checkedAt: string | null;
};

export type ChecklistSessionVM = {
  id: string;
  label: string | null;
  groups: ChecklistGroupVM[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
  createdAt: string;
};
