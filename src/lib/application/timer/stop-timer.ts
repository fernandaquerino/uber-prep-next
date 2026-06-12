import type { UberPrepDatabase } from "@/lib/db/schema";
import { completeTimer } from "./complete-timer";

export async function stopTimer(
  db: UberPrepDatabase,
  input: { notes?: string; actualDurationSeconds?: number } = {},
) {
  return completeTimer(db, { ...input, status: "stopped_early" });
}
