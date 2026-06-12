import type { UberPrepDatabase } from "@/lib/db/schema";
import type {
  TimerMode,
  TimerSessionRecord,
  TimerSessionStatus,
  TimerSourceType,
} from "@/types/database";

export type TimerHistoryFilters = {
  startDate?: string;
  endDate?: string;
  category?: string;
  sourceType?: TimerSourceType;
  status?: TimerSessionStatus;
  mode?: TimerMode;
};

export async function getTimerHistory(
  db: UberPrepDatabase,
  filters: TimerHistoryFilters = {},
): Promise<TimerSessionRecord[]> {
  let sessions = await db.timerSessions.orderBy("startedAt").reverse().toArray();

  if (filters.startDate)
    sessions = sessions.filter((session) => session.date >= filters.startDate!);
  if (filters.endDate) sessions = sessions.filter((session) => session.date <= filters.endDate!);
  if (filters.category)
    sessions = sessions.filter((session) => session.category === filters.category);
  if (filters.sourceType)
    sessions = sessions.filter((session) => session.sourceType === filters.sourceType);
  if (filters.status) sessions = sessions.filter((session) => session.status === filters.status);
  if (filters.mode) sessions = sessions.filter((session) => session.mode === filters.mode);

  return sessions;
}
