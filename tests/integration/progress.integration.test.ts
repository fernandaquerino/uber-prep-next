import { afterEach, describe, expect, it } from "vitest";
import { createTestDatabase, _resetDbSingleton } from "@/test/indexed-db";
import {
  buildStudySchedule,
  DEFAULT_WEEKDAY_AVAILABILITY,
  parseCalendarDate,
  PRODUCT_TIMEZONE,
  type StudyPlan,
} from "@/lib/domain/schedule";
import {
  completePlanBlock,
  getEffectiveSchedule,
  initializePlanProgress,
  reschedulePlanBlock,
  shiftPendingSchedule,
  undoProgressAction,
} from "@/lib/application/progress";
import { createProgressRepository } from "@/lib/repositories/progress.repository";
import { createProgressHistoryRepository } from "@/lib/repositories/progress-history.repository";
import { createScheduleOverridesRepository } from "@/lib/repositories/schedule-overrides.repository";

afterEach(() => {
  _resetDbSingleton();
});

describe("plan progress integration", () => {
  it("persists progress actions, overrides, shift groups and undo", async () => {
    const db = createTestDatabase();
    const baseSchedule = createBaseSchedule();

    await initializePlanProgress({
      db,
      baseSchedule,
      now: "2026-06-11T10:00:00.000Z",
    });

    const progressRepo = createProgressRepository(db);
    const historyRepo = createProgressHistoryRepository(db);
    const overridesRepo = createScheduleOverridesRepository(db);

    expect(await progressRepo.count()).toBe(5);
    await completePlanBlock({
      db,
      blockId: "block-1",
      completedAt: "2026-06-11T11:00:00.000Z",
      actualMinutes: 95,
      difficulty: 3,
      confidence: 4,
      notes: "Done",
      patternUsed: "two pointers",
    });

    expect((await progressRepo.findByBlockId("block-1"))?.status).toBe("completed");
    expect((await progressRepo.findByBlockId("block-1"))?.actualMinutes).toBe(95);
    expect(
      (await historyRepo.listByBlockId("block-1")).some((event) => event.type === "completed"),
    ).toBe(true);

    await reschedulePlanBlock({
      db,
      baseSchedule,
      blockId: "block-2",
      targetDate: parseCalendarDate("2026-06-16"),
      today: parseCalendarDate("2026-06-12"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
      now: "2026-06-12T10:00:00.000Z",
    });

    expect((await progressRepo.findByBlockId("block-2"))?.scheduledDate).toBe("2026-06-16");
    expect((await overridesRepo.listByBlockId("block-2"))[0]?.type).toBe("reschedule");

    const shift = await shiftPendingSchedule({
      db,
      baseSchedule,
      fromDate: parseCalendarDate("2026-06-12"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
      now: "2026-06-12T18:00:00.000Z",
    });

    expect((await historyRepo.listByActionGroupId(shift.actionGroupId)).length).toBeGreaterThan(0);
    expect((await overridesRepo.listByActionGroupId(shift.actionGroupId)).length).toBeGreaterThan(
      0,
    );

    const effective = await getEffectiveSchedule({
      db,
      baseSchedule,
      today: parseCalendarDate("2026-06-13"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });

    expect(
      effective.flatMap((day) => day.items).find((item) => item.blockId === "block-3")
        ?.scheduledDate,
    ).toBe("2026-06-15");

    await undoProgressAction({
      db,
      actionGroupId: shift.actionGroupId,
      occurredAt: "2026-06-12T19:00:00.000Z",
    });

    expect((await progressRepo.findByBlockId("block-3"))?.scheduledDate).toBe("2026-06-13");
    expect(await overridesRepo.listByActionGroupId(shift.actionGroupId)).toEqual([]);
  });

  it("rolls back progress updates when history write fails", async () => {
    const db = createTestDatabase();
    const baseSchedule = createBaseSchedule();
    await initializePlanProgress({
      db,
      baseSchedule,
      now: "2026-06-11T10:00:00.000Z",
    });

    await db.progressEvents.add({
      id: "progress-event:completed:block-2:2026-06-12T11:00:00.000Z",
      blockId: "block-2",
      type: "completed",
      occurredAt: "2026-06-12T11:00:00.000Z",
    });

    await expect(
      completePlanBlock({
        db,
        blockId: "block-2",
        completedAt: "2026-06-12T11:00:00.000Z",
      }),
    ).rejects.toThrow();

    expect((await createProgressRepository(db).findByBlockId("block-2"))?.status).toBe("pending");
  });
});

function createBaseSchedule() {
  const plan: StudyPlan = {
    id: "plan",
    title: "Plan",
    version: 1,
    days: Array.from({ length: 5 }, (_, index) => {
      const sequence = index + 1;
      return {
        id: `day-${sequence}`,
        sequence,
        title: `Day ${sequence}`,
        blocks: [
          {
            id: `block-${sequence}`,
            title: `Block ${sequence}`,
            category: "algorithms",
            estimatedMinutes: 120,
            type: "exercicio",
          },
        ],
      };
    }),
  };

  return buildStudySchedule(plan, {
    startDate: parseCalendarDate("2026-06-11"),
    timezone: PRODUCT_TIMEZONE,
    weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
  });
}
