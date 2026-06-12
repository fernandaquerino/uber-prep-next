import type { UberPrepDatabase } from "@/lib/db/schema";
import { getTimerDailySummary, getTimerWeeklySummary, type TimerData } from "@/lib/domain/timer";
import { ensureTimerSettings, getLocalDateString, getWeekRange } from "./timer-helpers";

export async function getTimerData(db: UberPrepDatabase): Promise<TimerData> {
  const today = getLocalDateString();
  const week = getWeekRange(today);
  const settings = await ensureTimerSettings(db);
  const [active, sessions] = await Promise.all([
    db.activeTimer.toCollection().first(),
    db.timerSessions.orderBy("startedAt").reverse().toArray(),
  ]);

  return {
    activeTimer: active ?? null,
    settings,
    todaySummary: getTimerDailySummary(sessions, today),
    weekSummary: getTimerWeeklySummary(sessions, week.start, week.end),
    recentSessions: sessions.slice(0, 12),
  };
}
