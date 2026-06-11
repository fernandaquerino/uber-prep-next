import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { createSettingsRepository } from "@/lib/repositories/settings.repository";
import type { UberPrepDatabase } from "@/lib/db/db";

let db: UberPrepDatabase;
let repo: ReturnType<typeof createSettingsRepository>;

beforeEach(() => {
  db = createTestDatabase();
  repo = createSettingsRepository(db);
});

describe("settings repository", () => {
  it("get returns undefined when empty", async () => {
    expect(await repo.get()).toBeUndefined();
  });

  it("upsert and get", async () => {
    const now = new Date().toISOString();
    await repo.upsert({
      id: "app-settings",
      startDate: "2025-01-01",
      timezone: "UTC",
      theme: "dark",
      createdAt: now,
      updatedAt: now,
    });
    const settings = await repo.get();
    expect(settings?.startDate).toBe("2025-01-01");
    expect(settings?.theme).toBe("dark");
  });

  it("setStartDate throws if settings not initialized", async () => {
    await expect(repo.setStartDate("2025-03-01")).rejects.toThrow();
  });

  it("setStartDate updates start date on existing settings", async () => {
    const now = new Date().toISOString();
    await repo.upsert({
      id: "app-settings",
      startDate: null,
      timezone: "UTC",
      theme: "dark",
      createdAt: now,
      updatedAt: now,
    });
    await repo.setStartDate("2025-03-01");
    const settings = await repo.get();
    expect(settings?.startDate).toBe("2025-03-01");
  });

  it("setTheme updates only the theme", async () => {
    const now = new Date().toISOString();
    await repo.upsert({
      id: "app-settings",
      startDate: "2025-01-01",
      timezone: "UTC",
      theme: "dark",
      createdAt: now,
      updatedAt: now,
    });
    await repo.setTheme("light");
    const settings = await repo.get();
    expect(settings?.theme).toBe("light");
    expect(settings?.startDate).toBe("2025-01-01");
  });
});
