import type { UberPrepDatabase } from "@/lib/db/schema";

export async function deleteTimerSession(db: UberPrepDatabase, id: string): Promise<void> {
  await db.timerSessions.delete(id);
}
