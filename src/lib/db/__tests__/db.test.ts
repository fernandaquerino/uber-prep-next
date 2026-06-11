import { describe, it, expect, afterEach } from "vitest";
import { createTestDatabase, _resetDbSingleton } from "@/test/indexed-db";
import { SsrAccessError } from "@/lib/db/errors";

afterEach(() => {
  _resetDbSingleton();
});

describe("createTestDatabase", () => {
  it("creates an isolated database instance", async () => {
    const db = createTestDatabase();
    expect(db).toBeDefined();
    await db.open();
    await db.close();
  });

  it("two instances are independent", async () => {
    const db1 = createTestDatabase();
    const db2 = createTestDatabase();
    await db1.settings.put({
      id: "app-settings",
      startDate: null,
      timezone: "UTC",
      theme: "dark",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const count1 = await db1.settings.count();
    const count2 = await db2.settings.count();
    expect(count1).toBe(1);
    expect(count2).toBe(0);
  });
});

describe("getDb / SsrAccessError", () => {
  it("throws SsrAccessError when window is undefined", async () => {
    const originalWindow = global.window;
    // @ts-expect-error intentional undefined
    delete global.window;
    try {
      const { getDb } = await import("@/lib/db/db");
      expect(() => getDb()).toThrow(SsrAccessError);
    } finally {
      global.window = originalWindow;
    }
  });
});
