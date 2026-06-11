import type { BackupData, BackupFile, BackupImportResult, ImportMode } from "@/types/backup";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { BACKUP_APP_ID, BACKUP_VERSION } from "@/types/backup";
import { DATABASE_VERSION } from "@/lib/db/constants";
import { BackupValidationError } from "@/lib/db/errors";

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
      quizAttempts,
      quizReviews,
      timerSessions,
      mocks,
      notes,
      weeklyReflections,
      learningJournal,
      playgroundSolutions,
      checklistItems,
      metadata,
    ] = await Promise.all([
      db.settings.toArray(),
      db.planProgress.toArray(),
      db.progressEvents.toArray(),
      db.scheduleOverrides.toArray(),
      db.reviews.toArray(),
      db.flashcards.toArray(),
      db.quizAttempts.toArray(),
      db.quizReviews.toArray(),
      db.timerSessions.toArray(),
      db.mocks.toArray(),
      db.notes.toArray(),
      db.weeklyReflections.toArray(),
      db.learningJournal.toArray(),
      db.playgroundSolutions.toArray(),
      db.checklistItems.toArray(),
      db.metadata.toArray(),
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
        quizAttempts,
        quizReviews,
        timerSessions,
        mocks,
        notes,
        weeklyReflections,
        learningJournal,
        playgroundSolutions,
        checklistItems,
        metadata,
      },
    };
  }

  async function import_(file: BackupFile, mode: ImportMode): Promise<BackupImportResult> {
    if (file.app !== BACKUP_APP_ID) {
      throw new BackupValidationError(`Invalid backup app: ${file.app}`);
    }
    if (file.backupVersion !== BACKUP_VERSION) {
      throw new BackupValidationError(`Unsupported backup version: ${file.backupVersion}`);
    }

    const importedAt = new Date().toISOString();
    const counts = {} as Record<keyof BackupData, number>;
    const conflicts: Array<{ table: string; id: string; reason: string }> = [];
    const errors: Array<{ table: string; id?: string; reason: string }> = [];

    const { data } = file;

    await db.transaction(
      "rw",
      [
        db.settings,
        db.planProgress,
        db.progressEvents,
        db.scheduleOverrides,
        db.reviews,
        db.flashcards,
        db.quizAttempts,
        db.quizReviews,
        db.timerSessions,
        db.mocks,
        db.notes,
        db.weeklyReflections,
        db.learningJournal,
        db.playgroundSolutions,
        db.checklistItems,
        db.metadata,
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
            db.quizAttempts.clear(),
            db.quizReviews.clear(),
            db.timerSessions.clear(),
            db.mocks.clear(),
            db.notes.clear(),
            db.weeklyReflections.clear(),
            db.learningJournal.clear(),
            db.playgroundSolutions.clear(),
            db.checklistItems.clear(),
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
          { key: "quizAttempts", table: db.quizAttempts as never },
          { key: "quizReviews", table: db.quizReviews as never },
          { key: "timerSessions", table: db.timerSessions as never },
          { key: "mocks", table: db.mocks as never },
          { key: "notes", table: db.notes as never },
          { key: "weeklyReflections", table: db.weeklyReflections as never },
          { key: "learningJournal", table: db.learningJournal as never },
          { key: "playgroundSolutions", table: db.playgroundSolutions as never },
          { key: "checklistItems", table: db.checklistItems as never },
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

        counts.metadata = 0;
      },
    );

    const success = errors.length === 0;
    return { mode, importedAt, counts, conflicts, errors, success };
  }

  return { export: export_, import: import_ };
}
