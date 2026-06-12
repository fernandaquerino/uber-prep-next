export const DATABASE_NAME = "uber-prep";
export const DATABASE_VERSION = 4;

export const SETTINGS_ID = "app-settings" as const;
export const METADATA_ID = "app-metadata" as const;

export const REVIEW_CYCLE = [1, 3, 7, 14, 30] as const;
export const QUIZ_REVIEW_CYCLE = [1, 3, 7, 14, 30] as const;
export const FLASHCARD_INTERVALS = [1, 3, 7, 14, 30] as const;

export const SEED_ID_FLASHCARDS = "seed:initial-flashcards:v1";
export const SEED_ID_SETTINGS = "seed:default-settings:v1";
export const SEED_ID_METADATA = "seed:metadata:v1";

// Max audio size (in bytes) before refusing to migrate base64 → Blob inline
export const AUDIO_MIGRATION_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
