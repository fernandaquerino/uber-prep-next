import { ACTIVE_TIMER_ID } from "@/lib/db/constants";
import type {
  ActiveTimerRecord,
  TimerCompleteInput,
  TimerSessionRecord,
  TimerStartInput,
} from "./timer.types";
import { assertValidTimerDuration } from "./timer-duration";
import { getActiveTimerElapsedSeconds } from "./timer-clock";
import { InvalidTimerTransitionError } from "./timer.errors";

type TimerTransitionTarget = "running" | "paused" | "completed" | "stopped_early" | "cancelled";

export function canTransitionTimerStatus(
  from: ActiveTimerRecord["status"],
  to: TimerTransitionTarget,
): boolean {
  if (from === "running") {
    return ["paused", "completed", "stopped_early", "cancelled"].includes(to);
  }
  if (from === "paused") {
    return ["running", "stopped_early", "cancelled"].includes(to);
  }
  return false;
}

export function createActiveTimerRecord(input: TimerStartInput, nowIso: string): ActiveTimerRecord {
  if (input.mode === "countdown") {
    assertValidTimerDuration(input.targetDurationSeconds ?? 0);
  }

  return {
    id: ACTIVE_TIMER_ID,
    mode: input.mode,
    status: "running",
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    category: input.category,
    title: input.title.trim() || "Sessão de foco",
    targetDurationSeconds: input.mode === "countdown" ? input.targetDurationSeconds : undefined,
    startedAt: nowIso,
    lastResumedAt: nowIso,
    accumulatedSeconds: 0,
    notes: input.notes,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function pauseActiveTimer(timer: ActiveTimerRecord, nowIso: string): ActiveTimerRecord {
  if (!canTransitionTimerStatus(timer.status, "paused")) {
    throw new InvalidTimerTransitionError(timer.status, "paused");
  }

  return {
    ...timer,
    status: "paused",
    accumulatedSeconds: getActiveTimerElapsedSeconds(timer, nowIso),
    pausedAt: nowIso,
    updatedAt: nowIso,
  };
}

export function resumeActiveTimer(timer: ActiveTimerRecord, nowIso: string): ActiveTimerRecord {
  if (!canTransitionTimerStatus(timer.status, "running")) {
    throw new InvalidTimerTransitionError(timer.status, "running");
  }

  return {
    ...timer,
    status: "running",
    lastResumedAt: nowIso,
    pausedAt: undefined,
    updatedAt: nowIso,
  };
}

export function buildTimerSessionFromActive(
  timer: ActiveTimerRecord,
  input: TimerCompleteInput,
): TimerSessionRecord {
  if (!canTransitionTimerStatus(timer.status, input.status)) {
    throw new InvalidTimerTransitionError(timer.status, input.status);
  }

  const actualDurationSeconds =
    input.actualDurationSeconds ?? getActiveTimerElapsedSeconds(timer, input.endedAt);

  return {
    id: `timer-session:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    sourceType: timer.sourceType,
    sourceId: timer.sourceId,
    category: timer.category,
    title: timer.title,
    mode: timer.mode,
    status: input.status,
    targetDurationSeconds: timer.targetDurationSeconds,
    actualDurationSeconds: Math.max(0, actualDurationSeconds),
    startedAt: timer.startedAt,
    endedAt: input.endedAt,
    date: input.endedAt.slice(0, 10),
    notes: input.notes ?? timer.notes,
    createdAt: input.endedAt,
    updatedAt: input.endedAt,
  };
}
