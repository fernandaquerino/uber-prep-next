// Client-only module. Do not import in Server Components or server-side code.
import { SsrAccessError } from "./errors";
import { UberPrepDatabase } from "./schema";

export type { UberPrepDatabase };

/**
 * Factory — use this in tests to get a fresh, isolated database instance.
 * Pass `{ indexedDB: new IDBFactory(), IDBKeyRange }` from fake-indexeddb
 * to avoid polluting the global environment.
 */
export function createDatabase(
  name?: string,
  options?: ConstructorParameters<typeof UberPrepDatabase>[1],
): UberPrepDatabase {
  return new UberPrepDatabase(name, options);
}

let _db: UberPrepDatabase | null = null;

/**
 * Returns the singleton database instance for production use.
 * Throws SsrAccessError when called outside a browser context.
 */
export function getDb(): UberPrepDatabase {
  if (typeof window === "undefined") {
    throw new SsrAccessError();
  }
  if (!_db) {
    _db = createDatabase();
  }
  return _db;
}

/** Reset the singleton — only for tests. */
export function _resetDbSingleton(): void {
  _db = null;
}
