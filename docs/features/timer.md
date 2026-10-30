# Timer Feature

## Routes and UI

- `/timer`: the full timer page, recent history and manual entry.
- Global header: a compact timer with quick access.
- Side panel: start, pause, resume, complete, stop, cancel, configure sound/notification and add a manual session.

## Implemented integrations

- Plan: blocks can start a `plan_block` session.
- Review Today: queue items can start a `review` session.
- Flashcards: a study session can start a `flashcard_session` session.
- Quizzes: a quiz session can start a `quiz_session` session.
- Playground: the editor can start a `playground_solution` session.
- Dashboard: shows the active session, today's time and the week's time.

## Shortcuts

- `T`: opens the timer panel.
- `Space`: pauses or resumes when there's an active timer.
- `Esc`: closes the panel.

Shortcuts are ignored while the focus is on an input, textarea, select or editable content.

## States

- Loading: the provider loads IndexedDB and the seeds.
- Ready without an active timer: the start form.
- Ready with an active timer: display, controls and history.
- Error: a toast and the provider's internal message.

## Decisions

- The visual clock updates every second, but IndexedDB is not written per tick.
- The official history comes only from `timerSessions`.
- The internal quiz/flashcard/playground time doesn't automatically feed the global metrics.
- Browser notifications require explicit permission.
