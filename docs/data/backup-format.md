# Backup Format

Exportação e importação de dados em JSON.

## Estrutura do arquivo

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

## Constantes

```ts
BACKUP_APP_ID = "uber-prep";
BACKUP_VERSION = 1;
```

## Notas importantes

- **Áudio não incluído**: Blobs de áudio (`mockAudio`) são excluídos do backup. O campo `audioCount` indica quantos arquivos existiam.
- **Metadata versionada**: O array `metadata` participa de exportação e restauração para preservar o histórico de migrations e seeds.
- **Timer separado**: `activeTimer` guarda a sessão em andamento, `timerSessions` guarda histórico oficial e `timerSettings` guarda preferências.

## Modos de importação

| Modo      | Comportamento                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| `merge`   | Registros já existentes são mantidos. Apenas novos IDs são inseridos. Conflitos são logados em `result.conflicts`. |
| `replace` | Todas as tabelas do backup são limpas antes da importação. `mockAudio` permanece separado.                         |

## API

```ts
import { createBackupRepository } from "@/lib/repositories/backup.repository";

const repo = createBackupRepository(db);

// Exportar
const file = await repo.export();
const json = JSON.stringify(file, null, 2);

// Importar
const result = await repo.import(parsedFile, "merge");
// result.success: boolean
// result.counts: Record<keyof BackupData, number>
// result.conflicts: Array<{ table, id, reason }>
```

## Validação

O schema `backupFileSchema` (em `src/lib/validation/backup.schemas.ts`) verifica:

- `app === "uber-prep"`
- `backupVersion === 1`
- Envelope e coleção `data` presentes
- Coleções ausentes de backups antigos normalizadas para `[]`
- Validação concluída antes de abrir a transação de importação
