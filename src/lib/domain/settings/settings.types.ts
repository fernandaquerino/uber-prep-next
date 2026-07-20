import type {
  AppTheme,
  AppDensity,
  DateFormatPreference,
  FontSizePreference,
  LostDayPolicy,
  NotesDefaultView,
  ReviewAutoCreateSettings,
  SettingsRecord,
  SettingsWeekdayAvailability,
} from "@/types/database";

export type {
  AppTheme,
  AppDensity,
  DateFormatPreference,
  FontSizePreference,
  LostDayPolicy,
  NotesDefaultView,
  ReviewAutoCreateSettings,
  SettingsRecord,
  SettingsWeekdayAvailability,
};

// Sub-shapes used by update forms
export type GeneralSettingsInput = {
  displayName?: string;
  targetInterviewDate?: string;
  mainFocus?: string;
  timezone: string;
  dateFormat: DateFormatPreference;
};

export type PlanSettingsInput = {
  startDate: string | null;
  planDurationWeeks: number;
  lostDayPolicy: LostDayPolicy;
};

export type AgendaSettingsInput = {
  weekdayAvailability: SettingsWeekdayAvailability;
};

export type AppearanceSettingsInput = {
  theme: AppTheme;
  density: AppDensity;
  reduceMotion: boolean;
  notesDefaultView: NotesDefaultView;
};

export type AccessibilitySettingsInput = {
  increasedContrast: boolean;
  fontSize: FontSizePreference;
  showFocusOutline: boolean;
  disableSounds: boolean;
};

export type ReviewSettingsInput = {
  reviewIntervals: number[];
  reviewAutoCreate: ReviewAutoCreateSettings;
};

export type TimerSettingsInput = {
  defaultMode: "countdown" | "stopwatch";
  defaultPresetSeconds: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  confirmBeforeCancel: boolean;
  showCompactTimer: boolean;
  longSessionThresholdSeconds: number;
};

// Partial settings update — any subset of fields
export type UpdateSettingsInput = Partial<
  GeneralSettingsInput &
    PlanSettingsInput &
    AgendaSettingsInput &
    AppearanceSettingsInput &
    AccessibilitySettingsInput &
    ReviewSettingsInput
>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** Default study start time for enabled weekdays (evening study). */
export const DEFAULT_START_TIME = "19:00";

export const DEFAULT_WEEKDAY_AVAILABILITY: SettingsWeekdayAvailability = {
  monday: { enabled: true, availableMinutes: 120, startTime: DEFAULT_START_TIME },
  tuesday: { enabled: true, availableMinutes: 120, startTime: DEFAULT_START_TIME },
  wednesday: { enabled: true, availableMinutes: 120, startTime: DEFAULT_START_TIME },
  thursday: { enabled: true, availableMinutes: 120, startTime: DEFAULT_START_TIME },
  friday: { enabled: true, availableMinutes: 120, startTime: DEFAULT_START_TIME },
  saturday: { enabled: false, availableMinutes: 0 },
  sunday: { enabled: false, availableMinutes: 0 },
};

export const DEFAULT_REVIEW_AUTO_CREATE: ReviewAutoCreateSettings = {
  onBlockComplete: true,
  onQuizError: true,
  onFlashcard: false,
  onMockGap: true,
  includeOnRestDays: false,
};

export const DEFAULT_REVIEW_INTERVALS: number[] = [1, 3, 7, 14, 30];

export const SETTINGS_DEFAULTS: Omit<
  SettingsRecord,
  "id" | "startDate" | "createdAt" | "updatedAt"
> = {
  dateFormat: "dd/MM/yyyy",
  planDurationWeeks: 6,
  lostDayPolicy: "shift",
  timezone: "America/Sao_Paulo",
  weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
  theme: "system",
  density: "default",
  reduceMotion: false,
  notesDefaultView: "split",
  increasedContrast: false,
  fontSize: "md",
  showFocusOutline: false,
  disableSounds: false,
  reviewIntervals: DEFAULT_REVIEW_INTERVALS,
  reviewAutoCreate: DEFAULT_REVIEW_AUTO_CREATE,
};

// ─── Labels ───────────────────────────────────────────────────────────────────

export const LOST_DAY_POLICY_LABELS: Record<LostDayPolicy, string> = {
  shift: "Mover plano para frente",
  reschedule: "Reagendar conteúdo",
  skip: "Pular conteúdo",
  keep: "Manter como atrasado",
};

export const LOST_DAY_POLICY_DESCRIPTIONS: Record<LostDayPolicy, string> = {
  shift: "O conteúdo pendente deslocará os dias futuros",
  reschedule: "Escolha outra data para o conteúdo",
  skip: "Marca o conteúdo como pulado (exige confirmação)",
  keep: "Conteúdo permanece pendente junto com a agenda atual",
};

export const DENSITY_LABELS: Record<AppDensity, string> = {
  compact: "Compacta",
  default: "Padrão",
  comfortable: "Confortável",
};

export const FONT_SIZE_LABELS: Record<FontSizePreference, string> = {
  sm: "Pequena",
  md: "Média",
  lg: "Grande",
};

export const DATE_FORMAT_LABELS: Record<DateFormatPreference, string> = {
  "dd/MM/yyyy": "DD/MM/AAAA (Brasil)",
  "MM/dd/yyyy": "MM/DD/AAAA (EUA)",
  "yyyy-MM-dd": "AAAA-MM-DD (ISO)",
};

export const NOTES_VIEW_LABELS: Record<NotesDefaultView, string> = {
  edit: "Editar",
  split: "Dividida",
  preview: "Visualizar",
};

export const WEEKDAY_LABELS: Record<keyof SettingsWeekdayAvailability, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const WEEKDAY_SHORT_LABELS: Record<keyof SettingsWeekdayAvailability, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Apply defaults to a partially-filled or legacy settings record */
export function withSettingsDefaults(
  partial: Partial<SettingsRecord> & { id: "app-settings" },
): SettingsRecord {
  const weekdayAvailability = Object.fromEntries(
    Object.entries(DEFAULT_WEEKDAY_AVAILABILITY).map(([weekday, defaults]) => {
      const existing = partial.weekdayAvailability?.[weekday as keyof SettingsWeekdayAvailability];
      return [weekday, { ...defaults, ...existing }];
    }),
  ) as SettingsWeekdayAvailability;

  return {
    ...SETTINGS_DEFAULTS,
    startDate: null,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
    ...partial,
    weekdayAvailability,
  } as SettingsRecord;
}

/** Get total available minutes per week */
export function getTotalWeeklyMinutes(availability: SettingsWeekdayAvailability): number {
  return Object.values(availability).reduce(
    (sum, day) => sum + (day.enabled ? day.availableMinutes : 0),
    0,
  );
}

/** Get number of enabled study days per week */
export function getEnabledDaysCount(availability: SettingsWeekdayAvailability): number {
  return Object.values(availability).filter((d) => d.enabled).length;
}

/** Format minutes as human-readable hours/minutes */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
