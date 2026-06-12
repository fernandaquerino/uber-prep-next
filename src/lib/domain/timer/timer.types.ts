import type {
  ActiveTimerRecord,
  TimerMode,
  TimerSessionRecord,
  TimerSessionStatus,
  TimerSettingsRecord,
  TimerSourceType,
} from "@/types/database";

export type {
  ActiveTimerRecord,
  ActiveTimerStatus,
  TimerMode,
  TimerSessionRecord,
  TimerSessionStatus,
  TimerSettingsRecord,
  TimerSourceType,
} from "@/types/database";

export const TIMER_PRESETS_SECONDS = [25 * 60, 45 * 60, 60 * 60, 90 * 60] as const;

export const TIMER_SOURCE_LABELS: Record<TimerSourceType, string> = {
  plan_block: "Plano",
  review: "Revisão",
  flashcard_session: "Flashcards",
  quiz_session: "Quiz",
  playground_solution: "Playground",
  mock: "Mock",
  note: "Notas",
  resource: "Recursos",
  technical_english: "Inglês Técnico",
  manual: "Manual",
  general: "Geral",
};

export type TimerStartInput = {
  mode: TimerMode;
  sourceType: TimerSourceType;
  sourceId?: string;
  category: string;
  title: string;
  targetDurationSeconds?: number;
  notes?: string;
};

export type TimerCompleteInput = {
  status: Exclude<TimerSessionStatus, "cancelled">;
  endedAt: string;
  notes?: string;
  actualDurationSeconds?: number;
};

export type TimerManualSessionInput = {
  date: string;
  startedAt?: string;
  durationSeconds: number;
  category: string;
  title: string;
  sourceType?: TimerSourceType;
  sourceId?: string;
  notes?: string;
};

export type TimerSummary = {
  totalSeconds: number;
  sessionCount: number;
  averageSessionSeconds: number;
};

export type TimerData = {
  activeTimer: ActiveTimerRecord | null;
  settings: TimerSettingsRecord;
  todaySummary: TimerSummary;
  weekSummary: TimerSummary;
  recentSessions: TimerSessionRecord[];
};
