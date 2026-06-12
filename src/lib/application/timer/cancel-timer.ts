import type { UberPrepDatabase } from "@/lib/db/schema";
import { ACTIVE_TIMER_ID } from "@/lib/db/constants";
import { ActiveTimerNotFoundError } from "@/lib/domain/timer";

export async function cancelTimer(db: UberPrepDatabase): Promise<void> {
  const active = await db.activeTimer.get(ACTIVE_TIMER_ID);
  if (!active) throw new ActiveTimerNotFoundError();
  await db.activeTimer.delete(ACTIVE_TIMER_ID);
}
