# Plan Progress Domain

The progress domain lives in `src/lib/domain/progress` and doesn't depend on React, Dexie, repositories or browser APIs.

## States

The block's persisted status represents execution:

- `pending`;
- `in_progress`;
- `completed`;
- `stuck`;
- `skipped`.

Rescheduling is represented by `scheduledDate`, `originalScheduledDate`, `ScheduleOverride` and history.

## Day status

The day status is derived from the blocks:

- all pending or no blocks: `not_started`;
- any in progress: `in_progress`;
- all completed: `completed`;
- all skipped: `skipped`;
- any stuck with none in progress: `stuck`;
- mixes of completed, skipped and pending: `partial`.

## Metrics

`completionPercentage` considers only completed ones.

`resolutionPercentage` considers completed + skipped, to distinguish "done" from "decided".

## Undo

Events keep before/after snapshots. Undo creates a new `undone` event; history is not erased.
