import type { TimerSessionRecord, TimerSourceType, TimerSummary } from "./timer.types";

function countable(sessions: TimerSessionRecord[]): TimerSessionRecord[] {
  return sessions.filter((session) => session.status !== "cancelled");
}

export function getTimerSessionsForDate(
  sessions: TimerSessionRecord[],
  date: string,
): TimerSessionRecord[] {
  return sessions.filter((session) => session.date === date);
}

export function getTimerSessionsForRange(
  sessions: TimerSessionRecord[],
  startDate: string,
  endDate: string,
): TimerSessionRecord[] {
  return sessions.filter((session) => startDate <= session.date && session.date <= endDate);
}

export function getTotalStudySeconds(sessions: TimerSessionRecord[]): number {
  return countable(sessions).reduce((sum, session) => sum + session.actualDurationSeconds, 0);
}

export function getStudySecondsByCategory(sessions: TimerSessionRecord[]): Record<string, number> {
  return countable(sessions).reduce<Record<string, number>>((acc, session) => {
    acc[session.category] = (acc[session.category] ?? 0) + session.actualDurationSeconds;
    return acc;
  }, {});
}

export function getStudySecondsBySource(
  sessions: TimerSessionRecord[],
): Record<TimerSourceType, number> {
  return countable(sessions).reduce<Record<TimerSourceType, number>>(
    (acc, session) => {
      acc[session.sourceType] += session.actualDurationSeconds;
      return acc;
    },
    {
      plan_block: 0,
      review: 0,
      flashcard_session: 0,
      quiz_session: 0,
      playground_solution: 0,
      mock: 0,
      note: 0,
      resource: 0,
      technical_english: 0,
      manual: 0,
      general: 0,
    },
  );
}

export function getAverageSessionSeconds(sessions: TimerSessionRecord[]): number {
  const valid = countable(sessions);
  if (valid.length === 0) return 0;
  return Math.round(getTotalStudySeconds(valid) / valid.length);
}

export function getTimerSummary(sessions: TimerSessionRecord[]): TimerSummary {
  const valid = countable(sessions);
  return {
    totalSeconds: getTotalStudySeconds(valid),
    sessionCount: valid.length,
    averageSessionSeconds: getAverageSessionSeconds(valid),
  };
}

export function getTimerDailySummary(sessions: TimerSessionRecord[], date: string): TimerSummary {
  return getTimerSummary(getTimerSessionsForDate(sessions, date));
}

export function getTimerWeeklySummary(
  sessions: TimerSessionRecord[],
  weekStart: string,
  weekEnd: string,
): TimerSummary {
  return getTimerSummary(getTimerSessionsForRange(sessions, weekStart, weekEnd));
}
