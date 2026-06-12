import Dexie, { type Table } from "dexie";
import { DATABASE_NAME, DATABASE_VERSION } from "./constants";
import type {
  ActiveTimerRecord,
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
  QuizAnswerRecord,
  QuizAttemptRecord,
  QuizMarkedQuestionRecord,
  QuizQuestionRecord,
  QuizReviewRecord,
  QuizSessionRecord,
  ReviewRecord,
  ScheduleOverrideRecord,
  SettingsRecord,
  TimerSettingsRecord,
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
  quizQuestions!: Table<QuizQuestionRecord, string>;
  quizSessions!: Table<QuizSessionRecord, string>;
  quizAnswers!: Table<QuizAnswerRecord, string>;
  quizMarkedQuestions!: Table<QuizMarkedQuestionRecord, string>;
  quizAttempts!: Table<QuizAttemptRecord, string>;
  quizReviews!: Table<QuizReviewRecord, string>;
  activeTimer!: Table<ActiveTimerRecord, string>;
  timerSessions!: Table<TimerSessionRecord, string>;
  timerSettings!: Table<TimerSettingsRecord, string>;
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

    const storesV3 = {
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
    };

    // v4 adds lifecycleStatus index on flashcards
    const storesV4 = {
      ...storesV3,
      flashcards: "id, category, *tags, status, nextReview, lifecycleStatus, source",
    };

    this.version(2).stores(storesV3);
    this.version(3).stores(storesV3);
    this.version(4)
      .stores(storesV4)
      .upgrade((tx) => {
        // Backfill lifecycleStatus for all existing flashcards
        return tx
          .table("flashcards")
          .toCollection()
          .modify((card: FlashcardRecord) => {
            if (!card.lifecycleStatus) {
              card.lifecycleStatus = "active";
            }
          });
      });

    const storesV5 = {
      ...storesV4,
      quizQuestions:
        "id, category, difficulty, type, group, week, lifecycleStatus, sourceType, *tags, *topicIds",
      quizSessions: "id, type, status, dailyDate, startedAt, updatedAt",
      quizAnswers: "id, sessionId, questionId, isSubmitted, submittedAt",
      quizMarkedQuestions: "id, questionId, createdAt",
    };

    this.version(5).stores(storesV5);

    const storesV6 = {
      ...storesV5,
      activeTimer: "id, status, sourceType, sourceId, category, updatedAt",
      timerSessions: "id, date, startedAt, endedAt, category, sourceType, sourceId, status, mode",
      timerSettings: "id",
    };

    this.version(DATABASE_VERSION)
      .stores(storesV6)
      .upgrade((tx) =>
        tx
          .table("timerSessions")
          .toCollection()
          .modify((session) => {
            const legacy = session as TimerSessionRecord & {
              durationSeconds?: number;
              presetSeconds?: number;
              completedAt?: string;
              weekNumber?: number;
            };

            if (legacy.actualDurationSeconds !== undefined) return;

            const endedAt = legacy.completedAt ?? legacy.endedAt ?? legacy.startedAt;
            const actualDurationSeconds = Math.max(0, legacy.durationSeconds ?? 0);
            const targetDurationSeconds =
              legacy.presetSeconds && legacy.presetSeconds > 0 ? legacy.presetSeconds : undefined;
            const now = new Date().toISOString();

            legacy.sourceType = "general";
            legacy.category = legacy.category || "general";
            legacy.title = "Sessão de foco migrada";
            legacy.mode = targetDurationSeconds ? "countdown" : "stopwatch";
            legacy.status = legacy.status === "completed" ? "completed" : "stopped_early";
            legacy.targetDurationSeconds = targetDurationSeconds;
            legacy.actualDurationSeconds = actualDurationSeconds;
            legacy.endedAt = endedAt;
            legacy.date = legacy.date ?? endedAt.slice(0, 10);
            legacy.createdAt = legacy.createdAt ?? legacy.startedAt ?? now;
            legacy.updatedAt = legacy.updatedAt ?? endedAt;

            delete legacy.durationSeconds;
            delete legacy.presetSeconds;
            delete legacy.completedAt;
            delete legacy.weekNumber;
          }),
      );
  }
}
