# Delivery 05 — Plan Page

## Goal

Build the complete, functional and persisted Plan Page (`/plano`), which consumes exclusively:

- the domain's effective schedule
- progress persisted in IndexedDB
- the application layer's use cases
- orchestration hooks

The page doesn't derive calendar, progress, lateness or capacity logic directly.

---

## Architecture

```
src/
  lib/
    data/
      study-plan.ts          # Converts WEEKS → StudyPlan (adapter)
    application/
      progress/
        change-start-date.ts # Use case: change the start date
        index.ts             # Re-exports change-start-date

  hooks/
    use-plan-page.ts         # Loads and aggregates the page's data
    use-plan-actions.ts      # Exposes actions with an onSuccess/onError callback

  components/
    features/
      plan/
        plan-screen.tsx            # Orchestrator (Client Component)
        plan-header.tsx            # Header with the start date
        plan-summary.tsx           # Overall progress + metrics
        plan-current-item.tsx      # Current block + lateness alerts
        plan-week-navigation.tsx   # Navigation between weeks
        plan-week.tsx              # Selected week with days
        plan-day-card.tsx          # Expandable day card
        plan-block-card.tsx        # Block card with quick actions
        plan-block-details.tsx     # Details dialog + forms
        plan-block-form.tsx        # Completion form
        skip-block-dialog.tsx      # Skip confirmation dialog
        reschedule-dialog.tsx      # Reschedule dialog
        missed-day-dialog.tsx      # Missed-day dialog (4 strategies)
        change-start-date-dialog.tsx # Change-start-date dialog
        plan-utils.ts              # Formatting utilities (no business rules)
        __tests__/
          plan-utils.test.ts

  app/
    (app)/
      plano/
        page.tsx    # Server Component (metadata + PlanScreen)
        loading.tsx # Loading skeleton
        error.tsx   # Error boundary
```

---

## Data flow

```
IndexedDB (settings, planProgress, progressEvents, scheduleOverrides)
  ↓
use-plan-page.ts
  buildStudySchedule(STUDY_PLAN, config)   → ScheduledStudyDay[]
  getEffectiveSchedule(db, baseSchedule)   → EffectiveScheduledDay[]
  groupScheduleByCalendarWeek(effective)   → ScheduledWeek[]
  getCurrentStudyState(effective)          → CurrentStudyState
  getPlanCompletionSummary(effective)      → PlanCompletionSummary
  ↓
PlanScreen (state: loading | error | no_start_date | ready)
  ↓
PlanHeader / PlanSummary / PlanCurrentItem / PlanWeekNavigation / PlanWeek
  → PlanDayCard → PlanBlockCard → dialogs
```

---

## Plan adapter (`study-plan.ts`)

Converts `WEEKS` (legacy format with breaks) to the domain's `StudyPlan`:

- Filters out blocks with `category === null` or `type === "pausa"`
- Generates stable IDs: `block-{dayNumber}-{idx}` and `day-{dayNumber}`
- 36 days with sequences 1–36 without duplicates

---

## New use case: `changeStartDate`

Location: `src/lib/application/progress/change-start-date.ts`

Options:

- `restart`: erases all progress, recreates from scratch on the new date
- `recalculate_maintaining`: moves `pending` blocks to new dates, preserves `completed`/`stuck`/`in_progress`/`skipped`

Always uses a Dexie transaction for atomicity.

---

## Components and states

### `PlanScreen`

The page's global state:

- `loading` → `PlanSkeleton` with skeletons
- `error` → `EmptyState` with a "Try again" button
- `no_start_date` → `EmptyState` with a button to configure the date
- `ready` → the full interface

### `PlanDayCard`

- Expanded by default only on today's day
- Shows badges: Today, Past, Completed, Overdue, Over capacity
- A rest day shows a `MoonIcon` and explanatory text, with no actions
- Past days with pending items show a "I didn't study this day" button

### `PlanBlockCard`

Actions per status:

