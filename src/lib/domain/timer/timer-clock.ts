import type { ActiveTimerRecord } from "./timer.types";

function diffSeconds(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / 1000));
}

export function getActiveTimerElapsedSeconds(timer: ActiveTimerRecord, nowIso: string): number {
  if (timer.status === "paused") {
    return Math.max(0, timer.accumulatedSeconds);
  }

  return Math.max(0, timer.accumulatedSeconds + diffSeconds(timer.lastResumedAt, nowIso));
}

export function getCountdownRemainingSeconds(
  timer: ActiveTimerRecord,
  nowIso: string,
): number | null {
  if (timer.mode !== "countdown" || !timer.targetDurationSeconds) return null;
  return Math.max(0, timer.targetDurationSeconds - getActiveTimerElapsedSeconds(timer, nowIso));
}

export function isCountdownComplete(timer: ActiveTimerRecord, nowIso: string): boolean {
  const remaining = getCountdownRemainingSeconds(timer, nowIso);
  return remaining !== null && remaining <= 0;
}

export function shouldRequireLongSessionDecision(
  timer: ActiveTimerRecord,
  nowIso: string,
  thresholdSeconds: number,
): boolean {
  if (timer.status !== "running") return false;
  return diffSeconds(timer.lastResumedAt, nowIso) > thresholdSeconds;
}
