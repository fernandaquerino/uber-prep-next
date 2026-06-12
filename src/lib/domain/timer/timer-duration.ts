import { InvalidTimerDurationError } from "./timer.errors";

export const MIN_TIMER_DURATION_SECONDS = 60;
export const MAX_TIMER_DURATION_SECONDS = 12 * 60 * 60;

export function assertValidTimerDuration(seconds: number): void {
  if (!Number.isFinite(seconds)) {
    throw new InvalidTimerDurationError("A duração precisa ser um número válido.");
  }
  if (seconds < MIN_TIMER_DURATION_SECONDS) {
    throw new InvalidTimerDurationError("A duração mínima é de 1 minuto.");
  }
  if (seconds > MAX_TIMER_DURATION_SECONDS) {
    throw new InvalidTimerDurationError("A duração máxima é de 12 horas.");
  }
}

export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

export function formatTimerDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
