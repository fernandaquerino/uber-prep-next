# Timer Session Format

## Active timer

```ts
type ActiveTimerRecord = {
  id: "active-timer";
  mode: "countdown" | "stopwatch";
  status: "running" | "paused";
  sourceType:
    | "plan_block"
    | "review"
    | "flashcard_session"
    | "quiz_session"
    | "playground_solution"
    | "mock"
    | "manual"
    | "general";
  sourceId?: string;
  category: string;
  title: string;
  targetDurationSeconds?: number;
  startedAt: string;
  lastResumedAt: string;
  pausedAt?: string;
  accumulatedSeconds: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Historical session

```ts
type TimerSessionRecord = {
  id: string;
  sourceType: ActiveTimerRecord["sourceType"];
  sourceId?: string;
  category: string;
  title: string;
  mode: "countdown" | "stopwatch";
  status: "completed" | "stopped_early" | "cancelled";
  targetDurationSeconds?: number;
  actualDurationSeconds: number;
  startedAt: string;
  endedAt: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Settings

```ts
type TimerSettingsRecord = {
  id: "timer-settings";
  defaultMode: "countdown" | "stopwatch";
  defaultPresetSeconds: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  confirmBeforeCancel: boolean;
  showCompactTimer: boolean;
  longSessionThresholdSeconds: number;
  createdAt: string;
  updatedAt: string;
};
```

## Backup

Backups exportam:

- `activeTimer`
- `timerSessions`
- `timerSettings`

Importação em `replace` limpa as três tabelas. Importação em `merge` preserva registros existentes por ID.
