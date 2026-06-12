# Legacy Migration

Migração one-time e idempotente do `localStorage` para o IndexedDB.

## Fontes migradas

| Chave localStorage          | Destino IndexedDB                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `uber-prep-v2`              | `planProgress`, `reviews`, `mocks`, `playgroundSolutions`, `learningJournal`, `weeklyReflections`, `notes` (topic notes), `settings` |
| `uber-prep-flashcards`      | `flashcards`                                                                                                                         |
| `uber-prep-quizzes`         | `quizAttempts`, `quizReviews`                                                                                                        |
| `uber-prep-timer-sessions`  | `timerSessions`                                                                                                                      |
| `uber-prep-active-timer`    | `activeTimer`                                                                                                                        |
| `uber-prep-checklist`       | `checklistItems`                                                                                                                     |
| `uber-prep-theme`           | `settings.theme`                                                                                                                     |
| `uber-prep-mock-audio-{id}` | `mockAudio` (Blob)                                                                                                                   |

## Estratégia

1. **Idempotência**: Verifica `metadata.migrationStatus === "completed"` antes de iniciar. Segunda execução retorna o relatório já salvo.
2. **Conflitos**: Registros já existentes no IndexedDB têm prioridade. O registro legado é descartado com log em `conflicts`.
3. **Validação tolerante**: Schemas Zod com `.strip()`, `.catch()` e `.default()`. Registros individuais inválidos são descartados sem abortar a migração.
4. **Timer ativo**: um timer legado em andamento é restaurado pausado em `activeTimer`, sem criar sessão histórica automaticamente.
5. **Áudio**: Base64 → Blob. Arquivos > 5MB são ignorados com log em `audioFailures`. Falhas individuais não abortam a migração.
6. **Status de resultado**: `"completed"` (sem problemas), `"partial"` (registros inválidos ou áudio com falha), `"failed"` (erro inesperado).

## Mapeamento de status

| Legacy                                                      | IndexedDB   |
| ----------------------------------------------------------- | ----------- |
| `done`                                                      | `completed` |
| `in_progress`, `pending`, `stuck`, `skipped`, `rescheduled` | mantidos    |

## IDs preservados

- Flashcards: `fc-1` a `fc-40` (IDs originais preservados)
- Blocos de progresso: `block-{blockKey}` (ex: `block-w1-d1-b0`)
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

`<LegacyMigrationCheck />` (em `AppLayout`) usa `useLegacyMigration()` para:

1. Detectar se há dados legados na primeira visita
2. Mostrar `MigrationDialog` para confirmação do usuário
3. Executar a migração e exibir o relatório
