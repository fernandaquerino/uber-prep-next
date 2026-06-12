// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewSourceType = "plan" | "flashcard" | "quiz" | "mock" | "manual";

export type ReviewStatus =
  | "scheduled"
  | "due"
  | "completed"
  | "dismissed"
  | "rescheduled"
  | "cancelled";

export type ReviewResult = "again" | "hard" | "good" | "easy";

/** Backward-compat alias — new code should use ReviewResult */
export type ReviewRating = ReviewResult;

export type ReviewReason =
  | "completed_plan_block"
  | "marked_manually"
  | "stuck"
  | "low_confidence"
  | "high_difficulty"
  | "failed_review"
  | "future_flashcard"
  | "future_quiz"
  | "future_mock_gap";

export type ReviewHistoryEntry = {
  id?: string;
  date: string;
  result?: ReviewResult;
  previousCycleIndex?: number;
  nextCycleIndex?: number;
  nextReviewAt?: string | null;
  response?: string;
};

export type ReviewRecord = {
  id: string;
  sourceType: ReviewSourceType;
  sourceId: string;
  status: ReviewStatus;
  scheduledFor: string;
  originalScheduledFor?: string;
  cycleIndex: number;
  reason?: ReviewReason | string;
  lastResult?: ReviewResult;
  /** Backward-compat alias for lastResult */
  lastRating?: ReviewResult;
  history: ReviewHistoryEntry[];
  markedAt?: string;
  cancelledAt?: string;
  dismissedAt?: string;
  legacyBlockKey?: string;
  legacyBlockLabel?: string;
  legacyLeetcode?: string | null;
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Plan Progress ────────────────────────────────────────────────────────────

export type PlanProgressStatus = "pending" | "in_progress" | "completed" | "stuck" | "skipped";

export type PlanProgressRecord = {
  id: string;
  blockId: string;
  legacyBlockKey?: string;
  planDayId?: string;
  planDaySequence?: number;
  status: PlanProgressStatus;
  scheduledDate?: string;
  originalScheduledDate?: string;
  startedAt?: string;
  skippedAt?: string;
  notes?: string;
  patternUsed?: string;
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  solutionNotes?: string;
  difficulty?: number;
  confidence?: number;
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressEventType =
  | "created"
  | "started"
  | "completed"
  | "marked_stuck"
  | "returned_to_pending"
  | "skipped"
  | "restored"
  | "rescheduled"
  | "schedule_shifted"
  | "notes_updated"
  | "difficulty_updated"
  | "confidence_updated"
  | "minutes_updated"
  | "undone";

export type ProgressEventRecord = {
  id: string;
  blockId: string;
  type: ProgressEventType;
  occurredAt: string;
  previousProgress?: PlanProgressRecord;
  nextProgress?: PlanProgressRecord;
  previousValue?: unknown;
  nextValue?: unknown;
  metadata?: Record<string, unknown>;
  actionGroupId?: string;
  undoneAt?: string;
};

export type ScheduleOverrideType = "reschedule" | "shift";

export type ScheduleOverrideRecord = {
  id: string;
  blockId: string;
  type: ScheduleOverrideType;
  fromDate: string;
  toDate: string;
  createdAt: string;
  actionGroupId?: string;
};

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type FlashcardStatus = "pending" | "known" | "review";
/** "initial" = seed data; "user" = manually created; "migrated" = imported from old app; "plan" = created from a plan block */
export type FlashcardSource = "initial" | "user" | "migrated" | "plan";
export type FlashcardLifecycleStatus = "active" | "archived";

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
  /** Legacy spaced-repetition status kept for backwards compat; new logic uses ReviewRecord */
  status: FlashcardStatus;
  source: FlashcardSource;
  /** Active = visible in sessions; Archived = hidden but history preserved */
  lifecycleStatus: FlashcardLifecycleStatus;
  /** ID of a plan block this card was created from */
  sourceId?: string;
  archivedAt?: string;
  nextReview: string | null;
  knownAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  reviews: FlashcardReviewEntry[];
  createdAt: string;
  updatedAt: string;
};

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export type QuizQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "open_text"
  | "interview";

export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizQuestionSource = "seed" | "manual" | "flashcard" | "imported";
export type QuizQuestionLifecycleStatus = "active" | "archived";

export type QuizOptionRecord = {
  id: string;
  label: string;
};

export type QuizCorrectAnswerRecord =
  | { kind: "single"; optionId: string }
  | { kind: "multiple"; optionIds: string[] }
  | { kind: "boolean"; value: boolean };

export type QuizQuestionRecord = {
  id: string;
  prompt: string;
  code?: string;
  type: QuizQuestionType;
  category: string;
  difficulty: QuizDifficulty;
  group?: string;
  week?: number;
  topicIds: string[];
  tags: string[];
  options?: QuizOptionRecord[];
  correctAnswer?: QuizCorrectAnswerRecord;
  explanation?: string;
  referenceAnswer?: string;
  evaluationCriteria?: string[];
  sourceType: QuizQuestionSource;
  sourceId?: string;
  lifecycleStatus: QuizQuestionLifecycleStatus;
  createdAt: string;
  updatedAt: string;
};

export type QuizSessionType =
  | "daily"
  | "filtered"
  | "error_review"
  | "due_review"
  | "flashcard_generated"
  | "custom";

export type QuizSessionStatus = "in_progress" | "completed" | "abandoned";
export type QuizFeedbackMode = "immediate" | "end_of_session";

export type QuizSessionConfigRecord = {
  type: QuizSessionType;
  questionLimit?: number;
  category?: string;
  difficulty?: QuizDifficulty;
  questionType?: QuizQuestionType;
  group?: string;
  week?: number;
  tag?: string;
  feedbackMode: QuizFeedbackMode;
};

export type QuizSessionRecord = {
  id: string;
  type: QuizSessionType;
  status: QuizSessionStatus;
  dailyDate?: string;
  questionIds: string[];
  currentIndex: number;
  config: QuizSessionConfigRecord;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  elapsedSeconds: number;
};

export type QuizSelfAssessment = "incorrect" | "partial" | "correct";

export type QuizAnswerValue =
  | { kind: "single"; optionId: string }
  | { kind: "multiple"; optionIds: string[] }
  | { kind: "boolean"; value: boolean }
  | { kind: "text"; value: string };

export type QuizAnswerRecord = {
  id: string;
  sessionId: string;
  questionId: string;
  answer: QuizAnswerValue | null;
  draft?: string;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  score: number | null;
  selfAssessment?: QuizSelfAssessment;
  timeSeconds: number;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizMarkedQuestionRecord = {
  id: string;
  questionId: string;
  createdAt: string;
};

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

export type TimerMode = "countdown" | "stopwatch";
export type ActiveTimerStatus = "running" | "paused";
export type TimerSourceType =
  | "plan_block"
  | "review"
  | "flashcard_session"
  | "quiz_session"
  | "playground_solution"
  | "mock"
  | "note"
  | "manual"
  | "general";

export type TimerSessionStatus = "completed" | "stopped_early" | "cancelled";

export type ActiveTimerRecord = {
  id: "active-timer";
  mode: TimerMode;
  status: ActiveTimerStatus;
  sourceType: TimerSourceType;
  sourceId?: string;
  category: string;
  title: string;
  targetDurationSeconds?: number;
  startedAt: string;
  lastResumedAt: string;
  pausedAt?: string;
  accumulatedSeconds: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TimerSessionRecord = {
  id: string;
  sourceType: TimerSourceType;
  sourceId?: string;
  category: string;
  title: string;
  mode: TimerMode;
  status: TimerSessionStatus;
  targetDurationSeconds?: number;
  actualDurationSeconds: number;
  startedAt: string;
  endedAt: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TimerDefaultMode = TimerMode;

export type TimerSettingsRecord = {
  id: "timer-settings";
  defaultMode: TimerDefaultMode;
  defaultPresetSeconds: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  confirmBeforeCancel: boolean;
  showCompactTimer: boolean;
  longSessionThresholdSeconds: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Legacy type values are preserved for migration compatibility */
export type MockType =
  | "coding"
  | "frontend_coding"
  | "system_design"
  | "behavioral"
  | "full_loop"
  // Legacy values (kept for migration compat)
  | "Coding"
  | "Frontend Coding"
  | "System Design"
  | "Behavioral"
  | "Full Loop";

export type MockStatus = "draft" | "in_progress" | "completed" | "cancelled";

export type MockSourceType =
  | "manual"
  | "star_question"
  | "system_design_template"
  | "full_interview"
  | "plan";

/** Rubric rating scale: 0 = not evaluated, 1-5 = quality */
export type RubricRating = 0 | 1 | 2 | 3 | 4 | 5;

export type MockRubricCriterion = {
  id: string;
  label: string;
  description?: string;
  rating: RubricRating;
};

export type MockRubricResult = {
  rubricDefinitionId: string;
  version: number;
  criteria: MockRubricCriterion[];
  score: number | null;
};

export type MockRecord = {
  id: string;
  date: string;
  type: MockType;
  status: MockStatus;
  title: string;

  // Content
  prompt?: string;
  response?: string;
  solution?: string;

  // Assessment
  feedback?: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];

  // Rubric (new structured form)
  rubricDefinitionId?: string;
  rubricVersion?: number;
  rubricResult?: MockRubricResult;
  score?: number | null;

  // Legacy fields kept for migration
  question?: string;
  rubric?: Record<string, number>;
  readinessScore?: number;
  legacyScore?: number;

  // Links
  sourceType?: MockSourceType;
  sourceId?: string;
  linkedPlanBlockId?: string;
  linkedTimerSessionIds?: string[];
  audioRecordingId?: string;

  // Timestamps
  hasAudio: boolean;
  durationSeconds?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MockAudioRecord = {
  id: string;
  mockId?: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
  createdAt: string;
};

// ─── Mock Evidence ────────────────────────────────────────────────────────────

export type MockEvidenceKind = "strength" | "gap";

export type MockEvidence = {
  id: string;
  mockId: string;
  area: string;
  criterionId?: string;
  kind: MockEvidenceKind;
  description: string;
  confidence: number;
  createdAt: string;
};

// ─── STAR Answers ─────────────────────────────────────────────────────────────

export type StarAnswer = {
  id: string;
  questionId: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  learning?: string;
  conciseVersion?: string;
  englishVersion?: string;
  durationSeconds?: number;
  audioRecordingId?: string;
  selfRating?: RubricRating;
  linkedMockId?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── System Design ────────────────────────────────────────────────────────────

export type SystemDesignDraft = {
  id: string;
  templateId: string;
  templateVersion: number;
  answers: Record<string, string>;
  checklistState: Record<string, boolean>;
  linkedMockId?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Full Interview ───────────────────────────────────────────────────────────

export type FullInterviewStepType =
  | "coding"
  | "frontend_coding"
  | "system_design"
  | "behavioral"
  | "reflection";

export type FullInterviewStepStatus = "pending" | "in_progress" | "completed" | "skipped";

export type FullInterviewStep = {
  id: string;
  sessionId: string;
  type: FullInterviewStepType;
  order: number;
  sourceId?: string;
  prompt?: string;
  response?: string;
  rubricResult?: MockRubricResult;
  audioRecordingId?: string;
  status: FullInterviewStepStatus;
  durationSeconds?: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FullInterviewSession = {
  id: string;
  title: string;
  status: MockStatus;
  stepIds: string[];
  currentStepIndex: number;
  linkedMockIds?: string[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Checklist Sessions ───────────────────────────────────────────────────────

export type ChecklistSessionItem = {
  id: string;
  group: string;
  text: string;
  isCustom: boolean;
  checked: boolean;
  checkedAt?: string;
};

export type ChecklistSession = {
  id: string;
  label?: string;
  items: ChecklistSessionItem[];
  completedCount: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export type NoteType = "category" | "topic";

export type NoteRecord = {
  id: string;
  type: NoteType;
  title: string;
  category?: string;
  topicId?: string;
  tags: string[];
  content: string;
  lifecycleStatus: "active" | "archived";
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteVersionReason = "manual" | "before_template" | "before_restore" | "restore";

export type NoteVersion = {
  id: string;
  noteId: string;
  title: string;
  content: string;
  reason: NoteVersionReason;
  createdAt: string;
};

export type NoteLinkTargetType =
  | "plan_block"
  | "flashcard"
  | "quiz_question"
  | "mock"
  | "review";

export type NoteLink = {
  id: string;
  noteId: string;
  targetType: NoteLinkTargetType;
  targetId: string;
  createdAt: string;
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
