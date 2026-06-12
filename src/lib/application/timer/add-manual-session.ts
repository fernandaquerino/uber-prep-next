import type { UberPrepDatabase } from "@/lib/db/schema";
import type { TimerManualSessionInput, TimerSessionRecord } from "@/lib/domain/timer";
import { validateManualSessionInput } from "@/lib/domain/timer";
import { nowIso } from "./timer-helpers";

export async function addManualTimerSession(
  db: UberPrepDatabase,
  input: TimerManualSessionInput,
): Promise<TimerSessionRecord> {
  const now = nowIso();
  const errors = validateManualSessionInput(input, now);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const startedAt = input.startedAt ?? `${input.date}T12:00:00.000Z`;
  const endedAt = new Date(
    new Date(startedAt).getTime() + input.durationSeconds * 1000,
  ).toISOString();
  const record: TimerSessionRecord = {
    id: `timer-session:manual:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    sourceType: input.sourceType ?? "manual",
    sourceId: input.sourceId,
    category: input.category,
    title: input.title.trim(),
    mode: "stopwatch",
    status: "completed",
    actualDurationSeconds: input.durationSeconds,
    startedAt,
    endedAt,
    date: input.date,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.timerSessions.put(record);
  return record;
}
