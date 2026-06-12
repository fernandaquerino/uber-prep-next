import type { UberPrepDatabase } from "@/lib/db/schema";
import type { WeeklyReport, WeeklyReportReflection } from "@/lib/domain/reports";
import { createWeeklyReflectionsRepository } from "@/lib/repositories/weekly-reflections.repository";
import { createWeeklyReportSnapshotsRepository } from "@/lib/repositories/weekly-report-snapshots.repository";

export async function saveReportReflection(
  db: UberPrepDatabase,
  weekNumber: number,
  reflection: WeeklyReportReflection,
): Promise<void> {
  const repository = createWeeklyReflectionsRepository(db);
  const existing = await repository.findByWeekNumber(weekNumber);
  const now = new Date().toISOString();
  await repository.upsert({
    id: existing?.id ?? `reflection:week-${weekNumber}`,
    weekNumber,
    content: reflection.content || undefined,
    wins: reflection.wins || undefined,
    blockers: reflection.blockers || undefined,
    whatWorked: reflection.whatWorked || undefined,
    whatToAdjust: reflection.whatToAdjust || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

export async function saveWeeklyReportSnapshot(
  db: UberPrepDatabase,
  report: WeeklyReport,
): Promise<void> {
  await createWeeklyReportSnapshotsRepository(db).upsert({
    id: `weekly-report:${report.weekNumber}`,
    weekNumber: report.weekNumber,
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    generatedAt: report.generatedAt,
    reportJson: JSON.stringify(report),
  });
}

export async function deleteWeeklyReportSnapshot(
  db: UberPrepDatabase,
  weekNumber: number,
): Promise<void> {
  await createWeeklyReportSnapshotsRepository(db).deleteByWeekNumber(weekNumber);
}
