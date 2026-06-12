import { describe, it, expect } from "vitest";
import {
  withSettingsDefaults,
  getTotalWeeklyMinutes,
  getEnabledDaysCount,
  formatMinutes,
  DEFAULT_WEEKDAY_AVAILABILITY,
  DEFAULT_REVIEW_INTERVALS,
  SETTINGS_DEFAULTS,
} from "../settings.types";
import type { SettingsRecord } from "@/types/database";

describe("withSettingsDefaults", () => {
  it("fills all missing fields from a minimal record", () => {
    const minimal = {
      id: "app-settings" as const,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    };
    const result = withSettingsDefaults(minimal);

    expect(result.id).toBe("app-settings");
    expect(result.startDate).toBeNull();
    expect(result.theme).toBe("system");
    expect(result.planDurationWeeks).toBe(6);
    expect(result.lostDayPolicy).toBe("shift");
    expect(result.weekdayAvailability.monday.enabled).toBe(true);
    expect(result.weekdayAvailability.sunday.enabled).toBe(false);
    expect(result.reviewIntervals).toEqual(DEFAULT_REVIEW_INTERVALS);
    expect(result.reviewAutoCreate.onBlockComplete).toBe(true);
    expect(result.density).toBe("default");
    expect(result.fontSize).toBe("md");
  });

  it("preserves existing fields from a legacy record", () => {
    const legacy = {
      id: "app-settings" as const,
      startDate: "2025-06-01",
      timezone: "UTC",
      theme: "dark" as const,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-05-01T00:00:00Z",
    } as Partial<SettingsRecord> & { id: "app-settings" };

    const result = withSettingsDefaults(legacy);

    expect(result.startDate).toBe("2025-06-01");
    expect(result.timezone).toBe("UTC");
    expect(result.theme).toBe("dark");
    expect(result.planDurationWeeks).toBe(6); // filled from defaults
  });

  it("preserves user-set weekday availability", () => {
    const customAvailability = {
      ...DEFAULT_WEEKDAY_AVAILABILITY,
      saturday: { enabled: false, availableMinutes: 0 },
    };
    const record = {
      id: "app-settings" as const,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      weekdayAvailability: customAvailability,
    };

    const result = withSettingsDefaults(record);
    expect(result.weekdayAvailability.saturday.enabled).toBe(false);
  });

  it("repairs missing weekday availability from a legacy record", () => {
    const result = withSettingsDefaults({
      id: "app-settings",
      startDate: "2026-06-12",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      weekdayAvailability: undefined,
    });

    expect(result.weekdayAvailability.monday).toEqual({
      enabled: true,
      availableMinutes: 480,
    });
    expect(result.weekdayAvailability.sunday.enabled).toBe(false);
  });

  it("fills missing days without overwriting existing day settings", () => {
    const result = withSettingsDefaults({
      id: "app-settings",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      weekdayAvailability: {
        monday: { enabled: true, availableMinutes: 90 },
      } as SettingsRecord["weekdayAvailability"],
    });

    expect(result.weekdayAvailability.monday.availableMinutes).toBe(90);
    expect(result.weekdayAvailability.tuesday.availableMinutes).toBe(480);
  });
});

describe("getTotalWeeklyMinutes", () => {
  it("sums minutes for enabled days only", () => {
    const total = getTotalWeeklyMinutes(DEFAULT_WEEKDAY_AVAILABILITY);
    // Mon-Fri: 5 × 480 = 2400, Sat: 240, Sun: disabled
    expect(total).toBe(5 * 480 + 240);
  });

  it("returns 0 when all days disabled", () => {
    const allDisabled = Object.fromEntries(
      Object.keys(DEFAULT_WEEKDAY_AVAILABILITY).map((k) => [
        k,
        { enabled: false, availableMinutes: 60 },
      ]),
    ) as typeof DEFAULT_WEEKDAY_AVAILABILITY;

    expect(getTotalWeeklyMinutes(allDisabled)).toBe(0);
  });
});

describe("getEnabledDaysCount", () => {
  it("counts Mon-Sat as 6 enabled days in default config", () => {
    expect(getEnabledDaysCount(DEFAULT_WEEKDAY_AVAILABILITY)).toBe(6);
  });
});

describe("formatMinutes", () => {
  it("formats 0 correctly", () => {
    expect(formatMinutes(0)).toBe("0 min");
  });

  it("formats minutes only", () => {
    expect(formatMinutes(45)).toBe("45min");
  });

  it("formats hours only", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats mixed hours and minutes", () => {
    expect(formatMinutes(90)).toBe("1h 30min");
  });
});

describe("SETTINGS_DEFAULTS", () => {
  it("has the expected default review intervals", () => {
    expect(SETTINGS_DEFAULTS.reviewIntervals).toEqual([1, 3, 7, 14, 30]);
  });

  it("has saturday enabled with 240 minutes", () => {
    expect(SETTINGS_DEFAULTS.weekdayAvailability.saturday.enabled).toBe(true);
    expect(SETTINGS_DEFAULTS.weekdayAvailability.saturday.availableMinutes).toBe(240);
  });

  it("has sunday disabled", () => {
    expect(SETTINGS_DEFAULTS.weekdayAvailability.sunday.enabled).toBe(false);
  });

  it("has reviewAutoCreate.onBlockComplete true", () => {
    expect(SETTINGS_DEFAULTS.reviewAutoCreate.onBlockComplete).toBe(true);
  });
});
