# Delivery 06 — Dashboard

## Goal

Implement the functional Dashboard, consistent with the Plan Page, action-oriented and without fake metrics.

## Principles

- Uses the **same selectors** as the Plan page (`getCurrentStudyState`, `getPlanCompletionSummary`, `getOverduePlanItems`)
- Uses the **same `getEffectiveSchedule`** from the application layer
- If the Plan says the current item is X, the Dashboard also shows X
- No readiness without enough data
- No timer, flashcard or quiz metrics (modules not yet implemented)
- Recommendations are **deterministic**: based on real counts

## Architecture

### Layers

```
DB (IndexedDB)
  ↓
getEffectiveSchedule() — application/progress
  ↓
progress-selectors.ts — domain/progress (pure, testable)
  ↓
getDashboardData() — application/dashboard (aggregates)
  ↓
getDashboardRecommendations() — application/dashboard (rules)
  ↓
useDashboard() — hook (loading/ready/error state)
  ↓
DashboardScreen → components
```

### Content hierarchy

1. **Current study item** (`DashboardCurrentStudy`) — pending or in progress
2. **Recommendations** (`DashboardRecommendations`) — deterministic and prioritized
3. **Metrics in a grid** — Today | Plan progress | Streak
4. **Overdue** (`DashboardOverdue`) — only if they exist
5. **Upcoming** (`DashboardUpcoming`) — the next 3 blocks
6. **Activity calendar** (`DashboardActivityCalendar`) — a heatmap of completed blocks

## Explicit definitions

### Streak

Consecutive study days with at least 1 completed block, counting from today back into the past. **Rest days don't break the streak** (they're transparent). Future days are ignored.

```ts
function computeStreak(activityDays: ActivityDay[], today: CalendarDate): DashboardStreak;
```

### Activity calendar

Metric: **completed blocks per day** (not hours, not estimated sessions).

Intensity:

- 0 blocks → light gray
- 1 block → green 200
- 2 blocks → green 400
- 3+ blocks → green 600

Rest days appear in a distinct neutral color.

### Recommendations

| ID                     | Priority | Condition                                                      |
| ---------------------- | -------- | -------------------------------------------------------------- |
| `overdue_items`        | high     | `overdueItems.length > 0`                                      |
| `stuck_items`          | high     | `stuck > 0`                                                    |
| `continue_in_progress` | medium   | `inProgress > 0`                                               |
| `start_next`           | medium   | `inProgress === 0 && currentItem && overdueItems.length === 0` |
| `on_track`             | low      | no overdue, no stuck, with pending blocks                      |
| `plan_complete`        | low      | `isPlanCompleted`                                              |

Ordering: high → medium → low.

## Screen states

| State           | When                                |
| --------------- | ----------------------------------- |
| `loading`       | First load (initial `useState`)     |
| `no_start_date` | Settings without a `startDate`      |
| `error`         | An exception in `getDashboardData`  |
| `ready`         | Data loaded successfully            |

Refresh (button) uses stale-while-revalidate: it only increments `rev`, it doesn't set `loading`. Old data stays visible during the re-fetch.

## Components created

| File                              | Responsibility                               |
| --------------------------------- | -------------------------------------------- |
| `dashboard-current-study.tsx`     | Current/next item + last completed           |
| `dashboard-today-progress.tsx`    | The day's progress (count + minutes + %)     |
| `dashboard-progress.tsx`          | Completion % of the whole plan               |
| `dashboard-streak.tsx`            | Current streak + record                      |
| `dashboard-recommendations.tsx`   | Prioritized list of recommendations          |
| `dashboard-overdue.tsx`           | Overdue blocks (top 5 + link)                |
| `dashboard-upcoming.tsx`          | The next 3 future blocks                     |
| `dashboard-activity-calendar.tsx` | Activity heatmap                             |
| `dashboard-screen.tsx`            | Orchestrator with loading/empty/error states |
