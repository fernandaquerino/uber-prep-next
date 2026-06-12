# Database Schema

Banco de dados local: **IndexedDB** via **Dexie 4**  
Nome: `uber-prep`  
Versão: `10`

## Tabelas

| Tabela                  | Chave primária | Índices secundários                                                                    |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `settings`              | `id`           | —                                                                                      |
| `planProgress`          | `id`           | `blockId`, `status`, `scheduledDate`, `planDayId`, `planDaySequence`                   |
| `progressEvents`        | `id`           | `blockId`, `type`, `occurredAt`, `actionGroupId`                                       |
| `scheduleOverrides`     | `id`           | `blockId`, `type`, `fromDate`, `toDate`, `actionGroupId`                               |
| `reviews`               | `id`           | `sourceType`, `sourceId`, `scheduledFor`, `status`, `[status+scheduledFor]`            |
| `flashcards`            | `id`           | `category`, `*tags` (multi), `status`, `nextReview`                                    |
| `quizQuestions`         | `id`           | catálogo versionado de questões                                                        |
| `quizSessions`          | `id`           | sessões configuráveis e estado                                                         |
| `quizAnswers`           | `id`           | respostas por sessão e questão                                                         |
| `quizMarkedQuestions`   | `id`           | questões marcadas                                                                      |
| `quizAttempts`          | `id`           | `mode`, `dailyDate`, `createdAt`                                                       |
| `quizReviews`           | `id`           | `questionId`, `nextReview`, `cycleIndex`                                               |
| `activeTimer`           | `id`           | `status`, `sourceType`, `sourceId`, `category`, `updatedAt`                            |
| `timerSessions`         | `id`           | `date`, `startedAt`, `endedAt`, `category`, `sourceType`, `sourceId`, `status`, `mode` |
| `timerSettings`         | `id`           | —                                                                                      |
| `mocks`                 | `id`           | `date`, `type`                                                                         |
| `mockAudio`             | `id`           | `mockId`, `createdAt`                                                                  |
| `mockEvidence`          | `id`           | evidências de força e gap                                                              |
| `starAnswers`           | `id`           | respostas STAR                                                                         |
| `systemDesignDrafts`    | `id`           | rascunhos de System Design                                                             |
| `fullInterviewSessions` | `id`           | sessões Full Loop                                                                      |
| `fullInterviewSteps`    | `id`           | etapas de Full Loop                                                                    |
| `checklistSessions`     | `id`           | snapshots de checklist                                                                 |
| `notes`                 | `id`           | `type`, `category`, `topicId`, `updatedAt`                                             |
| `noteVersions`          | `id`           | histórico de versões                                                                   |
| `noteLinks`             | `id`           | vínculos com outros módulos                                                            |
| `weeklyReflections`     | `id`           | `weekNumber`                                                                           |
| `weeklyReportSnapshots` | `id`           | snapshots de relatórios                                                                |
| `learningJournal`       | `id`           | `date`                                                                                 |
| `playgroundSolutions`   | `id`           | `language`, `updatedAt`                                                                |
| `checklistItems`        | `id`           | `phase`                                                                                |
| `metadata`              | `id`           | —                                                                                      |

## Registros singleton

- `settings` — sempre `id = "app-settings"`
- `metadata` — sempre `id = "app-metadata"`
- `activeTimer` — quando existir, sempre `id = "active-timer"`
- `timerSettings` — sempre `id = "timer-settings"`

## Constantes

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

`getDb()` lança `SsrAccessError` se chamado fora do contexto de browser (`typeof window === "undefined"`). Todos os imports de `getDb()` em componentes client devem ser dinâmicos ou protegidos por `useEffect`.
