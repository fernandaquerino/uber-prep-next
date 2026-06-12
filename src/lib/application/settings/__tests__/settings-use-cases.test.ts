import { describe, it, expect } from "vitest";
import "fake-indexeddb/auto";
import { UberPrepDatabase } from "@/lib/db/schema";
import {
  getSettings,
  updateSettings,
  getTimerSettings,
  updateTimerSettings,
  resetModule,
} from "../settings-use-cases";
import { withSettingsDefaults } from "@/lib/domain/settings";
import { SETTINGS_ID, TIMER_SETTINGS_ID } from "@/lib/db/constants";

function makeDb() {
  return new UberPrepDatabase(`test-settings-${Math.random()}`);
}

async function seedDb(db: UberPrepDatabase) {
  const now = new Date().toISOString();
  const settings = withSettingsDefaults({
    id: SETTINGS_ID,
    startDate: null,
    createdAt: now,
    updatedAt: now,
  });
  await db.settings.put(settings);
  await db.timerSettings.put({
    id: TIMER_SETTINGS_ID,
    defaultMode: "countdown",
    defaultPresetSeconds: 45 * 60,
    soundEnabled: true,
    notificationsEnabled: false,
    confirmBeforeCancel: true,
    showCompactTimer: true,
    longSessionThresholdSeconds: 4 * 60 * 60,
    createdAt: now,
    updatedAt: now,
  });
}

describe("getSettings", () => {
  it("returns settings with defaults for a seeded record", async () => {
    const db = makeDb();
    await seedDb(db);
    const s = await getSettings(db);
    expect(s.id).toBe("app-settings");
    expect(s.planDurationWeeks).toBe(6);
    expect(s.reviewIntervals).toEqual([1, 3, 7, 14, 30]);
  });

  it("creates default settings when none exist", async () => {
    const db = makeDb();
    const s = await getSettings(db);
    expect(s.theme).toBe("system");
    expect(s.weekdayAvailability.monday.enabled).toBe(true);
  });

  it("repairs legacy settings without weekday availability", async () => {
    const db = makeDb();
    const now = new Date().toISOString();
    await db.settings.put({
      id: SETTINGS_ID,
      startDate: "2026-06-12",
      timezone: "America/Sao_Paulo",
      createdAt: now,
      updatedAt: now,
    } as Parameters<typeof db.settings.put>[0]);

    const settings = await getSettings(db);
    expect(settings.weekdayAvailability.monday.availableMinutes).toBe(480);
    expect(settings.weekdayAvailability.sunday.enabled).toBe(false);
  });
});

describe("updateSettings", () => {
  it("updates a specific field without losing others", async () => {
    const db = makeDb();
    await seedDb(db);
    const updated = await updateSettings(db, { theme: "dark", planDurationWeeks: 8 });
    expect(updated.theme).toBe("dark");
    expect(updated.planDurationWeeks).toBe(8);
    expect(updated.reviewIntervals).toEqual([1, 3, 7, 14, 30]); // preserved
  });

  it("updates weekday availability", async () => {
    const db = makeDb();
    await seedDb(db);
    const newAvailability = {
      monday: { enabled: true, availableMinutes: 120 },
      tuesday: { enabled: true, availableMinutes: 120 },
      wednesday: { enabled: false, availableMinutes: 0 },
      thursday: { enabled: true, availableMinutes: 120 },
      friday: { enabled: true, availableMinutes: 120 },
      saturday: { enabled: false, availableMinutes: 0 },
      sunday: { enabled: false, availableMinutes: 0 },
    };
    const updated = await updateSettings(db, { weekdayAvailability: newAvailability });
    expect(updated.weekdayAvailability.wednesday.enabled).toBe(false);
    expect(updated.weekdayAvailability.monday.availableMinutes).toBe(120);
  });

  it("updates start date", async () => {
    const db = makeDb();
    await seedDb(db);
    const updated = await updateSettings(db, { startDate: "2026-06-12" });
    expect(updated.startDate).toBe("2026-06-12");
  });

  it("updates review intervals", async () => {
    const db = makeDb();
    await seedDb(db);
    const updated = await updateSettings(db, { reviewIntervals: [1, 7, 30] });
    expect(updated.reviewIntervals).toEqual([1, 7, 30]);
  });
});

