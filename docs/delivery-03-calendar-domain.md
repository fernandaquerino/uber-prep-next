# Delivery 03 — Calendar and Schedule Domain

## Context

This delivery creates the pure domain responsible for turning `plan + startDate + weekdayAvailability` into a correct chronological schedule. The code doesn't depend on React, components, hooks, Dexie, IndexedDB, `localStorage`, `window` or `document`.

The domain lives in `src/lib/domain/schedule` because the repository already concentrates infrastructure and shared rules in `src/lib`. The UI was not changed.

## The old app's problem

The old app mixed the real date, the plan's sequential position and progress. That made `2026-06-11`, a Thursday, appear as a Monday, and also assigned weekday capacity to Saturdays and consumed content on rest days.

The regression scenario is now covered by tests:

| Date       | Real day      | Capacity |
| ---------- | ------------- | -------: |
| 2026-06-11 | Thursday      |      480 |
| 2026-06-12 | Friday        |      480 |
| 2026-06-13 | Saturday      |      240 |
| 2026-06-14 | Sunday        |     rest |
| 2026-06-15 | Monday        |      480 |

## Concepts

- **Real date**: a civil day in the `YYYY-MM-DD` format. Determines the day of the week, rest and capacity.
- **Sequential plan day**: the content's position, like `sequence: 1`, `sequence: 2`.
- **Progress**: the person's real advance. Not implemented in this delivery.

The calendar advances with time, but the plan content will only advance later when there's an explicit progress decision.

## Architecture

Files created:

- `schedule.types.ts`: the domain's contracts.
- `calendar-date.ts`: single operations for civil dates.
- `weekdays.ts`: the list of days and the default timezone.
- `availability.ts`: weekly availability and the lookup for study days.
- `schedule-builder.ts`: the initial scheduler.
- `schedule-selectors.ts`: pure selectors for querying and grouping.
- `schedule.errors.ts`: typed errors.
- `index.ts`: barrel exports.

## Civil dates and timezone

The `CalendarDate` type is branded and validated. Civil-day dates are stored as `YYYY-MM-DD`.

The domain avoids `new Date("YYYY-MM-DD")`. The operations use their own parsing and a centralized `Date.UTC(...)` to avoid accidental conversion by the local timezone. The product's default timezone is `America/Sao_Paulo`, but in this delivery the operations are strictly over civil dates, not timestamps.

## Weekly configuration

The default availability is centralized in `DEFAULT_WEEKDAY_AVAILABILITY`:

- Monday to Friday: 480 minutes;
- Saturday: 240 minutes;
- Sunday: rest.

The configuration can be replaced by a function call. The domain validates a week with no enabled days, negative minutes and an enabled day with zero minutes.

## Scheduler decisions

### Rest days appear in the schedule

Disabled days enter the array as `isRestDay: true`, with no items. This prepares the visual calendar, reports, heatmap and messages like "tomorrow is a rest day".

The schedule ends on the day the last content is scheduled. Rest days after the last content are not generated.

### One `StudyPlanDay` per enabled date

The delivery uses Strategy A: each `StudyPlanDay` occupies one enabled date. Blocks are not split automatically.

If the estimated total exceeds the day's capacity, the scheduler keeps the blocks together and marks `capacityStatus: "over_capacity"`.

This choice preserves the old plan's organization and leaves automatic splitting for an explicit future rule.

## Validations and Errors

Typed errors:

- `InvalidCalendarDateError`;
- `InvalidAvailabilityError`;
- `NoStudyDaysEnabledError`;
- `InvalidStudyPlanError`.

Implemented validations:

- an invalid start date;
- an empty timezone;
- a fully disabled week;
- negative minutes;
- an enabled day with zero minutes;
- a plan without an ID;
- an invalid sequence;
- a duplicate sequence;
- a block without an ID;
- a duplicate block ID;
- a negative or non-finite duration.

A plan with no days returns an empty schedule. This behavior is allowed because a partial import or initial bootstrap may not have content loaded yet.

## Selectors

Pure selectors were added to:

- fetch a day by date;
- get the first and last study day;
- get the next and previous study day;
- compute `past | today | future` status, receiving `today` as an argument;
- get the schedule's range;
- group by real week, Monday to Sunday.

## Limitations

There's still no:

- persisted progress;
- block completion;
- real lateness;
- rescheduling;
- moving the plan forward;
- skipping content;
- reviews;
- integration with Dashboard, Plan or Review Today.

These rules belong to the next deliveries.

## Inherited Tests

The old repository path came as a placeholder (`<OLD_REPOSITORY_PATH>`), so it wasn't consulted. The scenarios were implemented from the delivery's specification, discarding any old behavior that tied dates to fixed labels.

## Preparation for Delivery 04

The scheduler already exposes contracts that can receive progress later, but it doesn't anticipate progress rules. Delivery 04 should consume this schedule as a base and add explicit decisions for completion, lateness, rescheduling, skipping and history.
