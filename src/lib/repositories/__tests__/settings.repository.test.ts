import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import { createSettingsRepository } from "@/lib/repositories/settings.repository";
import { withSettingsDefaults } from "@/lib/domain/settings";
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
    await repo.upsert(
      withSettingsDefaults({ id: "app-settings", startDate: "2025-01-01", timezone: "UTC", theme: "dark", createdAt: now, updatedAt: now }),
    );
    const settings = await repo.get();
    expect(settings?.startDate).toBe("2025-01-01");
    expect(settings?.theme).toBe("dark");
  });

  it("setStartDate auto-creates settings if not initialized", async () => {
    await repo.setStartDate("2025-03-01");
    const settings = await repo.get();
    expect(settings?.startDate).toBe("2025-03-01");
    expect(settings?.theme).toBe("system"); // default was applied
  });

  it("setStartDate updates start date on existing settings", async () => {
    const now = new Date().toISOString();
    await repo.upsert(
      withSettingsDefaults({ id: "app-settings", startDate: null, timezone: "UTC", theme: "dark", createdAt: now, updatedAt: now }),
    );
    await repo.setStartDate("2025-03-01");
    const settings = await repo.get();
    expect(settings?.startDate).toBe("2025-03-01");
  });

  it("setTheme updates only the theme", async () => {
    const now = new Date().toISOString();
    await repo.upsert(
      withSettingsDefaults({ id: "app-settings", startDate: "2025-01-01", timezone: "UTC", theme: "dark", createdAt: now, updatedAt: now }),
    );
    await repo.setTheme("light");
    const settings = await repo.get();
    expect(settings?.theme).toBe("light");
    expect(settings?.startDate).toBe("2025-01-01");
  });

  it("getWithDefaults creates settings when none exist", async () => {
    const settings = await repo.getWithDefaults();
    expect(settings.theme).toBe("system");
    expect(settings.planDurationWeeks).toBe(6);
    expect(settings.reviewIntervals).toEqual([1, 3, 7, 14, 30]);
  });

  it("update merges partial changes", async () => {
    const now = new Date().toISOString();
    await repo.upsert(
      withSettingsDefaults({ id: "app-settings", startDate: null, timezone: "UTC", theme: "dark", createdAt: now, updatedAt: now }),
    );
    const updated = await repo.update({ theme: "light", planDurationWeeks: 8 });
    expect(updated.theme).toBe("light");
    expect(updated.planDurationWeeks).toBe(8);
    expect(updated.weekdayAvailability.monday.enabled).toBe(true); // preserved
  });
});
