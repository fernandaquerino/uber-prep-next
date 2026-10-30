# Delivery 06.1 — Dashboard refinement

## Previous problems fixed

| Problem                              | Solution                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| Wide cards with little content       | 2-column layout on desktop, cards with adequate density   |
| Recommendations took up too much space | Replaced by compact priorities (max 3 items)            |
| Positive state in a large card       | A 1-line inline banner                                    |
| Small activity calendar              | A dedicated component with day rows                       |
| No per-category progress             | A section with a per-category bar using real colors       |
| No weekly summary                    | A 7-day widget + a quick summary in the side column        |
| No visual identity                   | Per-category colored borders, per-status indicators       |
| No plan period in the header         | A header with the date, week and period                   |
| Refresh with no feedback             | A button with an animated `Loader2` and `isRefreshing` state |

## New Dashboard hierarchy

```
1. Header (date · week · period)
2. Day focus + Weekly quick summary (2 columns)
3. Compact priorities
4. Overall progress + Progress by area (2 columns)
5. Current week — 7 days
6. Upcoming studies + Activity (2 columns)
7. Consistency
```

## Components created

| File                              | Responsibility                                  |
| --------------------------------- | ----------------------------------------------- |
| `dashboard-focus.tsx`             | Current study (2-col: focus + week quick summary) |
| `dashboard-priorities.tsx`        | Compact priorities (max 3)                      |
| `dashboard-progress-section.tsx`  | Overall progress + by area (2 columns)          |
| `dashboard-week-days.tsx`         | View of the current week's 7 days               |
| `dashboard-upcoming-enhanced.tsx` | Upcoming studies with more context              |
| `dashboard-activity-enhanced.tsx` | Activity calendar with a clear legend           |
| `dashboard-consistency.tsx`       | Consistency in a compact grid (4 metrics)       |

## Components removed

- `dashboard-current-study.tsx` → absorbed into `dashboard-focus.tsx`
- `dashboard-today-progress.tsx` → absorbed into the focus
- `dashboard-progress.tsx` → replaced by `dashboard-progress-section.tsx`
- `dashboard-streak.tsx` → replaced by `dashboard-consistency.tsx`
- `dashboard-recommendations.tsx` → replaced by `dashboard-priorities.tsx`
- `dashboard-overdue.tsx` → absorbed into priorities
- `dashboard-upcoming.tsx` → replaced by `dashboard-upcoming-enhanced.tsx`
- `dashboard-activity-calendar.tsx` → replaced by `dashboard-activity-enhanced.tsx`

## View model

The architecture now uses a complete `DashboardViewModel` with all the sections pre-computed. The components receive only formatted data, computing nothing.

```ts
type DashboardViewModel = {
  header: DashboardHeaderViewModel;
  focus: DashboardFocusViewModel;
  weekQuickSummary: DashboardWeekQuickSummary;
  priorities: DashboardPriorityViewModel[];
  progress: DashboardProgressViewModel;
  categoryProgress: DashboardCategoryProgressViewModel[];
  currentWeek: DashboardCurrentWeekViewModel;
  upcoming: DashboardUpcomingItemViewModel[];
  activity: DashboardActivityViewModel;
  consistency: DashboardConsistencyViewModel;
};
```

## New domain selectors

`src/lib/domain/progress/dashboard-selectors.ts`:

- `getPlanProgressByCategory()` — groups items by category
- `getCurrentWeekDays()` — the current week's 7 days with a computed status
- `getWeekItemSummary()` — the week's summary counts
- `getUpcomingStudyItems()` — the next N uncompleted blocks
- `getActivityWeeks()` — activity weeks for the heatmap

## Progress by category

Uses exclusively real data from the effective schedule. Categories with 0 blocks are omitted. The "not started" state shows "Não iniciado · 0/N" instead of "0%" in a large card.

## Activity calendar

- A clear definition: "Each cell represents the number of blocks completed that day."
- Alternating day labels (Seg, Qua, Sex, Dom) to save space
- An empty state with guidance: "Conclua blocos para visualizar sua consistência."

## Consistency

A compact grid with 4 metrics: current streak, record, days this week, total days studied.

A tooltip explaining the rule (rest days don't break the streak).

## Priorities

Replace the old "recommendations". A maximum of 3 items. The positive state becomes a 1-line inline banner.

## Flicker-free refresh

The `useDashboard` hook follows the same stale-while-revalidate pattern as Delivery 05.3:

- `refresh()` sets `isRefreshing=true` and increments `rev`
- The effect fetches new data without touching the `loading` state
- Existing data stays visible during the re-fetch
- The button shows an animated `Loader2` while `isRefreshing=true`

## Deliberately omitted metrics

- Readiness (not enough data)
- Per-topic mastery (depends on quizzes/mocks)
- Knowledge heatmap (depends on multiple modules)
- Skill tree (premature)
- Timer, flashcard, quiz, mock metrics
- Forgetting risk

## Responsiveness

- Desktop (≥1024px): a 2-3 column layout
- Tablet (768px): a 2-column layout where possible
- Mobile (375px): vertical stack, no horizontal overflow

## Accessibility

- Week region: `role="list"` with an `aria-label` per day
- Activity calendar: `role="img"` with an `aria-label`
- `aria-label` on individual cells with readable information
- Refresh button with a dynamic `aria-label` (loading state)
- Priorities with `aria-labelledby`
- Weekday names with a `title` attribute for a native tooltip
