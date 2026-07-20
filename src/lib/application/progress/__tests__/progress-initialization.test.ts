import { describe, it, expect } from "vitest";
import "fake-indexeddb/auto";
import { UberPrepDatabase } from "@/lib/db/schema";
import { parseCalendarDate, DEFAULT_WEEKDAY_AVAILABILITY } from "@/lib/domain/schedule";
import type { ScheduledStudyDay } from "@/lib/domain/schedule";
import { completePlanBlock, getEffectiveSchedule } from "../progress-use-cases";

const TODAY = parseCalendarDate("2026-06-11");

function makeDb() {
  return new UberPrepDatabase(`test-progress-init-${Math.random()}`);
}

function makeBaseSchedule(): ScheduledStudyDay[] {
  return [
    {
      date: TODAY,
      weekday: "thursday",
      availableMinutes: 480,
      isRestDay: false,
      totalEstimatedMinutes: 60,
      remainingMinutes: 420,
      capacityStatus: "available",
      items: [
        {
          blockId: "block-1",
          planDayId: "day-1",
          planDaySequence: 1,
          title: "Two Pointers",
          category: "algo",
          estimatedMinutes: 60,
          type: "exercicio",
        },
      ],
    },
  ];
}

describe("plan progress initialization", () => {
  it("cria registros de progresso ao ler a agenda efetiva", async () => {
    const db = makeDb();
    const baseSchedule = makeBaseSchedule();

    await getEffectiveSchedule({
      db,
      baseSchedule,
      today: TODAY,
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });

    const records = await db.planProgress.toArray();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ blockId: "block-1", status: "pending" });
  });

  it("permite concluir um bloco que nunca teve progresso registrado", async () => {
    const db = makeDb();
    const baseSchedule = makeBaseSchedule();

    await getEffectiveSchedule({
      db,
      baseSchedule,
      today: TODAY,
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });

    await completePlanBlock({
      db,
      blockId: "block-1",
      completedAt: new Date().toISOString(),
      actualMinutes: 55,
    });

    const schedule = await getEffectiveSchedule({
      db,
      baseSchedule,
      today: TODAY,
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });
    expect(schedule[0].items[0].executionStatus).toBe("completed");
    expect(schedule[0].items[0].actualMinutes).toBe(55);
  });

  it("não duplica registros em leituras repetidas", async () => {
    const db = makeDb();
    const baseSchedule = makeBaseSchedule();

    for (let i = 0; i < 3; i++) {
      await getEffectiveSchedule({
        db,
        baseSchedule,
        today: TODAY,
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
      });
    }

    expect(await db.planProgress.count()).toBe(1);
    expect(await db.progressEvents.count()).toBe(1);
  });
});
