# Backup Format

Data export and import in JSON.

## File structure

```json
{
  "app": "uber-prep",
  "backupVersion": 1,
  "schemaVersion": 1,
  "exportedAt": "2025-01-15T12:00:00.000Z",
  "audioNote": "Audio recordings are not included in text backups.",
  "audioCount": 3,
  "data": {
    "settings": [...],
    "planProgress": [...],
    "reviews": [...],
    "flashcards": [...],
    "quizQuestions": [...],
    "quizSessions": [...],
    "quizAnswers": [...],
    "quizMarkedQuestions": [...],
    "quizAttempts": [...],
    "quizReviews": [...],
    "activeTimer": [...],
    "timerSessions": [...],
    "timerSettings": [...],
    "mocks": [...],
    "mockEvidence": [...],
    "starAnswers": [...],
    "systemDesignDrafts": [...],
    "fullInterviewSessions": [...],
    "fullInterviewSteps": [...],
    "checklistSessions": [...],
    "notes": [...],
    "noteVersions": [...],
    "noteLinks": [...],
    "weeklyReflections": [...],
    "weeklyReportSnapshots": [...],
    "learningJournal": [...],
    "playgroundSolutions": [...],
    "checklistItems": [...],
    "metadata": [...]
  }
}
```

## Constants

```ts
BACKUP_APP_ID = "uber-prep";
BACKUP_VERSION = 1;
```

## Important notes

- **Audio not included**: audio blobs (`mockAudio`) are excluded from the backup. The `audioCount` field indicates how many files existed.
- **Versioned metadata**: the `metadata` array takes part in export and restore to preserve the history of migrations and seeds.
- **Separate timer**: `activeTimer` keeps the in-progress session, `timerSessions` keeps the official history and `timerSettings` keeps the preferences.

## Import modes

| Mode      | Behavior                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| `merge`   | Records that already exist are kept. Only new IDs are inserted. Conflicts are logged in `result.conflicts`.        |
| `replace` | All the backup's tables are cleared before the import. `mockAudio` stays separate.                                 |

## API

```ts
import { createBackupRepository } from "@/lib/repositories/backup.repository";

const repo = createBackupRepository(db);

// Export
const file = await repo.export();
const json = JSON.stringify(file, null, 2);

// Import
const result = await repo.import(parsedFile, "merge");
// result.success: boolean
// result.counts: Record<keyof BackupData, number>
// result.conflicts: Array<{ table, id, reason }>
```

## Validation

The `backupFileSchema` schema (in `src/lib/validation/backup.schemas.ts`) checks:

- `app === "uber-prep"`
- `backupVersion === 1`
- The envelope and the `data` collection are present
- Collections missing from old backups are normalized to `[]`
- Validation completes before opening the import transaction
