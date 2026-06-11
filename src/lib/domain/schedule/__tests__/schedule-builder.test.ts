import { describe, expect, it } from "vitest";
import { buildStudySchedule, DEFAULT_WEEKDAY_AVAILABILITY, type StudyPlan } from "../index";
import { InvalidStudyPlanError, NoStudyDaysEnabledError } from "../schedule.errors";
import { createConfig, createPlan, createPlanDays } from "./test-fixtures";

describe("buildStudySchedule", () => {
  it("builds a schedule starting on Monday", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-06-15"));

    expect(schedule.map((day) => day.date)).toEqual(["2026-06-15", "2026-06-16"]);
    expect(schedule.map((day) => day.weekday)).toEqual(["monday", "tuesday"]);
  });

  it("builds the required regression schedule starting on Thursday 2026-06-11", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(5)), createConfig("2026-06-11"));

    expect(schedule[0]).toMatchObject({
      date: "2026-06-11",
      weekday: "thursday",
      isRestDay: false,
      availableMinutes: 480,
    });
    expect(schedule[1]).toMatchObject({
      date: "2026-06-12",
      weekday: "friday",
      isRestDay: false,
      availableMinutes: 480,
    });
    expect(schedule[2]).toMatchObject({
      date: "2026-06-13",
      weekday: "saturday",
      isRestDay: false,
      availableMinutes: 240,
    });
    expect(schedule[3]).toMatchObject({
      date: "2026-06-14",
      weekday: "sunday",
      isRestDay: true,
      items: [],
    });
    expect(schedule[4]).toMatchObject({
      date: "2026-06-15",
      weekday: "monday",
      isRestDay: false,
      availableMinutes: 480,
    });
    expect(schedule[5]).toMatchObject({
      date: "2026-06-16",
      weekday: "tuesday",
      isRestDay: false,
      availableMinutes: 480,
    });
  });

  it("builds a schedule starting on Saturday with Saturday capacity", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-06-13"));

    expect(schedule.map((day) => day.date)).toEqual(["2026-06-13", "2026-06-14", "2026-06-15"]);
    expect(schedule[0].availableMinutes).toBe(240);
    expect(schedule[1].isRestDay).toBe(true);
    expect(schedule[2].availableMinutes).toBe(480);
  });

  it("builds a schedule starting on Sunday and moves first content to Monday", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(1)), createConfig("2026-06-14"));

    expect(schedule).toHaveLength(2);
    expect(schedule[0]).toMatchObject({ date: "2026-06-14", isRestDay: true, items: [] });
    expect(schedule[1]).toMatchObject({
      date: "2026-06-15",
      weekday: "monday",
      isRestDay: false,
    });
    expect(schedule[1].items[0].planDaySequence).toBe(1);
  });

  it("preserves plan day order by sequence and block order within each day", () => {
    const plan = createPlan([createPlanDays(1)[0], { ...createPlanDays(2)[1], sequence: 2 }]);
    const schedule = buildStudySchedule(plan, createConfig("2026-06-15"));

    expect(schedule[0].items.map((item) => item.blockId)).toEqual(["block-1-a", "block-1-b"]);
    expect(schedule[1].items.map((item) => item.blockId)).toEqual(["block-2-a", "block-2-b"]);
    expect(schedule.map((day) => day.items[0]?.planDaySequence)).toEqual([1, 2]);
  });

  it("returns an empty schedule for a plan without days", () => {
    expect(buildStudySchedule(createPlan([]), createConfig("2026-06-15"))).toEqual([]);
  });

  it("supports a single day plan", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(1)), createConfig("2026-06-15"));

    expect(schedule).toHaveLength(1);
    expect(schedule[0].items).toHaveLength(2);
  });

  it("builds schedules across month and year boundaries", () => {
    expect(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-01-31")).map(
        (d) => d.date,
      ),
    ).toEqual(["2026-01-31", "2026-02-01", "2026-02-02"]);
    expect(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-12-31")).map(
        (d) => d.date,
      ),
    ).toEqual(["2026-12-31", "2027-01-01"]);
  });

  it("builds schedules across calendar weeks and does not append rests after the last content", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(3)), createConfig("2026-06-11"));

    expect(schedule.map((day) => day.date)).toEqual(["2026-06-11", "2026-06-12", "2026-06-13"]);
  });

  it("marks capacity status without splitting blocks", () => {
    const overCapacitySchedule = buildStudySchedule(
      createPlan(createPlanDays(1, 300)),
      createConfig("2026-06-13"),
    );
    const fullSchedule = buildStudySchedule(
      createPlan(createPlanDays(1, 480)),
      createConfig("2026-06-15"),
    );
    const availableSchedule = buildStudySchedule(
      createPlan(createPlanDays(1, 120)),
      createConfig("2026-06-15"),
    );

    expect(overCapacitySchedule[0]).toMatchObject({
      totalEstimatedMinutes: 300,
      remainingMinutes: -60,
      capacityStatus: "over_capacity",
    });
    expect(fullSchedule[0]).toMatchObject({ remainingMinutes: 0, capacityStatus: "full" });
    expect(availableSchedule[0]).toMatchObject({
      remainingMinutes: 360,
      capacityStatus: "available",
    });
  });

  it("does not mutate the plan or config", () => {
    const plan = createPlan(createPlanDays(2));
    const config = createConfig("2026-06-11");
    const planSnapshot = structuredClone(plan);
    const configSnapshot = structuredClone(config);

    buildStudySchedule(plan, config);

    expect(plan).toEqual(planSnapshot);
    expect(config).toEqual(configSnapshot);
  });

  it("rejects duplicated ids and duplicated sequences", () => {
    const duplicatedBlockId = createPlan([
      {
        id: "day-1",
        sequence: 1,
        title: "Day 1",
        blocks: [
          { id: "same", title: "A", category: "algorithms", estimatedMinutes: 10 },
          { id: "same", title: "B", category: "javascript", estimatedMinutes: 10 },
        ],
      },
    ]);
    const duplicatedSequence = createPlan([
      ...createPlanDays(1),
      { ...createPlanDays(1)[0], id: "day-duplicate", blocks: [] },
    ]);

    expect(() => buildStudySchedule(duplicatedBlockId, createConfig("2026-06-15"))).toThrow(
      InvalidStudyPlanError,
    );
    expect(() => buildStudySchedule(duplicatedSequence, createConfig("2026-06-15"))).toThrow(
      InvalidStudyPlanError,
    );
  });

  it("rejects invalid plan and availability inputs", () => {
    const invalidPlan: StudyPlan = { ...createPlan(createPlanDays(1)), id: "" };
    const invalidAvailability = {
      ...DEFAULT_WEEKDAY_AVAILABILITY,
      monday: { enabled: false, availableMinutes: 0 },
      tuesday: { enabled: false, availableMinutes: 0 },
      wednesday: { enabled: false, availableMinutes: 0 },
      thursday: { enabled: false, availableMinutes: 0 },
      friday: { enabled: false, availableMinutes: 0 },
      saturday: { enabled: false, availableMinutes: 0 },
      sunday: { enabled: false, availableMinutes: 0 },
    };

    expect(() => buildStudySchedule(invalidPlan, createConfig("2026-06-15"))).toThrow(
      InvalidStudyPlanError,
    );
    expect(() =>
      buildStudySchedule(
        createPlan(createPlanDays(1)),
        createConfig("2026-06-15", invalidAvailability),
      ),
    ).toThrow(NoStudyDaysEnabledError);
  });

  it("rejects invalid sequences and estimated minutes", () => {
    expect(() =>
      buildStudySchedule(
        createPlan([{ ...createPlanDays(1)[0], sequence: 0 }]),
        createConfig("2026-06-15"),
      ),
    ).toThrow(InvalidStudyPlanError);
    expect(() =>
      buildStudySchedule(
        createPlan([
          {
            ...createPlanDays(1)[0],
            blocks: [
              { id: "invalid", title: "Invalid", category: "x", estimatedMinutes: Number.NaN },
            ],
          },
        ]),
        createConfig("2026-06-15"),
      ),
    ).toThrow(InvalidStudyPlanError);
  });
});
