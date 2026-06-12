import type { UberPrepDatabase } from "@/lib/db/schema";
import type { TimerSettingsRecord } from "@/types/database";
import { ensureTimerSettings, nowIso } from "./timer-helpers";

export async function updateTimerSettings(
  db: UberPrepDatabase,
  input: Partial<Omit<TimerSettingsRecord, "id" | "createdAt" | "updatedAt">>,
): Promise<TimerSettingsRecord> {
  const existing = await ensureTimerSettings(db);
  const next: TimerSettingsRecord = {
    ...existing,
    ...input,
    updatedAt: nowIso(),
  };
  await db.timerSettings.put(next);
  return next;
}
