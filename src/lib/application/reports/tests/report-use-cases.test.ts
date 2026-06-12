// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { createTestDatabase } from "@/test/indexed-db";
import {
  deleteWeeklyReportSnapshot,
  saveReportReflection,
  saveWeeklyReportSnapshot,
} from "@/lib/application/reports/report-use-cases";
import type { WeeklyReport } from "@/lib/domain/reports";

describe("report use cases", () => {
  let db: UberPrepDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it("uses the shared weekly reflection record", async () => {
    await saveReportReflection(db, 2, {
      content: "Resumo",
      wins: "Evolução",
      blockers: "Tempo",
      whatWorked: "Timer",
      whatToAdjust: "Agenda",
    });

    const record = await db.weeklyReflections.where("weekNumber").equals(2).first();
    expect(record).toMatchObject({
      id: "reflection:week-2",
      wins: "Evolução",
      whatWorked: "Timer",
      whatToAdjust: "Agenda",
    });
  });

  it("saves and deletes a frozen report snapshot", async () => {
    const report = {
      weekNumber: 1,
      weekStart: "2026-06-08",
      weekEnd: "2026-06-14",
      generatedAt: "2026-06-15T00:00:00Z",
    } as WeeklyReport;

    await saveWeeklyReportSnapshot(db, report);
    const snapshot = await db.weeklyReportSnapshots.get("weekly-report:1");
    expect(snapshot?.reportJson).toContain('"weekNumber":1');

    await deleteWeeklyReportSnapshot(db, 1);
    expect(await db.weeklyReportSnapshots.count()).toBe(0);
  });
});
