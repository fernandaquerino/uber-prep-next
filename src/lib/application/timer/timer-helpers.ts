import { TIMER_SETTINGS_ID } from "@/lib/db/constants";
import type { UberPrepDatabase } from "@/lib/db/schema";
import type { TimerSettingsRecord } from "@/types/database";

export function nowIso(): string {
  return new Date().toISOString();
}

export function getLocalDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function getWeekRange(dateString: string): { start: string; end: string } {
  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: getLocalDateString(monday),
    end: getLocalDateString(sunday),
  };
}

export function createDefaultTimerSettings(timestamp: string): TimerSettingsRecord {
  return {
    id: TIMER_SETTINGS_ID,
    defaultMode: "countdown",
    defaultPresetSeconds: 45 * 60,
    soundEnabled: true,
    notificationsEnabled: false,
    confirmBeforeCancel: true,
    showCompactTimer: true,
    longSessionThresholdSeconds: 4 * 60 * 60,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function ensureTimerSettings(db: UberPrepDatabase): Promise<TimerSettingsRecord> {
  const existing = await db.timerSettings.get(TIMER_SETTINGS_ID);
  if (existing) return existing;

  const settings = createDefaultTimerSettings(nowIso());
  await db.timerSettings.put(settings);
  return settings;
}
