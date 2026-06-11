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
    "quizAttempts": [...],
    "quizReviews": [...],
    "timerSessions": [...],
    "mocks": [...],
    "notes": [...],
    "weeklyReflections": [...],
    "learningJournal": [...],
    "playgroundSolutions": [...],
    "checklistItems": [...],
    "metadata": [...]
  }
}
```

## Constantes

```ts
BACKUP_APP_ID = "uber-prep"
BACKUP_VERSION = 1
```

## Notas importantes

- **Áudio não incluído**: Blobs de áudio (`mockAudio`) são excluídos do backup. O campo `audioCount` indica quantos arquivos existiam.
- **Metadata preservada**: O array `metadata` é exportado mas nunca importado para evitar sobrescrever o estado do banco atual.

## Modos de importação

| Modo | Comportamento |
|------|--------------|
| `merge` | Registros já existentes são mantidos. Apenas novos IDs são inseridos. Conflitos são logados em `result.conflicts`. |
| `replace` | Todas as tabelas (exceto `metadata` e `mockAudio`) são limpas antes da importação. |

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
- Campos obrigatórios presentes e com tipos corretos
