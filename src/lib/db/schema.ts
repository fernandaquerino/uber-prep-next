import Dexie, { type Table } from "dexie";
import { DATABASE_NAME, DATABASE_VERSION } from "./constants";
import type {
  ActiveTimerRecord,
  ChecklistItemRecord,
  ChecklistSession,
  FlashcardRecord,
  FullInterviewSession,
  FullInterviewStep,
  LearningJournalRecord,
  MetadataRecord,
  MockAudioRecord,
  MockEvidence,
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
  mockEvidence!: Table<MockEvidence, string>;
  starAnswers!: Table<StarAnswer, string>;
  systemDesignDrafts!: Table<SystemDesignDraft, string>;
  fullInterviewSessions!: Table<FullInterviewSession, string>;
  fullInterviewSteps!: Table<FullInterviewStep, string>;
  checklistSessions!: Table<ChecklistSession, string>;
  notes!: Table<NoteRecord, string>;
  noteVersions!: Table<NoteVersion, string>;
  noteLinks!: Table<NoteLink, string>;
  weeklyReflections!: Table<WeeklyReflectionRecord, string>;
  weeklyReportSnapshots!: Table<WeeklyReportSnapshotRecord, string>;
  learningJournal!: Table<LearningJournalRecord, string>;
  playgroundSolutions!: Table<PlaygroundSolutionRecord, string>;
  checklistItems!: Table<ChecklistItemRecord, string>;
  metadata!: Table<MetadataRecord, string>;
  resources!: Table<ResourceRecord, string>;
  resourceProgress!: Table<ResourceProgressRecord, string>;
  technicalEnglishItems!: Table<TechnicalEnglishRecord, string>;
  technicalEnglishPractices!: Table<TechnicalEnglishPracticeRecord, string>;

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

    this.version(6)
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

    // v7: new mock-related tables + backfill MockRecord fields
    const storesV7 = {
      ...storesV6,
      mocks: "id, date, type, status, updatedAt",
      mockEvidence: "id, mockId, area, kind, createdAt",
      starAnswers: "id, questionId, createdAt, updatedAt",
      systemDesignDrafts: "id, templateId, updatedAt",
      fullInterviewSessions: "id, status, createdAt, updatedAt",
      fullInterviewSteps: "id, sessionId, type, status",
      checklistSessions: "id, createdAt, updatedAt",
    };

    this.version(7)
      .stores(storesV7)
      .upgrade((tx) => {
        const now = new Date().toISOString();
        return tx
          .table("mocks")
          .toCollection()
          .modify((record: MockRecord) => {
            // Backfill status
            if (!record.status) {
              record.status = "completed";
            }
            // Backfill title from legacy question field
            if (!record.title) {
              const src = record.question ?? record.prompt ?? "";
              record.title = src.slice(0, 80) || "Mock sem título";
            }
            // Backfill updatedAt
            if (!record.updatedAt) {
              record.updatedAt = record.createdAt ?? now;
            }
            // Backfill arrays from legacy string fields
            if (!Array.isArray(record.strengths)) {
              const s = (record as MockRecord & { strengths?: string }).strengths;
              record.strengths = s && typeof s === "string" && s.trim() ? [s.trim()] : [];
            }
            if (!Array.isArray(record.weaknesses)) {
              const w = (record as MockRecord & { weaknesses?: string }).weaknesses;
              record.weaknesses = w && typeof w === "string" && w.trim() ? [w.trim()] : [];
            }
            if (!Array.isArray(record.nextSteps)) {
              const n = (record as MockRecord & { nextSteps?: string }).nextSteps;
              record.nextSteps = n && typeof n === "string" && n.trim() ? [n.trim()] : [];
            }
            // Preserve legacy score as legacyScore if rubricResult is not present
            if (record.readinessScore !== undefined && record.legacyScore === undefined) {
              record.legacyScore = record.readinessScore;
            }
            // Normalize legacy mock type
            const legacyTypeMap: Record<string, MockRecord["type"]> = {
              Coding: "coding",
              "Frontend Coding": "frontend_coding",
              "System Design": "system_design",
              Behavioral: "behavioral",
              "Full Loop": "full_loop",
            };
            if (legacyTypeMap[record.type as string]) {
              record.type = legacyTypeMap[record.type as string]!;
            }
          });
      });

    // v8: extended notes schema + new noteVersions and noteLinks tables
    const storesV8 = {
      ...storesV7,
      notes: "id, type, title, *tags, category, topicId, lifecycleStatus, updatedAt",
      noteVersions: "id, noteId, createdAt",
      noteLinks: "id, noteId, targetType, targetId",
    };

    this.version(8)
      .stores(storesV8)
      .upgrade((tx) =>
        tx
          .table("notes")
          .toCollection()
          .modify((note: NoteRecord) => {
            if (!note.title) {
              note.title = note.topicId ?? note.category ?? "Nota sem título";
            }
            if (!Array.isArray(note.tags)) {
              note.tags = [];
            }
            if (!note.lifecycleStatus) {
              note.lifecycleStatus = "active";
            }
            if (note.isPrimary === undefined) {
              note.isPrimary = true;
            }
          }),
      );

    // v9: resources, resourceProgress, technicalEnglishItems, technicalEnglishPractices
    const storesV9 = {
      ...storesV8,
      resources:
        "id, category, type, lifecycleStatus, isFavorite, sourceType, *topicIds, *tags, updatedAt",
      resourceProgress: "id, resourceId, status, updatedAt",
      technicalEnglishItems:
        "id, type, scenario, lifecycleStatus, isFavorite, sourceType, *topicIds, *tags, updatedAt",
      technicalEnglishPractices: "id, itemId, createdAt",
    };

    this.version(9).stores(storesV9);

    const storesV10 = {
      ...storesV9,
      weeklyReportSnapshots: "id, weekNumber, weekStart, generatedAt",
    };

    this.version(DATABASE_VERSION).stores(storesV10);
  }
}
