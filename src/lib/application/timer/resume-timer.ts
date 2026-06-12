import type { UberPrepDatabase } from "@/lib/db/schema";
import { ACTIVE_TIMER_ID } from "@/lib/db/constants";
import { ActiveTimerNotFoundError, resumeActiveTimer } from "@/lib/domain/timer";
import { nowIso } from "./timer-helpers";

export async function resumeTimer(db: UberPrepDatabase) {
  const active = await db.activeTimer.get(ACTIVE_TIMER_ID);
  if (!active) throw new ActiveTimerNotFoundError();

  const next = resumeActiveTimer(active, nowIso());
  await db.activeTimer.put(next);
  return next;
}
