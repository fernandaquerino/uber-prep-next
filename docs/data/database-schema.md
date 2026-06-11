# Database Schema

Banco de dados local: **IndexedDB** via **Dexie 4**  
Nome: `uber-prep`  
Versão: `1`

## Tabelas

| Tabela | Chave primária | Índices secundários |
|--------|---------------|---------------------|
| `settings` | `id` | — |
| `planProgress` | `id` | `blockId`, `status`, `scheduledDate` |
| `reviews` | `id` | `sourceType`, `sourceId`, `scheduledFor`, `status`, `[status+scheduledFor]` |
| `flashcards` | `id` | `category`, `*tags` (multi), `status`, `nextReview` |
| `quizAttempts` | `id` | `mode`, `dailyDate`, `createdAt` |
| `quizReviews` | `id` | `questionId`, `nextReview`, `cycleIndex` |
| `timerSessions` | `id` | `startedAt`, `category` |
| `mocks` | `id` | `date`, `type` |
| `mockAudio` | `id` | `mockId`, `createdAt` |
| `notes` | `id` | `type`, `category`, `topicId`, `updatedAt` |
| `weeklyReflections` | `id` | `weekNumber` |
| `learningJournal` | `id` | `date` |
| `playgroundSolutions` | `id` | `language`, `updatedAt` |
| `checklistItems` | `id` | `phase` |
| `metadata` | `id` | — |

## Registros singleton

- `settings` — sempre `id = "app-settings"`
- `metadata` — sempre `id = "app-metadata"`

## Constantes

```ts
DATABASE_NAME = "uber-prep"
DATABASE_VERSION = 1
SETTINGS_ID = "app-settings"
METADATA_ID = "app-metadata"
AUDIO_MIGRATION_MAX_BYTES = 5 * 1024 * 1024  // 5 MB
SEED_ID_FLASHCARDS = "seed:initial-flashcards:v1"
SEED_ID_SETTINGS = "seed:default-settings:v1"
SEED_ID_METADATA = "seed:metadata:v1"
```

## SSR Safety

`getDb()` lança `SsrAccessError` se chamado fora do contexto de browser (`typeof window === "undefined"`). Todos os imports de `getDb()` em componentes client devem ser dinâmicos ou protegidos por `useEffect`.
