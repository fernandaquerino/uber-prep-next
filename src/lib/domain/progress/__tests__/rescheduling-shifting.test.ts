import { describe, expect, it } from "vitest";
import {
  completePlanBlock,
  handleMissedStudyDay,
  reschedulePlanBlock,
  shiftPendingSchedule,
  skipPlanBlock,
  undoProgressAction,
} from "../index";
import { DEFAULT_WEEKDAY_AVAILABILITY, parseCalendarDate } from "@/lib/domain/schedule";
import {
  CannotRescheduleCompletedBlockError,
  CannotRescheduleSkippedBlockError,
  InvalidRescheduleDateError,
} from "../progress.errors";
import { createBaseSchedule, createInitializedProgress } from "./test-fixtures";

describe("rescheduling, missed days, shifting and undo", () => {
  it("blocks completed, skipped, rest-day, and past-date reschedules by default", () => {
    const baseSchedule = createBaseSchedule();
    let progress = createInitializedProgress();
    progress = completePlanBlock(progress, {
      blockId: "block-1",
      completedAt: "2026-06-11T13:00:00.000Z",
    }).progress;
    progress = skipPlanBlock(progress, "block-2", "2026-06-12T13:00:00.000Z").progress;

    expect(() =>
      reschedulePlanBlock(
        { baseSchedule, progress },
        {
          blockId: "block-1",
          targetDate: parseCalendarDate("2026-06-16"),
          today: parseCalendarDate("2026-06-12"),
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-12T14:00:00.000Z",
        },
      ),
    ).toThrow(CannotRescheduleCompletedBlockError);
    expect(() =>
      reschedulePlanBlock(
        { baseSchedule, progress },
        {
          blockId: "block-2",
          targetDate: parseCalendarDate("2026-06-16"),
          today: parseCalendarDate("2026-06-12"),
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-12T14:00:00.000Z",
        },
      ),
    ).toThrow(CannotRescheduleSkippedBlockError);
    expect(() =>
      reschedulePlanBlock(
        { baseSchedule, progress },
        {
          blockId: "block-3",
          targetDate: parseCalendarDate("2026-06-14"),
          today: parseCalendarDate("2026-06-12"),
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-12T14:00:00.000Z",
        },
      ),
    ).toThrow(InvalidRescheduleDateError);
    expect(() =>
      reschedulePlanBlock(
        { baseSchedule, progress },
        {
          blockId: "block-3",
          targetDate: parseCalendarDate("2026-06-11"),
          today: parseCalendarDate("2026-06-12"),
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-12T14:00:00.000Z",
        },
      ),
    ).toThrow(InvalidRescheduleDateError);
  });

  it("allows explicit rest-day reschedule and warns when capacity is exceeded", () => {
    const baseSchedule = createBaseSchedule();
    const progress = createInitializedProgress();
    const result = reschedulePlanBlock(
      { baseSchedule, progress },
      {
        blockId: "block-3",
        targetDate: parseCalendarDate("2026-06-14"),
        today: parseCalendarDate("2026-06-12"),
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
        allowRestDay: true,
        now: "2026-06-12T14:00:00.000Z",
      },
    );

    expect(result.events[0].type).toBe("rescheduled");
    expect(
      result.progress.find((record) => record.blockId === "block-3")?.originalScheduledDate,
    ).toBe("2026-06-13");
  });

  it("shifts pending schedule after a missed Friday and skips Sunday", () => {
    const baseSchedule = createBaseSchedule();
    let progress = createInitializedProgress();
    progress = completePlanBlock(progress, {
      blockId: "block-1",
      completedAt: "2026-06-11T13:00:00.000Z",
    }).progress;
    const result = shiftPendingSchedule(
      { baseSchedule, progress },
      {
        fromDate: parseCalendarDate("2026-06-12"),
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
        now: "2026-06-12T18:00:00.000Z",
      },
    );
    const byBlock = new Map(
      result.progress.map((record) => [record.blockId, record.scheduledDate]),
    );

    expect(byBlock.get("block-1")).toBe("2026-06-11");
    expect(byBlock.get("block-2")).toBe("2026-06-13");
    expect(byBlock.get("block-3")).toBe("2026-06-15");
    expect(byBlock.get("block-4")).toBe("2026-06-16");
    expect(byBlock.get("block-5")).toBe("2026-06-17");
    expect(result.events.every((event) => event.actionGroupId === result.actionGroupId)).toBe(true);
  });

  it("handles missed day strategies", () => {
    const baseSchedule = createBaseSchedule();
    const progress = createInitializedProgress();

    expect(
      handleMissedStudyDay(
        { baseSchedule, progress },
        {
          missedDate: parseCalendarDate("2026-06-12"),
          today: parseCalendarDate("2026-06-13"),
          strategy: "keep_overdue",
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-13T10:00:00.000Z",
        },
      ).progress,
    ).toEqual(progress);

    expect(
      handleMissedStudyDay(
        { baseSchedule, progress },
        {
          missedDate: parseCalendarDate("2026-06-12"),
          today: parseCalendarDate("2026-06-13"),
          strategy: "skip_items",
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          now: "2026-06-13T10:00:00.000Z",
        },
      ).progress.find((record) => record.blockId === "block-2")?.status,
    ).toBe("skipped");

    expect(
      handleMissedStudyDay(
        { baseSchedule, progress },
        {
          missedDate: parseCalendarDate("2026-06-12"),
          today: parseCalendarDate("2026-06-13"),
          strategy: "reschedule_items",
          availability: DEFAULT_WEEKDAY_AVAILABILITY,
          rescheduleTargets: { "block-2": parseCalendarDate("2026-06-16") },
          now: "2026-06-13T10:00:00.000Z",
        },
      ).progress.find((record) => record.blockId === "block-2")?.scheduledDate,
    ).toBe("2026-06-16");
  });

  it("undoes skip and grouped shift while preserving undo history", () => {
    const baseSchedule = createBaseSchedule();
    let progress = createInitializedProgress();
    const skip = skipPlanBlock(progress, "block-1", "2026-06-11T13:00:00.000Z");
    progress = skip.progress;
    const undoSkip = undoProgressAction(progress, skip.events, [], {
      eventId: skip.events[0].id,
      occurredAt: "2026-06-11T14:00:00.000Z",
    });

    expect(undoSkip.progress.find((record) => record.blockId === "block-1")?.status).toBe(
      "pending",
    );
    expect(undoSkip.events[0].type).toBe("undone");

    const shifted = shiftPendingSchedule(
      { baseSchedule, progress: createInitializedProgress() },
      {
        fromDate: parseCalendarDate("2026-06-12"),
        availability: DEFAULT_WEEKDAY_AVAILABILITY,
        now: "2026-06-12T18:00:00.000Z",
      },
    );
    const undoShift = undoProgressAction(shifted.progress, shifted.events, shifted.overrides, {
      actionGroupId: shifted.actionGroupId,
      occurredAt: "2026-06-12T19:00:00.000Z",
    });

    expect(undoShift.progress.find((record) => record.blockId === "block-2")?.scheduledDate).toBe(
      "2026-06-12",
    );
    expect(undoShift.removedOverrideIds).toHaveLength(shifted.overrides.length);
  });
});
