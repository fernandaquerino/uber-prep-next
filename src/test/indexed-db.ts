// Test helper — creates an isolated in-memory database for unit/integration tests.
// Each call returns a fresh instance backed by fake-indexeddb, so tests are fully isolated.

import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { createDatabase, _resetDbSingleton } from "@/lib/db/db";
import type { UberPrepDatabase } from "@/lib/db/db";

let counter = 0;

/**
 * Returns a fresh, isolated UberPrepDatabase backed by fake-indexeddb.
 * Call this at the top of each test (or in beforeEach) to guarantee isolation.
 */
export function createTestDatabase(name?: string): UberPrepDatabase {
  const uniqueName = name ?? `uber-prep-test-${++counter}`;
  return createDatabase(uniqueName, {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  });
}

/**
 * Resets the production singleton — call in afterEach when testing code that
 * calls getDb() internally (SSR-safe boundary tests).
 */
export { _resetDbSingleton };
