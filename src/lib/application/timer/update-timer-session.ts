import type { UberPrepDatabase } from "@/lib/db/schema";
import type { TimerSessionRecord } from "@/lib/domain/timer";
import { assertValidTimerDuration } from "@/lib/domain/timer";
import { nowIso } from "./timer-helpers";

export type UpdateTimerSessionInput = {
  id: string;
  title?: string;
  category?: string;
  actualDurationSeconds?: number;
  sourceType?: TimerSessionRecord["sourceType"];
  sourceId?: string;
  notes?: string;
  date?: string;
};

export async function updateTimerSession(
  db: UberPrepDatabase,
  input: UpdateTimerSessionInput,
): Promise<TimerSessionRecord> {
  const existing = await db.timerSessions.get(input.id);
  if (!existing) throw new Error(`Timer session not found: ${input.id}`);

  if (input.actualDurationSeconds !== undefined) {
    assertValidTimerDuration(input.actualDurationSeconds);
  }

  const next: TimerSessionRecord = {
    ...existing,
    title: input.title?.trim() || existing.title,
    category: input.category ?? existing.category,
    actualDurationSeconds: input.actualDurationSeconds ?? existing.actualDurationSeconds,
    sourceType: input.sourceType ?? existing.sourceType,
    sourceId: input.sourceId ?? existing.sourceId,
    notes: input.notes ?? existing.notes,
    date: input.date ?? existing.date,
    updatedAt: nowIso(),
  };

  await db.timerSessions.put(next);
  return next;
}
