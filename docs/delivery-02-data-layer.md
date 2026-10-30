# Delivery 02 — Local database, schemas, repositories and data migration

## Summary

A complete implementation of the data layer using IndexedDB via Dexie 4. All the app's data is persisted locally in the browser, with automatic migration of the legacy localStorage data.

## Architecture

```
src/
├── types/
│   ├── database.ts          # All the record types (15 tables)
│   ├── legacy.ts            # Legacy localStorage types and keys
│   └── backup.ts            # Types for backup export/import
├── lib/
│   ├── db/
│   │   ├── constants.ts     # DATABASE_NAME, DATABASE_VERSION, IDs, limits
│   │   ├── schema.ts        # UberPrepDatabase extends Dexie (15 tables)
│   │   ├── db.ts            # getDb(), createDatabase(), _resetDbSingleton()
│   │   ├── errors.ts        # DatabaseError, SsrAccessError, etc.
│   │   ├── seed.ts          # Idempotent seeds (initial flashcards, settings)
│   │   └── migrations.ts    # One-time migration from localStorage to IndexedDB
│   ├── repositories/        # 12 typed repositories
│   │   ├── settings.repository.ts
│   │   ├── progress.repository.ts
│   │   ├── reviews.repository.ts
│   │   ├── flashcards.repository.ts
│   │   ├── quizzes.repository.ts
│   │   ├── timer.repository.ts
│   │   ├── mocks.repository.ts
│   │   ├── notes.repository.ts
│   │   ├── playground.repository.ts
│   │   ├── checklist.repository.ts
│   │   ├── backup.repository.ts
│   │   └── migration.repository.ts
│   ├── data/
│   │   └── initial-flashcards.ts   # 40 initial flashcards (fc-1..fc-40)
│   └── validation/
│       ├── legacy.schemas.ts        # Tolerant Zod for localStorage data
│       ├── database.schemas.ts      # Strict Zod for IndexedDB records
│       └── backup.schemas.ts        # Zod to validate backup files
├── hooks/
│   ├── use-database-status.ts       # Database state + automatic seed
│   └── use-legacy-migration.ts      # Legacy migration control
├── features/backup/components/
│   ├── legacy-migration-check.tsx   # Wrapper with hook + dialog
│   ├── migration-dialog.tsx         # Migration dialog UI
│   └── migration-status.tsx         # Migration status badge
└── test/
    └── indexed-db.ts                # createTestDatabase() helper with fake-indexeddb
```

## Initialization flow

1. `AppLayout` renders `<LegacyMigrationCheck />`
2. `useLegacyMigration` checks whether there's legacy data in localStorage and whether the migration has already been done
3. If needed, it shows `MigrationDialog` for the user to confirm
4. `runLegacyMigration(db)` runs the migration (idempotent)
5. `useDatabaseStatus` initializes the database and runs `runSeeds` on the first visit

## Validation checklist

- [x] `npm run typecheck` — no errors
- [x] `npm run lint` — no warnings
- [x] `npm run format:check` — all files formatted
- [x] `npm test` — 51 tests passing
- [x] `npm run build` — successful production build
