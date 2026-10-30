# Timer

## Goal

The timer records real study time as the app's official data. The time from quizzes, flashcards and the internal playground still exists for each feature, but it only enters the general metrics when the person starts a focus session.

## Models

### ActiveTimerRecord

Represents the single active or paused session.

- `id`: always `active-timer`
- `mode`: `countdown` or `stopwatch`
- `status`: `running` or `paused`
- `sourceType`: the session's origin
- `sourceId`: an optional link to a block, review, quiz, flashcards, playground or mock
- `category`: the category used in groupings
- `title`: the title shown in the UI
- `targetDurationSeconds`: the target duration for countdown
- `startedAt`: the session's real start
- `lastResumedAt`: the last time it resumed running
- `pausedAt`: the last pause time
- `accumulatedSeconds`: time accumulated before the current run

### TimerSessionRecord

Represents the official history.

- Only created on completion or early stop.
- Canceled sessions don't enter the totals.
- `actualDurationSeconds` is computed from timestamps, not from ticks saved every second.

## Rules

- There's at most one active timer.
- The active timer doesn't automatically count as history.
- Pausing accumulates the time elapsed since `lastResumedAt`.
- Resuming preserves `accumulatedSeconds` and updates `lastResumedAt`.
- Completing creates a `completed` session and removes the active one.
- Stopping early creates a `stopped_early` session and removes the active one.
- Canceling removes the active one without creating history.
- Restored sessions with elapsed time greater than `longSessionThresholdSeconds` are paused for confirmation.

## Presets

Official presets:

- 25 minutes
- 45 minutes
- 60 minutes
- 90 minutes

Custom durations are validated between 1 minute and 12 hours.
