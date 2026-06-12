import type { BackupData, BackupFile, BackupImportResult, ImportMode } from "@/types/backup";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { BACKUP_APP_ID, BACKUP_VERSION } from "@/types/backup";
import { DATABASE_VERSION } from "@/lib/db/constants";
import { BackupValidationError } from "@/lib/db/errors";
import { backupFileSchema } from "@/lib/validation/backup.schemas";

export interface BackupRepository {
  export(): Promise<BackupFile>;
  import(file: BackupFile, mode: ImportMode): Promise<BackupImportResult>;
}

export function createBackupRepository(db: UberPrepDatabase): BackupRepository {
  async function export_(): Promise<BackupFile> {
    const [
      settings,
      planProgress,
      progressEvents,
      scheduleOverrides,
      reviews,
      flashcards,
      quizQuestions,
      quizSessions,
      quizAnswers,
      quizMarkedQuestions,
      quizAttempts,
      quizReviews,
      activeTimer,
      timerSessions,
      timerSettings,
      mocks,
      mockEvidence,
      starAnswers,
      systemDesignDrafts,
      fullInterviewSessions,
      fullInterviewSteps,
      checklistSessions,
      notes,
      noteVersions,
      noteLinks,
      weeklyReflections,
      weeklyReportSnapshots,
      learningJournal,
      playgroundSolutions,
      checklistItems,
      metadata,
      resources,
      resourceProgress,
      technicalEnglishItems,
      technicalEnglishPractices,
    ] = await Promise.all([
      db.settings.toArray(),
      db.planProgress.toArray(),
      db.progressEvents.toArray(),
      db.scheduleOverrides.toArray(),
      db.reviews.toArray(),
      db.flashcards.toArray(),
      db.quizQuestions.toArray(),
      db.quizSessions.toArray(),
      db.quizAnswers.toArray(),
      db.quizMarkedQuestions.toArray(),
      db.quizAttempts.toArray(),
      db.quizReviews.toArray(),
      db.activeTimer.toArray(),
      db.timerSessions.toArray(),
      db.timerSettings.toArray(),
      db.mocks.toArray(),
      db.mockEvidence.toArray(),
      db.starAnswers.toArray(),
      db.systemDesignDrafts.toArray(),
      db.fullInterviewSessions.toArray(),
      db.fullInterviewSteps.toArray(),
      db.checklistSessions.toArray(),
      db.notes.toArray(),
      db.noteVersions.toArray(),
      db.noteLinks.toArray(),
      db.weeklyReflections.toArray(),
      db.weeklyReportSnapshots.toArray(),
      db.learningJournal.toArray(),
      db.playgroundSolutions.toArray(),
      db.checklistItems.toArray(),
      db.metadata.toArray(),
      db.resources.toArray(),
      db.resourceProgress.toArray(),
      db.technicalEnglishItems.toArray(),
      db.technicalEnglishPractices.toArray(),
    ]);

    const audioCount = await db.mockAudio.count();

    return {
      app: BACKUP_APP_ID,
      backupVersion: BACKUP_VERSION,
      schemaVersion: DATABASE_VERSION,
      exportedAt: new Date().toISOString(),
      audioNote: "Audio recordings are not included in text backups.",
      audioCount,
      data: {
        settings,
        planProgress,
        progressEvents,
        scheduleOverrides,
        reviews,
        flashcards,
        quizQuestions,
        quizSessions,
        quizAnswers,
        quizMarkedQuestions,
        quizAttempts,
        quizReviews,
        activeTimer,
        timerSessions,
        timerSettings,
        mocks,
        mockEvidence,
        starAnswers,
        systemDesignDrafts,
        fullInterviewSessions,
        fullInterviewSteps,
        checklistSessions,
        notes,
        noteVersions,
        noteLinks,
        weeklyReflections,
        weeklyReportSnapshots,
        learningJournal,
        playgroundSolutions,
        checklistItems,
        metadata,
        resources,
        resourceProgress,
        technicalEnglishItems,
        technicalEnglishPractices,
      },
    };
  }

  async function import_(file: BackupFile, mode: ImportMode): Promise<BackupImportResult> {
    const validation = backupFileSchema.safeParse(file);
    if (!validation.success) {
      const reason = validation.error.issues
        .map((issue) => `${issue.path.join(".") || "arquivo"}: ${issue.message}`)
        .join("; ");
      throw new BackupValidationError(`Backup inválido: ${reason}`);
    }

    const validatedFile = validation.data as BackupFile;
    const importedAt = new Date().toISOString();
    const counts = {} as Record<keyof BackupData, number>;
    const conflicts: Array<{ table: string; id: string; reason: string }> = [];
    const errors: Array<{ table: string; id?: string; reason: string }> = [];

    const { data } = validatedFile;

    await db.transaction(
      "rw",
      [
        db.settings,
        db.planProgress,
        db.progressEvents,
        db.scheduleOverrides,
        db.reviews,
        db.flashcards,
        db.quizQuestions,
        db.quizSessions,
        db.quizAnswers,
        db.quizMarkedQuestions,
        db.quizAttempts,
        db.quizReviews,
        db.activeTimer,
        db.timerSessions,
        db.timerSettings,
        db.mocks,
        db.mockEvidence,
        db.starAnswers,
        db.systemDesignDrafts,
        db.fullInterviewSessions,
        db.fullInterviewSteps,
        db.checklistSessions,
        db.notes,
        db.noteVersions,
        db.noteLinks,
        db.weeklyReflections,
        db.weeklyReportSnapshots,
        db.learningJournal,
        db.playgroundSolutions,
        db.checklistItems,
        db.metadata,
        db.resources,
        db.resourceProgress,
        db.technicalEnglishItems,
        db.technicalEnglishPractices,
      ],
      async () => {
        if (mode === "replace") {
          await Promise.all([
            db.settings.clear(),
            db.planProgress.clear(),
            db.progressEvents.clear(),
            db.scheduleOverrides.clear(),
            db.reviews.clear(),
            db.flashcards.clear(),
            db.quizQuestions.clear(),
            db.quizSessions.clear(),
            db.quizAnswers.clear(),
            db.quizMarkedQuestions.clear(),
            db.quizAttempts.clear(),
            db.quizReviews.clear(),
            db.activeTimer.clear(),
            db.timerSessions.clear(),
            db.timerSettings.clear(),
            db.mocks.clear(),
            db.mockEvidence.clear(),
            db.starAnswers.clear(),
            db.systemDesignDrafts.clear(),
            db.fullInterviewSessions.clear(),
            db.fullInterviewSteps.clear(),
            db.checklistSessions.clear(),
            db.notes.clear(),
            db.noteVersions.clear(),
            db.noteLinks.clear(),
            db.weeklyReflections.clear(),
            db.weeklyReportSnapshots.clear(),
            db.learningJournal.clear(),
            db.playgroundSolutions.clear(),
            db.checklistItems.clear(),
            db.resources.clear(),
            db.resourceProgress.clear(),
            db.technicalEnglishItems.clear(),
            db.technicalEnglishPractices.clear(),
            db.metadata.clear(),
          ]);
        }

        const tables: Array<{
          key: keyof BackupData;
          table: (typeof db)[keyof typeof db & string];
        }> = [
          { key: "settings", table: db.settings as never },
          { key: "planProgress", table: db.planProgress as never },
          { key: "progressEvents", table: db.progressEvents as never },
          { key: "scheduleOverrides", table: db.scheduleOverrides as never },
          { key: "reviews", table: db.reviews as never },
          { key: "flashcards", table: db.flashcards as never },
          { key: "quizQuestions", table: db.quizQuestions as never },
          { key: "quizSessions", table: db.quizSessions as never },
          { key: "quizAnswers", table: db.quizAnswers as never },
          { key: "quizMarkedQuestions", table: db.quizMarkedQuestions as never },
          { key: "quizAttempts", table: db.quizAttempts as never },
          { key: "quizReviews", table: db.quizReviews as never },
          { key: "activeTimer", table: db.activeTimer as never },
          { key: "timerSessions", table: db.timerSessions as never },
          { key: "timerSettings", table: db.timerSettings as never },
          { key: "mocks", table: db.mocks as never },
          { key: "mockEvidence", table: db.mockEvidence as never },
          { key: "starAnswers", table: db.starAnswers as never },
          { key: "systemDesignDrafts", table: db.systemDesignDrafts as never },
          { key: "fullInterviewSessions", table: db.fullInterviewSessions as never },
          { key: "fullInterviewSteps", table: db.fullInterviewSteps as never },
          { key: "checklistSessions", table: db.checklistSessions as never },
          { key: "notes", table: db.notes as never },
          { key: "noteVersions", table: db.noteVersions as never },
          { key: "noteLinks", table: db.noteLinks as never },
          { key: "weeklyReflections", table: db.weeklyReflections as never },
          { key: "weeklyReportSnapshots", table: db.weeklyReportSnapshots as never },
          { key: "learningJournal", table: db.learningJournal as never },
          { key: "playgroundSolutions", table: db.playgroundSolutions as never },
          { key: "checklistItems", table: db.checklistItems as never },
          { key: "resources", table: db.resources as never },
          { key: "resourceProgress", table: db.resourceProgress as never },
          { key: "technicalEnglishItems", table: db.technicalEnglishItems as never },
          { key: "technicalEnglishPractices", table: db.technicalEnglishPractices as never },
          { key: "metadata", table: db.metadata as never },
        ];

        for (const { key, table } of tables) {
          const records = data[key] as Array<{ id: string }>;
          counts[key] = 0;

          for (const record of records) {
            try {
              if (mode === "merge") {
                const existing = await (table as { get(id: string): Promise<unknown> }).get(
                  record.id,
                );
                if (existing) {
                  conflicts.push({ table: key, id: record.id, reason: "existing record kept" });
                  continue;
                }
              }
              await (table as { put(r: unknown): Promise<unknown> }).put(record);
              counts[key]++;
            } catch (err) {
              errors.push({
                table: key,
                id: record.id,
                reason: err instanceof Error ? err.message : String(err),
              });
            }
          }
        }
      },
    );

    const success = errors.length === 0;
    return { mode, importedAt, counts, conflicts, errors, success };
  }

  return { export: export_, import: import_ };
}
