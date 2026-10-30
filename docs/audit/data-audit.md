# Data audit

## IndexedDB

The Dexie database has a versioned schema, idempotent seeds and migrations for legacy data. Stable IDs avoid duplication of the initial content.

## Backup

The backup covers progress, reviews, flashcards, quizzes, timer, structured mocks, notes and versions, reflections, reports, resources, technical English and settings.

Before the transaction, `backupFileSchema` validates the app, version and structure. Collections added in recent versions use `[]` as a default for compatibility with old backups.

## Reset

Per-module resets remove dependent tables without touching other modules. The quiz question catalog is preserved on a progress reset; the full reset removes the catalog and metadata to allow a clean reseed.

## Audio

`mockAudio` blobs don't enter the JSON. `audioCount` and `audioNote` make the limitation explicit.
