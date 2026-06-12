import type { UberPrepDatabase } from "@/lib/db/schema";
import { TimerAlreadyRunningError } from "@/lib/domain/timer";
import { createActiveTimerRecord, validateTimerStartInput } from "@/lib/domain/timer";
import type { TimerStartInput } from "@/lib/domain/timer";
import { nowIso } from "./timer-helpers";

export async function startTimer(
  db: UberPrepDatabase,
  input: TimerStartInput,
): Promise<ReturnType<typeof createActiveTimerRecord>> {
  const existing = await db.activeTimer.count();
  if (existing > 0) throw new TimerAlreadyRunningError();

  const errors = validateTimerStartInput(input);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const record = createActiveTimerRecord(input, nowIso());
  await db.activeTimer.put(record);
  return record;
}
