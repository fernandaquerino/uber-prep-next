# Database Schema

Local database: **IndexedDB** via **Dexie 4**  
Name: `uber-prep`  
Version: `10`

## Tables

| Table                   | Primary key    | Secondary indexes                                                                      |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `settings`              | `id`           | —                                                                                      |
| `planProgress`          | `id`           | `blockId`, `status`, `scheduledDate`, `planDayId`, `planDaySequence`                   |
| `progressEvents`        | `id`           | `blockId`, `type`, `occurredAt`, `actionGroupId`                                       |
| `scheduleOverrides`     | `id`           | `blockId`, `type`, `fromDate`, `toDate`, `actionGroupId`                               |
| `reviews`               | `id`           | `sourceType`, `sourceId`, `scheduledFor`, `status`, `[status+scheduledFor]`            |
| `flashcards`            | `id`           | `category`, `*tags` (multi), `status`, `nextReview`                                    |
| `quizQuestions`         | `id`           | versioned question catalog                                                             |
| `quizSessions`          | `id`           | configurable sessions and state                                                        |
| `quizAnswers`           | `id`           | answers per session and question                                                       |
| `quizMarkedQuestions`   | `id`           | flagged questions                                                                      |
| `quizAttempts`          | `id`           | `mode`, `dailyDate`, `createdAt`                                                       |
| `quizReviews`           | `id`           | `questionId`, `nextReview`, `cycleIndex`                                               |
| `activeTimer`           | `id`           | `status`, `sourceType`, `sourceId`, `category`, `updatedAt`                            |
| `timerSessions`         | `id`           | `date`, `startedAt`, `endedAt`, `category`, `sourceType`, `sourceId`, `status`, `mode` |
| `timerSettings`         | `id`           | —                                                                                      |
| `mocks`                 | `id`           | `date`, `type`                                                                         |
| `mockAudio`             | `id`           | `mockId`, `createdAt`                                                                  |
| `mockEvidence`          | `id`           | strength and gap evidence                                                              |
| `starAnswers`           | `id`           | STAR answers                                                                           |
| `systemDesignDrafts`    | `id`           | System Design drafts                                                                   |
| `fullInterviewSessions` | `id`           | Full Loop sessions                                                                     |
| `fullInterviewSteps`    | `id`           | Full Loop steps                                                                        |
| `checklistSessions`     | `id`           | checklist snapshots                                                                    |
| `notes`                 | `id`           | `type`, `category`, `topicId`, `updatedAt`                                             |
| `noteVersions`          | `id`           | version history                                                                        |
| `noteLinks`             | `id`           | links with other modules                                                               |
| `weeklyReflections`     | `id`           | `weekNumber`                                                                           |
| `weeklyReportSnapshots` | `id`           | report snapshots                                                                       |
| `learningJournal`       | `id`           | `date`                                                                                 |
| `playgroundSolutions`   | `id`           | `language`, `updatedAt`                                                                |
| `checklistItems`        | `id`           | `phase`                                                                                |
| `metadata`              | `id`           | —                                                                                      |

## Singleton records

- `settings` — always `id = "app-settings"`
- `metadata` — always `id = "app-metadata"`
- `activeTimer` — when it exists, always `id = "active-timer"`
- `timerSettings` — always `id = "timer-settings"`

## Constants

```ts
DATABASE_NAME = "uber-prep";
DATABASE_VERSION = 6;
SETTINGS_ID = "app-settings";
METADATA_ID = "app-metadata";
ACTIVE_TIMER_ID = "active-timer";
TIMER_SETTINGS_ID = "timer-settings";
AUDIO_MIGRATION_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
SEED_ID_FLASHCARDS = "seed:initial-flashcards:v1";
SEED_ID_SETTINGS = "seed:default-settings:v1";
SEED_ID_METADATA = "seed:metadata:v1";
SEED_ID_TIMER_SETTINGS = "seed:timer-settings:v1";
```

## SSR Safety

`getDb()` throws `SsrAccessError` if called outside the browser context (`typeof window === "undefined"`). All `getDb()` imports in client components must be dynamic or guarded by `useEffect`.
