import Dexie, { type Table } from "dexie";
import { DATABASE_NAME, DATABASE_VERSION } from "./constants";
import type {
  ChecklistItemRecord,
  FlashcardRecord,
  LearningJournalRecord,
  MetadataRecord,
  MockAudioRecord,
  MockRecord,
  NoteRecord,
  PlanProgressRecord,
  ProgressEventRecord,
  PlaygroundSolutionRecord,
  QuizAttemptRecord,
  QuizReviewRecord,
  ReviewRecord,
  ScheduleOverrideRecord,
  SettingsRecord,
  TimerSessionRecord,
  WeeklyReflectionRecord,
} from "@/types/database";

export class UberPrepDatabase extends Dexie {
  settings!: Table<SettingsRecord, string>;
  planProgress!: Table<PlanProgressRecord, string>;
  progressEvents!: Table<ProgressEventRecord, string>;
  scheduleOverrides!: Table<ScheduleOverrideRecord, string>;
  reviews!: Table<ReviewRecord, string>;
  flashcards!: Table<FlashcardRecord, string>;
  quizAttempts!: Table<QuizAttemptRecord, string>;
  quizReviews!: Table<QuizReviewRecord, string>;
  timerSessions!: Table<TimerSessionRecord, string>;
  mocks!: Table<MockRecord, string>;
  mockAudio!: Table<MockAudioRecord, string>;
  notes!: Table<NoteRecord, string>;
  weeklyReflections!: Table<WeeklyReflectionRecord, string>;
  learningJournal!: Table<LearningJournalRecord, string>;
  playgroundSolutions!: Table<PlaygroundSolutionRecord, string>;
  checklistItems!: Table<ChecklistItemRecord, string>;
  metadata!: Table<MetadataRecord, string>;

  constructor(name: string = DATABASE_NAME, options?: ConstructorParameters<typeof Dexie>[1]) {
    super(name, options);

    this.version(DATABASE_VERSION).stores({
      settings: "id",
      planProgress: "id, blockId, status, scheduledDate, planDayId, planDaySequence",
      progressEvents: "id, blockId, type, occurredAt, actionGroupId",
      scheduleOverrides: "id, blockId, type, fromDate, toDate, actionGroupId",
      reviews: "id, sourceType, sourceId, scheduledFor, status, [status+scheduledFor]",
      flashcards: "id, category, *tags, status, nextReview",
      quizAttempts: "id, mode, dailyDate, createdAt",
      quizReviews: "id, questionId, nextReview, cycleIndex",
      timerSessions: "id, startedAt, category",
      mocks: "id, date, type",
      mockAudio: "id, mockId, createdAt",
      notes: "id, type, category, topicId, updatedAt",
      weeklyReflections: "id, weekNumber",
      learningJournal: "id, date",
      playgroundSolutions: "id, language, updatedAt",
      checklistItems: "id, phase",
      metadata: "id",
    });
  }
}
