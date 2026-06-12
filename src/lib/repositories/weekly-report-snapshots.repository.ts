import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";
import type { WeeklyReportSnapshotRecord } from "@/types/database";

export function createWeeklyReportSnapshotsRepository(db: UberPrepDatabase) {
  return {
    async findByWeekNumber(weekNumber: number): Promise<WeeklyReportSnapshotRecord | undefined> {
      try {
        return await db.weeklyReportSnapshots.where("weekNumber").equals(weekNumber).first();
      } catch (error) {
        throw new DatabaseError(`Failed to load report snapshot for week ${weekNumber}`, error);
      }
    },
    async listAll(): Promise<WeeklyReportSnapshotRecord[]> {
      try {
        return await db.weeklyReportSnapshots.orderBy("weekNumber").toArray();
      } catch (error) {
        throw new DatabaseError("Failed to list weekly report snapshots", error);
      }
    },
    async upsert(record: WeeklyReportSnapshotRecord): Promise<void> {
      try {
        await db.weeklyReportSnapshots.put(record);
      } catch (error) {
        throw new DatabaseError(
          `Failed to save report snapshot for week ${record.weekNumber}`,
          error,
        );
      }
    },
    async deleteByWeekNumber(weekNumber: number): Promise<void> {
      try {
        await db.weeklyReportSnapshots.where("weekNumber").equals(weekNumber).delete();
      } catch (error) {
        throw new DatabaseError(`Failed to delete report snapshot for week ${weekNumber}`, error);
      }
    },
  };
}
