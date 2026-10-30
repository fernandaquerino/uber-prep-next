# Effective Schedule

The effective schedule combines:

- the base schedule from Delivery 03;
- the blocks' progress;
- reschedules;
- shifts;
- skips;
- completions.

## Missed-day example

Start: `2026-06-11`, a Thursday.

Base schedule:

| Content  | Date       |
| -------- | ---------- |
| Day 1    | 2026-06-11 |
| Day 2    | 2026-06-12 |
| Day 3    | 2026-06-13 |
| rest     | 2026-06-14 |
| Day 4    | 2026-06-15 |
| Day 5    | 2026-06-16 |

If Day 1 was completed and Friday was missed with `shift_pending`:

| Content  | Effective date |
| -------- | -------------- |
| Day 1    | 2026-06-11     |
| Day 2    | 2026-06-13     |
| Day 3    | 2026-06-15     |
| Day 4    | 2026-06-16     |
| Day 5    | 2026-06-17     |

Sunday stays a rest day.

## Lateness

An item is overdue when the effective date is earlier than the `today` received by the function and the status is neither `completed` nor `skipped`.

## Capacity

Reschedules and shifts recompute capacity per day. Excess doesn't block automatically; the day becomes `over_capacity`.
