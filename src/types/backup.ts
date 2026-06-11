import type {
  ChecklistItemRecord,
  FlashcardRecord,
  LearningJournalRecord,
  MetadataRecord,
  MigrationReport,
  MockRecord,
  NoteRecord,
  PlanProgressRecord,
  PlaygroundSolutionRecord,
  QuizAttemptRecord,
  QuizReviewRecord,
  ReviewRecord,
  SettingsRecord,
  TimerSessionRecord,
  WeeklyReflectionRecord,
} from "./database";

export const BACKUP_APP_ID = "uber-prep" as const;
export const BACKUP_VERSION = 1;

export type ImportMode = "merge" | "replace";

export type BackupData = {
  settings: SettingsRecord[];
  planProgress: PlanProgressRecord[];
  reviews: ReviewRecord[];
  flashcards: FlashcardRecord[];
  quizAttempts: QuizAttemptRecord[];
  quizReviews: QuizReviewRecord[];
  timerSessions: TimerSessionRecord[];
  mocks: MockRecord[];
  notes: NoteRecord[];
  weeklyReflections: WeeklyReflectionRecord[];
  learningJournal: LearningJournalRecord[];
  playgroundSolutions: PlaygroundSolutionRecord[];
  checklistItems: ChecklistItemRecord[];
  metadata: MetadataRecord[];
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
