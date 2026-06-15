import { describe, expect, it } from "vitest";
import { parseCalendarDate, type CalendarDate } from "@/lib/domain/schedule";
import type { EffectiveScheduledBlock } from "@/lib/domain/progress";
import { buildNotifications } from "../build-notifications";

const TODAY = parseCalendarDate("2026-06-12");

function makeBlock(overrides: Partial<EffectiveScheduledBlock> = {}): EffectiveScheduledBlock {
  const scheduledDate = (overrides.scheduledDate ?? TODAY) as CalendarDate;
  return {
    blockId: "b1",
    planDayId: "d1",
    planDaySequence: 1,
    title: "Two Sum",
    category: "algo",
    estimatedMinutes: 45,
    type: "exercicio",
    originalScheduledDate: scheduledDate,
    scheduledDate,
    executionStatus: "pending",
    timingStatus: "today",
    isOverdue: false,
    isRescheduled: false,
    ...overrides,
  };
}

describe("buildNotifications", () => {
  it("returns no notifications when everything is up to date", () => {
    const result = buildNotifications({
      today: TODAY,
      reviewSummary: { dueToday: 0, overdue: 0 },
      overdueItems: [],
      currentItem: null,
    });
    expect(result).toEqual([]);
  });

  it("creates a single aggregated notification for overdue plan items, using the earliest date", () => {
    const result = buildNotifications({
      today: TODAY,
      reviewSummary: { dueToday: 0, overdue: 0 },
      overdueItems: [
        makeBlock({
          blockId: "late-b",
          title: "Closures",
          scheduledDate: parseCalendarDate("2026-06-11"),
          isOverdue: true,
        }),
        makeBlock({
          blockId: "late-a",
          title: "Debounce",
          scheduledDate: parseCalendarDate("2026-06-10"),
          isOverdue: true,
        }),
      ],
      currentItem: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "plan-overdue",
      type: "plan_overdue",
      title: "2 conteúdos atrasados",
      date: "2026-06-10",
      href: "/plano",
    });
    expect(result[0].description).toContain("Debounce");
  });

  it("creates review notifications with correct pluralization", () => {
    const result = buildNotifications({
      today: TODAY,
      reviewSummary: { dueToday: 1, overdue: 3 },
      overdueItems: [],
      currentItem: null,
    });

    const overdue = result.find((n) => n.id === "review-overdue");
    const due = result.find((n) => n.id === "review-due");
    expect(overdue?.description).toContain("3 revisões");
    expect(due?.description).toContain("1 revisão para revisar hoje");
  });

  it("surfaces today's study only when the current item is scheduled for today and not overdue", () => {
    const overdueCurrent = makeBlock({ scheduledDate: TODAY, isOverdue: true });
    const futureCurrent = makeBlock({ scheduledDate: parseCalendarDate("2026-06-15") });
    const todayCurrent = makeBlock({ scheduledDate: TODAY, isOverdue: false });

    expect(
      buildNotifications({
        today: TODAY,
        reviewSummary: { dueToday: 0, overdue: 0 },
        overdueItems: [],
        currentItem: overdueCurrent,
      }).some((n) => n.id === "study-today"),
    ).toBe(false);

    expect(
      buildNotifications({
        today: TODAY,
        reviewSummary: { dueToday: 0, overdue: 0 },
        overdueItems: [],
        currentItem: futureCurrent,
      }).some((n) => n.id === "study-today"),
    ).toBe(false);

    expect(
      buildNotifications({
        today: TODAY,
        reviewSummary: { dueToday: 0, overdue: 0 },
        overdueItems: [],
        currentItem: todayCurrent,
      }).some((n) => n.id === "study-today"),
    ).toBe(true);
  });
});
