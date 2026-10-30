# Legacy Migration

A one-time, idempotent migration from `localStorage` to IndexedDB.

## Migrated sources

| localStorage key            | IndexedDB destination                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `uber-prep-v2`              | `planProgress`, `reviews`, `mocks`, `playgroundSolutions`, `learningJournal`, `weeklyReflections`, `notes` (topic notes), `settings` |
| `uber-prep-flashcards`      | `flashcards`                                                                                                                         |
| `uber-prep-quizzes`         | `quizAttempts`, `quizReviews`                                                                                                        |
| `uber-prep-timer-sessions`  | `timerSessions`                                                                                                                      |
| `uber-prep-active-timer`    | `activeTimer`                                                                                                                        |
| `uber-prep-checklist`       | `checklistItems`                                                                                                                     |
| `uber-prep-theme`           | `settings.theme`                                                                                                                     |
| `uber-prep-mock-audio-{id}` | `mockAudio` (Blob)                                                                                                                   |

## Strategy

1. **Idempotency**: Checks `metadata.migrationStatus === "completed"` before starting. A second run returns the already-saved report.
2. **Conflicts**: Records that already exist in IndexedDB take priority. The legacy record is discarded with a log in `conflicts`.
3. **Tolerant validation**: Zod schemas with `.strip()`, `.catch()` and `.default()`. Individually invalid records are discarded without aborting the migration.
4. **Active timer**: a legacy in-progress timer is restored paused in `activeTimer`, without automatically creating a historical session.
5. **Audio**: Base64 → Blob. Files > 5MB are ignored with a log in `audioFailures`. Individual failures don't abort the migration.
6. **Result status**: `"completed"` (no issues), `"partial"` (invalid records or failed audio), `"failed"` (unexpected error).

## Status mapping

| Legacy                                                      | IndexedDB   |
| ----------------------------------------------------------- | ----------- |
| `done`                                                      | `completed` |
| `in_progress`, `pending`, `stuck`, `skipped`, `rescheduled` | kept        |

## Preserved IDs

- Flashcards: `fc-1` to `fc-40` (original IDs preserved)
- Progress blocks: `block-{blockKey}` (e.g. `block-w1-d1-b0`)
- Reviews: `rev-{blockKey}`
- Quiz reviews: `qrev-{questionId}`

## API

```ts
import { runLegacyMigration } from "@/lib/db/migrations";

const report = await runLegacyMigration(db);
// report.status: "success" | "partial" | "failed"
// report.imported: Record<string, number>
// report.conflicts: MigrationIssue[]
// report.audioFailures: MigrationIssue[]
```

## UI

`<LegacyMigrationCheck />` (in `AppLayout`) uses `useLegacyMigration()` to:

1. Detect whether there's legacy data on the first visit
2. Show `MigrationDialog` for the user's confirmation
3. Run the migration and display the report