describe("getTimerSettings", () => {
  it("returns timer settings for a seeded record", async () => {
    const db = makeDb();
    await seedDb(db);
    const t = await getTimerSettings(db);
    expect(t.defaultMode).toBe("countdown");
    expect(t.soundEnabled).toBe(true);
  });

  it("creates defaults when timer settings don't exist", async () => {
    const db = makeDb();
    const t = await getTimerSettings(db);
    expect(t.id).toBe("timer-settings");
    expect(t.defaultPresetSeconds).toBe(45 * 60);
  });
});

describe("updateTimerSettings", () => {
  it("updates timer sound and notification", async () => {
    const db = makeDb();
    await seedDb(db);
    const updated = await updateTimerSettings(db, {
      soundEnabled: false,
      notificationsEnabled: true,
    });
    expect(updated.soundEnabled).toBe(false);
    expect(updated.notificationsEnabled).toBe(true);
    expect(updated.confirmBeforeCancel).toBe(true); // preserved
  });
});

describe("resetModule", () => {
  it("resets plan progress without touching settings", async () => {
    const db = makeDb();
    await seedDb(db);
    await db.planProgress.add({
      id: "prog-1",
      blockId: "b1",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await resetModule(db, "plan");

    expect(await db.planProgress.count()).toBe(0);
    expect(await db.settings.count()).toBe(1); // settings untouched
  });

  it("resets settings but not plan progress", async () => {
    const db = makeDb();
    await seedDb(db);
    await db.planProgress.add({
      id: "prog-2",
      blockId: "b2",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await resetModule(db, "settings");

    expect(await db.settings.count()).toBe(0);
    expect(await db.planProgress.count()).toBe(1); // plan untouched
  });

  it("resets all data with all module", async () => {
    const db = makeDb();
    await seedDb(db);
    await db.planProgress.add({
      id: "prog-3",
      blockId: "b3",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await resetModule(db, "all");

    expect(await db.settings.count()).toBe(0);
    expect(await db.planProgress.count()).toBe(0);
  });

  it("removes structured quiz progress without deleting the question catalog", async () => {
    const db = makeDb();
    const now = new Date().toISOString();
    await db.quizQuestions.put({
      id: "question-1",
      prompt: "Question",
      type: "open_text",
      category: "javascript",
      difficulty: "medium",
      topicIds: [],
      tags: [],
      sourceType: "seed",
      lifecycleStatus: "active",
      createdAt: now,
      updatedAt: now,
    });
    await db.quizSessions.put({
      id: "session-1",
      type: "daily",
      status: "in_progress",
      questionIds: ["question-1"],
      currentIndex: 0,
      config: { type: "daily", feedbackMode: "immediate" },
      startedAt: now,
      updatedAt: now,
      elapsedSeconds: 0,
    });

    await resetModule(db, "quizzes");

    expect(await db.quizQuestions.count()).toBe(1);
    expect(await db.quizSessions.count()).toBe(0);
  });

  it("removes mock evidence and note history in their module resets", async () => {
    const db = makeDb();
    const now = new Date().toISOString();
    await db.mockEvidence.put({
      id: "evidence-1",
      mockId: "mock-1",
      area: "communication",
      kind: "gap",
      description: "Needs practice",
      confidence: 3,
      createdAt: now,
    });
    await db.noteVersions.put({
      id: "version-1",
      noteId: "note-1",
      title: "Version",
      content: "Content",
      reason: "manual",
      createdAt: now,
    });

    await resetModule(db, "mocks");
    await resetModule(db, "notes");

    expect(await db.mockEvidence.count()).toBe(0);
    expect(await db.noteVersions.count()).toBe(0);
  });
});
