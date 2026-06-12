import type { UberPrepDatabase } from "@/lib/db/schema";
import { ACTIVE_TIMER_ID } from "@/lib/db/constants";
import { ActiveTimerNotFoundError, buildTimerSessionFromActive } from "@/lib/domain/timer";
import type { TimerCompleteInput } from "@/lib/domain/timer";
import { nowIso } from "./timer-helpers";

export async function completeTimer(db: UberPrepDatabase, input: Partial<TimerCompleteInput> = {}) {
  const active = await db.activeTimer.get(ACTIVE_TIMER_ID);
  if (!active) throw new ActiveTimerNotFoundError();

  const endedAt = input.endedAt ?? nowIso();
  const session = buildTimerSessionFromActive(active, {
    status: input.status ?? "completed",
    endedAt,
    notes: input.notes,
    actualDurationSeconds: input.actualDurationSeconds,
  });

  await db.transaction("rw", db.activeTimer, db.timerSessions, async () => {
    await db.timerSessions.put(session);
    await db.activeTimer.delete(ACTIVE_TIMER_ID);
  });

  return session;
}
