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
    // Default availability: weekdays 120 min at 19:00, Saturday + Sunday rest.
    const schedule = buildStudySchedule(createPlan(createPlanDays(5)), createConfig("2026-06-11"));

    expect(schedule[0]).toMatchObject({
      date: "2026-06-11",
      weekday: "thursday",
      isRestDay: false,
      availableMinutes: 120,
    });
    expect(schedule[1]).toMatchObject({
      date: "2026-06-12",
      weekday: "friday",
      isRestDay: false,
      availableMinutes: 120,
    });
    expect(schedule[2]).toMatchObject({
      date: "2026-06-13",
      weekday: "saturday",
      isRestDay: true,
      items: [],
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
      availableMinutes: 120,
    });
    expect(schedule[5]).toMatchObject({
      date: "2026-06-16",
      weekday: "tuesday",
      isRestDay: false,
      availableMinutes: 120,
    });
  });

  it("rests on Saturday by default and moves content to the next study day", () => {
    const schedule = buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-06-13"));

    expect(schedule.map((day) => day.date)).toEqual([
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
    ]);
    expect(schedule[0]).toMatchObject({ weekday: "saturday", isRestDay: true });
    expect(schedule[1]).toMatchObject({ weekday: "sunday", isRestDay: true });
    expect(schedule[2]).toMatchObject({ weekday: "monday", availableMinutes: 120 });
    expect(schedule[3]).toMatchObject({ weekday: "tuesday", availableMinutes: 120 });
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
    // 2026-01-31 is a Saturday (rest by default) → content starts Monday 02-02.
    expect(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-01-31")).map(
        (d) => d.date,
      ),
    ).toEqual(["2026-01-31", "2026-02-01", "2026-02-02", "2026-02-03"]);
    // 2026-12-31 is a Thursday → content flows straight into Friday 2027-01-01.
    expect(
      buildStudySchedule(createPlan(createPlanDays(2)), createConfig("2026-12-31")).map(
        (d) => d.date,
      ),
    ).toEqual(["2026-12-31", "2027-01-01"]);
  });

  it("builds schedules across calendar weeks and does not append rests after the last content", () => {
    // Thu, Fri hold content; Sat + Sun rest; Monday holds the third plan day.
    const schedule = buildStudySchedule(createPlan(createPlanDays(3)), createConfig("2026-06-11"));

    expect(schedule.map((day) => day.date)).toEqual([
      "2026-06-11",
      "2026-06-12",
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
    ]);
    expect(schedule.at(-1)).toMatchObject({ date: "2026-06-15", isRestDay: false });
  });

  it("reflows a plan day across multiple calendar days when it exceeds capacity", () => {
    // One plan day worth 360 min (two 180-min blocks) against 120-min days: each
    // block is larger than a day, so both are placed alone on their own day.
    const config = createConfig("2026-06-15"); // Monday
    const schedule = buildStudySchedule(createPlan(createPlanDays(1, 360)), config);

    expect(schedule.map((d) => d.date)).toEqual(["2026-06-15", "2026-06-16"]);
    expect(schedule[0].items.map((i) => i.blockId)).toEqual(["block-1-a"]);
    expect(schedule[1].items.map((i) => i.blockId)).toEqual(["block-1-b"]);
    // A block larger than a whole day is placed alone and flagged over capacity.
    expect(schedule[0]).toMatchObject({ totalEstimatedMinutes: 180, capacityStatus: "over_capacity" });
  });

  it("slides a whole block to the next day rather than splitting it", () => {
    // Blocks of 80 + 80 min against 120-min days: the second block does not fit
    // the 40 remaining minutes, so it slides intact to the next day.
    const schedule = buildStudySchedule(createPlan(createPlanDays(1, 160)), createConfig("2026-06-15"));

    expect(schedule[0].items.map((i) => i.blockId)).toEqual(["block-1-a"]);
    expect(schedule[0].totalEstimatedMinutes).toBe(80);
    expect(schedule[1].items.map((i) => i.blockId)).toEqual(["block-1-b"]);
  });

  it("computes block start times from the day start plus prior durations", () => {
    // Two 60-min blocks fit one 120-min day starting at 19:00.
    const schedule = buildStudySchedule(createPlan(createPlanDays(1, 120)), createConfig("2026-06-15"));

    expect(schedule[0].items.map((i) => i.startTime)).toEqual(["19:00", "20:00"]);
  });

  it("marks capacity status: full when exactly filled, available when under", () => {
    const fullSchedule = buildStudySchedule(
      createPlan(createPlanDays(1, 120)),
      createConfig("2026-06-15"),
    );
    // A single 60-min plan day leaves 60 min free on a 120-min day.
    const availableSchedule = buildStudySchedule(
      createPlan(createPlanDays(1, 60)),
      createConfig("2026-06-15"),
    );

    expect(fullSchedule[0]).toMatchObject({ remainingMinutes: 0, capacityStatus: "full" });
    expect(availableSchedule[0]).toMatchObject({
      remainingMinutes: 60,
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
          {
            id: "same",
            title: "A",
            category: "algorithms",
            estimatedMinutes: 10,
            type: "exercicio",
          },
          {
            id: "same",
            title: "B",
            category: "javascript",
            estimatedMinutes: 10,
            type: "exercicio",
          },
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
              {
                id: "invalid",
                title: "Invalid",
                category: "x",
                estimatedMinutes: Number.NaN,
                type: "exercicio",
              },
            ],
          },
        ]),
        createConfig("2026-06-15"),
      ),
    ).toThrow(InvalidStudyPlanError);
  });
});
