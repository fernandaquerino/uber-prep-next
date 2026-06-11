// Types for data stored in the legacy localStorage (uber-prep v1/v2)
// These are used only by the migration layer — never import in UI or domain code.

// ─── uber-prep-v2 ─────────────────────────────────────────────────────────────

export type LegacyBlockStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "stuck"
  | "skipped"
  | "rescheduled";

export type LegacyBlockProgress = {
  status?: LegacyBlockStatus;
  patternUsed?: string;
  difficulty?: number;
  actualMinutes?: number;
  completedAt?: string;
};

export type LegacyReviewEntry = {
  blockKey: string;
  blockLabel?: string;
  leetcode?: string | null;
  nextReview: string | null;
  cycleIndex: number;
  doneAt?: string;
  reason?: string;
  history?: string[];
  selfRatings?: Array<{ date: string; result: string }>;
  lastRating?: string;
};

export type LegacyMock = {
  id: number | string;
  date: string;
  type: string;
  question: string;
  solution?: string;
  feedback?: string;
  strengths?: string;
  weaknesses?: string;
  nextSteps?: string;
  rubric?: Record<string, number>;
  readinessScore?: number;
  hasAudio?: boolean;
  createdAt?: number | string;
};

export type LegacyPlaygroundSolution = {
  id: string | number;
  title?: string;
  language?: string;
  code?: string;
  output?: string;
  notes?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LegacyJournalEntry = {
  content?: string;
  mood?: string;
  blockers?: string;
  wins?: string;
  updatedAt?: string;
};

export type LegacyWeeklyReflection = {
  weekNumber?: number;
  content?: string;
  rating?: number;
  blockers?: string;
  wins?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LegacyExplainEntry = {
  answer?: string;
  updatedAt?: string;
};

export type LegacySystemDesignDraft = {
  answers?: Record<string, unknown>;
  updatedAt?: string;
};

export type LegacyTopicNote = {
  text?: string;
  updatedAt?: string;
};

export type LegacyProgressData = {
  blocks?: Record<string, LegacyBlockProgress>;
  notes?: Record<string, string>;
  topicNotes?: Record<string, string | LegacyTopicNote>;
  goals?: Record<string, boolean>;
  reviews?: Record<string, LegacyReviewEntry>;
  startDate?: string | null;
  studyDays?: string[];
  mocks?: LegacyMock[];
  playground?: LegacyPlaygroundSolution[];
  learningJournal?: Record<string, LegacyJournalEntry>;
  weeklyReflections?: Record<string, LegacyWeeklyReflection>;
  explainWithoutNotes?: Record<string, Record<string, LegacyExplainEntry>>;
  systemDesignDrafts?: Record<string, LegacySystemDesignDraft>;
};

// ─── uber-prep-flashcards ─────────────────────────────────────────────────────

export type LegacyFlashcardReview = {
  date: string;
  result: string;
};

export type LegacyFlashcard = {
  id: string;
  front: string;
  back: string;
  category: string;
  tags?: string[];
  createdAt?: string;
  reviews?: LegacyFlashcardReview[];
  nextReview?: string | null;
  status?: string;
  knownAt?: string | null;
  lastReviewedAt?: string | null;
  reviewCount?: number;
};

export type LegacyFlashcardsData = {
  cards?: LegacyFlashcard[];
};

// ─── uber-prep-quizzes ────────────────────────────────────────────────────────

export type LegacyQuizAttempt = {
  id: string;
  quizId?: string | null;
  dailyDate?: string | null;
  attemptNumber?: number;
  mode?: string;
  questionIds?: string[];
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  skippedAnswers?: number;
  accuracyPercentage?: number;
  total?: number;
  correct?: number;
  accuracy?: number;
  totalTimeSeconds?: number;
  averageTimePerQuestion?: number;
  avgTime?: number;
};

export type LegacyQuizAnswer = {
  questionId: string;
  attemptId?: string;
  value?: string;
  selfScore?: string;
  skipped?: boolean;
  correct?: boolean;
  topic?: string;
  group?: string;
  difficulty?: string;
  type?: string;
  answeredAt?: string;
  elapsedSeconds?: number;
};

export type LegacyQuizReview = {
  questionId?: string;
  topic?: string;
  group?: string;
  difficulty?: string;
  nextReview?: string | null;
  cycleIndex?: number;
  createdAt?: string;
  history?: string[];
  lastAnswer?: string;
  lastRating?: string;
};

export type LegacyDailyQuiz = {
  id?: string;
  date?: string;
  week?: number;
  questionIds?: string[];
  composition?: Record<string, string[]>;
  createdAt?: string;
  completedAttemptId?: string | null;
};

export type LegacyQuizzesData = {
  attempts?: LegacyQuizAttempt[];
  answers?: LegacyQuizAnswer[];
  reviews?: Record<string, LegacyQuizReview>;
  customQuestions?: unknown[];
  dailyQuizzes?: Record<string, LegacyDailyQuiz>;
  markedQuestions?: Record<string, boolean>;
};

// ─── uber-prep-timer-sessions ─────────────────────────────────────────────────

export type LegacyTimerSession = {
  id?: string;
  category?: string;
  duration?: number;
  preset?: number;
  completedAt?: string;
  date?: string;
  weekNumber?: number;
};

// ─── uber-prep-active-timer ───────────────────────────────────────────────────

export type LegacyActiveTimer = {
  preset?: number;
  total?: number;
  remaining?: number;
  running?: boolean;
  finished?: boolean;
  muted?: boolean;
  category?: string;
  deadline?: number | null;
  savedElapsed?: number;
  updatedAt?: number;
};

// ─── uber-prep-checklist ──────────────────────────────────────────────────────

export type LegacyChecklistData = {
  checked?: Record<string, boolean>;
  evidence?: Record<string, string>;
};

// ─── Keys present in localStorage ─────────────────────────────────────────────

export const LEGACY_STORAGE_KEYS = {
  progress: "uber-prep-v2",
  flashcards: "uber-prep-flashcards",
  quizzes: "uber-prep-quizzes",
  timerSessions: "uber-prep-timer-sessions",
  activeTimer: "uber-prep-active-timer",
  checklist: "uber-prep-checklist",
  theme: "uber-prep-theme",
  migrationDone: "uber-prep-migration-done",
} as const;

export type LegacyStorageKey = (typeof LEGACY_STORAGE_KEYS)[keyof typeof LEGACY_STORAGE_KEYS];

export const MOCK_AUDIO_KEY_PREFIX = "uber-prep-mock-audio-";
