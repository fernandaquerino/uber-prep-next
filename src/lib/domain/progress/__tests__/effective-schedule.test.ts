import { describe, expect, it } from "vitest";
import {
  buildEffectiveSchedule,
  completePlanBlock,
  getCurrentStudyState,
  getOverduePlanItems,
  initializePlanProgress,
  reschedulePlanBlock,
  skipPlanBlock,
} from "../index";
import { DEFAULT_WEEKDAY_AVAILABILITY, parseCalendarDate } from "@/lib/domain/schedule";
import { createBaseSchedule, NOW } from "./test-fixtures";

describe("effective schedule and selectors", () => {
  it("initializes progress idempotently and preserves existing records", () => {
    const baseSchedule = createBaseSchedule();
    const first = initializePlanProgress(baseSchedule, [], NOW);
    const completed = completePlanBlock(first.progress, {
      blockId: "block-1",
      completedAt: "2026-06-11T13:00:00.000Z",
    }).progress;
    const second = initializePlanProgress(baseSchedule, completed, "2026-06-12T13:00:00.000Z");

    expect(second.progress).toHaveLength(5);
    expect(second.events).toHaveLength(0);
    expect(second.progress.find((record) => record.blockId === "block-1")?.status).toBe(
      "completed",
    );
  });

  it("separates base and effective dates, preserving original date on reschedule", () => {
    const baseSchedule = createBaseSchedule();
    const progress = initializePlanProgress(baseSchedule, [], NOW).progress;
    const result = reschedulePlanBlock(
      { baseSchedule, progress },
      {
        blockId: "block-2",
        targetDate: parseCalendarDate("2026-06-16"),
        today: parseCalendarDate("2026-06-12"),
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
        now: "2026-06-12T10:00:00.000Z",
      },
    );
    const effective = buildEffectiveSchedule(baseSchedule, result.progress, result.overrides, {
      today: parseCalendarDate("2026-06-12"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });
    const item = effective
      .flatMap((day) => day.items)
      .find((candidate) => candidate.blockId === "block-2");

    expect(item).toMatchObject({
      originalScheduledDate: "2026-06-12",
      scheduledDate: "2026-06-16",
      isRescheduled: true,
    });
  });

  it("detects overdue items without marking completed or skipped as overdue", () => {
    const baseSchedule = createBaseSchedule();
    let progress = initializePlanProgress(baseSchedule, [], NOW).progress;
    progress = completePlanBlock(progress, {
      blockId: "block-1",
      completedAt: "2026-06-11T13:00:00.000Z",
    }).progress;
    progress = skipPlanBlock(progress, "block-2", "2026-06-12T13:00:00.000Z").progress;

    const effective = buildEffectiveSchedule(baseSchedule, progress, [], {
      today: parseCalendarDate("2026-06-16"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });

    expect(getOverduePlanItems(effective).map((item) => item.blockId)).toEqual([
      "block-3",
      "block-4",
    ]);
  });

  it("keeps cursor on earlier pending item when a future item is completed", () => {
    const baseSchedule = createBaseSchedule();
    const initialized = initializePlanProgress(baseSchedule, [], NOW).progress;
    const progress = completePlanBlock(initialized, {
      blockId: "block-3",
      completedAt: "2026-06-13T13:00:00.000Z",
    }).progress;
    const effective = buildEffectiveSchedule(baseSchedule, progress, [], {
      today: parseCalendarDate("2026-06-13"),
      availability: DEFAULT_WEEKDAY_AVAILABILITY,
    });

    expect(getCurrentStudyState(effective).currentItem?.blockId).toBe("block-1");
  });
});
