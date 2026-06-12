import type {
  ActiveTimerRecord,
  ChecklistItemRecord,
  FlashcardRecord,
  LearningJournalRecord,
  MetadataRecord,
  MigrationReport,
  MockRecord,
  NoteRecord,
  PlanProgressRecord,
  ProgressEventRecord,
  PlaygroundSolutionRecord,
  QuizAttemptRecord,
  QuizReviewRecord,
  ResourceProgressRecord,
  ResourceRecord,
  ReviewRecord,
  ScheduleOverrideRecord,
  SettingsRecord,
  TechnicalEnglishPracticeRecord,
  TechnicalEnglishRecord,
  TimerSettingsRecord,
  TimerSessionRecord,
  WeeklyReflectionRecord,
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
  quizAttempts: QuizAttemptRecord[];
  quizReviews: QuizReviewRecord[];
  activeTimer: ActiveTimerRecord[];
  timerSessions: TimerSessionRecord[];
  timerSettings: TimerSettingsRecord[];
  mocks: MockRecord[];
  notes: NoteRecord[];
  weeklyReflections: WeeklyReflectionRecord[];
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
