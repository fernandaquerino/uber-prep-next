# Delivery 10 — Timer

## Summary

Implements a global local-first timer with countdown, stopwatch, a restorable active session, an official study history, manual entry, a dedicated page and integrations with the existing flows.

## Adopted architecture

- `src/lib/domain/timer`: pure functions for duration, clock, transitions and aggregations.
- `src/lib/application/timer`: transactional use cases with IndexedDB.
- `src/components/features/timer`: a global provider, panel, compact timer, form and history.
- `src/hooks/use-timer.ts`, `use-timer-actions.ts`, `use-timer-history.ts`: client-side access.

## Persistence

The tables were added:

- `activeTimer`
- `timerSettings`

The `timerSessions` table was migrated to the new format with origin, mode, status, target and real duration.

## Features

- One active timer at a time.
- Countdown and stopwatch.
- Presets of 25, 45, 60 and 90 minutes.
- Custom duration.
- Pause, resume, complete, stop early and cancel.
- The active session restored after a reload.
- A policy for a restored long session: pauses and opens the panel for confirmation.
- A history of official sessions.
- Manual time entry.
- Simple editing and deletion of a historical session.
- Sound and notification on countdown completion.
- Integration with Plan, Review Today, Flashcards, Quizzes, Playground and Dashboard.
- Backup, import and migration of the legacy timer.

## Current limitations

- The full timer settings don't appear in `/configuracoes` yet.
- Mocks don't have a real flow to start an associated timer yet.
- Advanced reports and readiness don't consume the timer yet; that's for future deliveries.
- Notifications depend on the browser's permission.