- `pending` → Start, Complete, Stuck, Reschedule, Skip
- `in_progress` → Complete, Stuck, Pause, Reschedule, Skip
- `stuck` → Complete anyway, Resume, Reschedule, Skip
- `completed` → Undo (via `returnToPending`)
- `skipped` → Restore

### `PlanBlockDetails`

A dialog with three views:

- `details` → full information + actions
- `complete` → `PlanBlockForm` (minutes, difficulty, confidence, notes, pattern)
- `stuck` → a simplified form

---

## Completion form

Fields:

- Real minutes (number, ≥ 0, optional)
- Difficulty 1–5 with descriptive labels (accessible buttons with `aria-pressed`)
- Confidence 1–5 with descriptive labels
- Pattern used (free text)
- Notes (textarea)

Validation via controlled state — no react-hook-form (not installed).

---

## Missed-day handling

`MissedDayDialog` offers 4 strategies:

1. `shift_pending` — moves pending items forward, preserving rest
2. `keep_overdue` — keeps the dates, appears as overdue
3. `skip_items` — skips pending content
4. `reschedule_items` — reschedule individually (delegated to the user)

Each strategy calls `handleMissedStudyDay` from the existing use case.

---

## Rescheduling

`RescheduleDialog`:

- A visual alert for rest days (blocks confirmation)
- A visual alert for over capacity (allows confirming)
- Capacity computed locally from the `baseSchedule` (without re-deriving the domain rule)

---

## Changing the start date

`ChangeStartDateDialog`:

- No progress → applies `restart` (simplified behavior)
- With progress → a choice between `recalculate_maintaining` and `restart`
- `restart` shows a reinforced confirmation warning

---

## Undo

- Toast actions with an "Undo" button planned but not wired in this version
- `undoProgressAction` available via `usePlanActions`

---

## Accessibility

- All buttons have a descriptive `aria-label`
- Ratings use `aria-pressed` (not just color)
- Rest days don't expose invalid actions
- Dialogs use `<DialogTitle>` and `<DialogDescription>`
- `role="alert"` status on error messages
- `role="radiogroup"` and `role="radio"` on strategy selections

---

## Responsiveness

- 375px: stacked cards, compact navigation, no horizontal overflow
- 768px: a 2-column layout on the metrics
- 1024px+: width usage

---

## Tests

### Unit

- `plan-utils.test.ts`: formatting of dates, minutes, weekdays, status labels
- `study-plan.test.ts`: STUDY_PLAN structure + the regression scenario with 2026-06-11

### Integration

- `plan-progress.test.ts`: the complete flow (initialize → start → complete → skip → restore → missed day → reschedule → undo)
- Uses `fake-indexeddb` for isolation

### E2E (Playwright)

- `plan.spec.ts`: 6 scenario groups covering navigation, mobile, dialogs, accessibility

---

## Mandatory regression scenario

```
startDate = 2026-06-11 (Thursday)

Day 1 → Thursday, 2026-06-11 — 480 min
Day 2 → Friday, 2026-06-12 — 480 min
Day 3 → Saturday, 2026-06-13 — 240 min
Sunday, 2026-06-14 → rest, 0 min, no items
Day 4 → Monday, 2026-06-15 — 480 min
Day 5 → Tuesday, 2026-06-16 — 480 min
```

Verified in `study-plan.test.ts` (buildStudySchedule) and `plan-progress.test.ts`.

---

## Limitations

- Undo via toast is not fully wired (infrastructure ready, partial UI)
- Filters by status/category/search are modeled but not rendered as UI
- The `reschedule_items` option on the missed day opens the dialog but doesn't guide each block individually
- A functional timer is not implemented (planned for the next delivery)
- Dashboard, Review Today, spaced repetition were not anticipated

---

## Preparation for Delivery 06

- `usePlanActions` and `usePlanPage` already expose all the actions needed for the Dashboard
- `PlanCompletionSummary` and `CurrentStudyState` ready for reuse
- `STUDY_PLAN` and `buildStudySchedule` already stabilized
- There's no circular dependency between the domains
