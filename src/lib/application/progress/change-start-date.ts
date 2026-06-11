import type { UberPrepDatabase } from "@/lib/db/schema";
import { SETTINGS_ID } from "@/lib/db/constants";
import { initializePlanProgress as initializePlanProgressDomain } from "@/lib/domain/progress";
import type { CalendarDate, ScheduledStudyDay } from "@/lib/domain/schedule";
import { toDomainProgress, toProgressEventRecord, toProgressRecord } from "./mappers";

export type ChangeStartDateOption = "recalculate_maintaining" | "restart";

export async function changeStartDate(input: {
  db: UberPrepDatabase;
  newStartDate: CalendarDate;
  newBaseSchedule: ScheduledStudyDay[];
  option: ChangeStartDateOption;
  now: string;
}): Promise<void> {
  const { db, newStartDate, newBaseSchedule, option, now } = input;

  if (option === "restart") {
    await db.transaction(
      "rw",
      [db.settings, db.planProgress, db.progressEvents, db.scheduleOverrides],
      async () => {
        await db.planProgress.clear();
        await db.progressEvents.clear();
        await db.scheduleOverrides.clear();

        const settings = await db.settings.get(SETTINGS_ID);
        if (settings) {
          await db.settings.put({ ...settings, startDate: newStartDate, updatedAt: now });
        }

        const result = initializePlanProgressDomain(newBaseSchedule, [], now);
        await db.planProgress.bulkAdd(result.progress.map(toProgressRecord));
        await db.progressEvents.bulkAdd(result.events.map(toProgressEventRecord));
      },
    );
    return;
  }

  // recalculate_maintaining: move pending to new dates, keep completed/stuck/in_progress
  await db.transaction(
    "rw",
    [db.settings, db.planProgress, db.progressEvents, db.scheduleOverrides],
    async () => {
      const settings = await db.settings.get(SETTINGS_ID);
      if (settings) {
        await db.settings.put({ ...settings, startDate: newStartDate, updatedAt: now });
      }

      const existingProgress = (await db.planProgress.toArray()).map(toDomainProgress);

      const newDateByBlockId = new Map<string, CalendarDate>();
      for (const day of newBaseSchedule) {
        for (const item of day.items) {
          newDateByBlockId.set(item.blockId, day.date);
        }
      }

      const updatedProgress = existingProgress.map((record) => {
        if (record.status === "pending") {
          const newDate = newDateByBlockId.get(record.blockId);
          if (newDate) {
            return {
              ...record,
              scheduledDate: newDate,
              originalScheduledDate: newDate,
              updatedAt: now,
            };
          }
        }
        return record;
      });

      await db.planProgress.bulkPut(updatedProgress.map(toProgressRecord));
      await db.scheduleOverrides.clear();

      // initialize missing blocks (new schedule may have shifted sequencing)
      const result = initializePlanProgressDomain(newBaseSchedule, updatedProgress, now);
      const newRecords = result.progress.filter(
        (r) => !existingProgress.some((e) => e.blockId === r.blockId),
      );
      if (newRecords.length > 0) {
        await db.planProgress.bulkAdd(newRecords.map(toProgressRecord));
        if (result.events.length > 0) {
          await db.progressEvents.bulkAdd(result.events.map(toProgressEventRecord));
        }
      }
    },
  );
}
