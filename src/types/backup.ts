import type {
  ActiveTimerRecord,
  ChecklistItemRecord,
  ChecklistSession,
  FlashcardRecord,
  FullInterviewSession,
  FullInterviewStep,
  LearningJournalRecord,
  MetadataRecord,
  MockEvidence,
  MigrationReport,
  MockRecord,
  NoteLink,
  NoteRecord,
  NoteVersion,
  PlanProgressRecord,
  ProgressEventRecord,
  PlaygroundSolutionRecord,
  QuizAnswerRecord,
  QuizAttemptRecord,
  QuizMarkedQuestionRecord,
  QuizQuestionRecord,
  QuizReviewRecord,
  QuizSessionRecord,
  ResourceProgressRecord,
  ResourceRecord,
  ReviewRecord,
  ScheduleOverrideRecord,
  SettingsRecord,
  StarAnswer,
  SystemDesignDraft,
  TechnicalEnglishPracticeRecord,
  TechnicalEnglishRecord,
  TimerSettingsRecord,
  TimerSessionRecord,
  WeeklyReflectionRecord,
  WeeklyReportSnapshotRecord,
} from "./database";

export const BACKUP_APP_ID = "uber-prep" as const;
export const BACKUP_VERSION = 1;

export type ImportMode = "merge" | "replace";

export type BackupData = {
  settings: SettingsRecord[];
  planProgress: PlanProgressRecord[];
  progressEvents: ProgressEventRecord[];
  scheduleOverrides: ScheduleOverrideRecord[];
  reviews: ReviewRecord[];
  flashcards: FlashcardRecord[];
  quizQuestions: QuizQuestionRecord[];
  quizSessions: QuizSessionRecord[];
  quizAnswers: QuizAnswerRecord[];
  quizMarkedQuestions: QuizMarkedQuestionRecord[];
  quizAttempts: QuizAttemptRecord[];
  quizReviews: QuizReviewRecord[];
  activeTimer: ActiveTimerRecord[];
  timerSessions: TimerSessionRecord[];
  timerSettings: TimerSettingsRecord[];
  mocks: MockRecord[];
  mockEvidence: MockEvidence[];
  starAnswers: StarAnswer[];
  systemDesignDrafts: SystemDesignDraft[];
  fullInterviewSessions: FullInterviewSession[];
  fullInterviewSteps: FullInterviewStep[];
  checklistSessions: ChecklistSession[];
  notes: NoteRecord[];
  noteVersions: NoteVersion[];
  noteLinks: NoteLink[];
  weeklyReflections: WeeklyReflectionRecord[];
  weeklyReportSnapshots: WeeklyReportSnapshotRecord[];
  learningJournal: LearningJournalRecord[];
  playgroundSolutions: PlaygroundSolutionRecord[];
  checklistItems: ChecklistItemRecord[];
  metadata: MetadataRecord[];
  resources: ResourceRecord[];
  resourceProgress: ResourceProgressRecord[];
  technicalEnglishItems: TechnicalEnglishRecord[];
  technicalEnglishPractices: TechnicalEnglishPracticeRecord[];
};

export type BackupFile = {
  app: typeof BACKUP_APP_ID;
  backupVersion: number;
  schemaVersion: number;
  exportedAt: string;
  audioNote: string;
  audioCount: number;
  data: BackupData;
};

export type BackupImportResult = {
  mode: ImportMode;
  importedAt: string;
  counts: Record<keyof BackupData, number>;
  conflicts: Array<{ table: string; id: string; reason: string }>;
  errors: Array<{ table: string; id?: string; reason: string }>;
  success: boolean;
};

// Re-export for convenience
export type { MigrationReport };
