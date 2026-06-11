// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewSourceType = "plan" | "flashcard" | "quiz" | "mock" | "manual";
export type ReviewStatus = "scheduled" | "due" | "completed" | "dismissed" | "rescheduled";
export type ReviewRating = "good" | "again" | "hard";

export type ReviewHistoryEntry = {
  date: string;
  result?: ReviewRating;
};

export type ReviewRecord = {
  id: string;
  sourceType: ReviewSourceType;
  sourceId: string;
  status: ReviewStatus;
  scheduledFor: string;
  cycleIndex: number;
  reason?: string;
  lastRating?: ReviewRating;
  history: ReviewHistoryEntry[];
  legacyBlockKey?: string;
  legacyBlockLabel?: string;
  legacyLeetcode?: string | null;
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Plan Progress ────────────────────────────────────────────────────────────

export type PlanProgressStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "stuck"
  | "skipped"
  | "rescheduled";

export type PlanProgressRecord = {
  id: string;
  blockId: string;
  legacyBlockKey?: string;
  status: PlanProgressStatus;
  scheduledDate?: string;
  originalScheduledDate?: string;
  notes?: string;
  patternUsed?: string;
  difficulty?: number;
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type FlashcardStatus = "pending" | "known" | "review";
export type FlashcardSource = "initial" | "user" | "migrated";

export type FlashcardReviewEntry = {
  date: string;
  result: "knew" | "didnt";
};

export type FlashcardRecord = {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  status: FlashcardStatus;
  source: FlashcardSource;
  nextReview: string | null;
  knownAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  reviews: FlashcardReviewEntry[];
  createdAt: string;
  updatedAt: string;
};

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export type QuizAttemptRecord = {
  id: string;
  quizId: string | null;
  dailyDate: string | null;
  attemptNumber: number;
  mode: string;
  questionIds: string[];
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
};

// ─── Quiz Reviews ─────────────────────────────────────────────────────────────

export type QuizReviewRecord = {
  id: string;
  questionId: string;
  topic?: string;
  group?: string;
  difficulty?: string;
  nextReview: string | null;
  cycleIndex: number;
  history: string[];
  lastAnswer?: string;
  lastRating?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Timer ────────────────────────────────────────────────────────────────────

export type TimerSessionStatus = "completed" | "interrupted";

export type TimerSessionRecord = {
  id: string;
  category: string;
  durationSeconds: number;
  presetSeconds: number;
  startedAt: string;
  completedAt: string;
  date: string;
  weekNumber?: number;
  status: TimerSessionStatus;
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

export type MockType = "Coding" | "System Design" | "Behavioral" | "Full Loop";

export type MockRecord = {
  id: string;
  date: string;
  type: MockType;
  question: string;
  solution?: string;
  feedback?: string;
  strengths?: string;
  weaknesses?: string;
  nextSteps?: string;
  rubric?: Record<string, number>;
  readinessScore?: number;
  hasAudio: boolean;
  createdAt: string;
};

export type MockAudioRecord = {
  id: string;
  mockId: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  createdAt: string;
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export type NoteType = "category" | "topic";

export type NoteRecord = {
  id: string;
  type: NoteType;
  category?: string;
  topicId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Weekly Reflections ───────────────────────────────────────────────────────

export type WeeklyReflectionRecord = {
  id: string;
  weekNumber: number;
  content?: string;
  rating?: number;
  blockers?: string;
  wins?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Learning Journal ─────────────────────────────────────────────────────────

export type LearningJournalRecord = {
  id: string;
  date: string;
  content?: string;
  mood?: string;
  blockers?: string;
  wins?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Playground ───────────────────────────────────────────────────────────────

export type PlaygroundSolutionRecord = {
  id: string;
  title?: string;
  language?: string;
  code?: string;
  output?: string;
  notes?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Checklist ────────────────────────────────────────────────────────────────

export type ChecklistItemRecord = {
  id: string;
  phase: string;
  itemText: string;
  checked: boolean;
  evidence: string | null;
  updatedAt: string;
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export type AppTheme = "light" | "dark" | "system";

export type SettingsRecord = {
  id: "app-settings";
  startDate: string | null;
  timezone: string;
  theme: AppTheme;
  createdAt: string;
  updatedAt: string;
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export type MigrationStatus = "none" | "completed" | "partial" | "failed";

export type MigrationIssue = {
  source: string;
  id?: string;
  reason: string;
  data?: unknown;
};

export type MigrationReport = {
  startedAt: string;
  finishedAt: string;
  status: "success" | "partial" | "failed";
  sourcesFound: string[];
  imported: Record<string, number>;
  skipped: Record<string, number>;
  conflicts: MigrationIssue[];
  invalidRecords: MigrationIssue[];
  orphanedRecords: MigrationIssue[];
  audioFailures: MigrationIssue[];
};

export type MetadataRecord = {
  id: "app-metadata";
  schemaVersion: number;
  migrationStatus: MigrationStatus;
  migratedAt: string | null;
  backupVersion: number;
  seedsRun: string[];
  lastMigrationReport?: MigrationReport;
  createdAt: string;
  updatedAt: string;
};
