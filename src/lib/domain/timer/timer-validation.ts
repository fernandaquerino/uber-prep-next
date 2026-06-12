import type { TimerManualSessionInput, TimerStartInput } from "./timer.types";
import { assertValidTimerDuration } from "./timer-duration";

export function validateTimerStartInput(input: TimerStartInput): string[] {
  const errors: string[] = [];

  if (!input.title.trim()) errors.push("Informe um título para a sessão.");
  if (!input.category.trim()) errors.push("Informe uma categoria.");
  if (input.mode === "countdown") {
    try {
      assertValidTimerDuration(input.targetDurationSeconds ?? 0);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Duração inválida.");
    }
  }

  return errors;
}

export function validateManualSessionInput(
  input: TimerManualSessionInput,
  nowIso: string,
): string[] {
  const errors: string[] = [];

  if (!input.title.trim()) errors.push("Informe um título.");
  if (!input.category.trim()) errors.push("Informe uma categoria.");

  try {
    assertValidTimerDuration(input.durationSeconds);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Duração inválida.");
  }

  if (input.startedAt && input.startedAt > nowIso) {
    errors.push("A sessão manual não pode começar no futuro.");
  }
  if (input.date > nowIso.slice(0, 10)) {
    errors.push("A sessão manual não pode ser registrada no futuro.");
  }

  return errors;
}
