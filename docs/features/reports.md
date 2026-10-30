# Weekly reports

## Source of truth

The report uses:

- the Plan's effective schedule;
- the consolidated evidence from Delivery 15;
- `weeklyReflections`;
- `weeklyReportSnapshots`.

Activity metrics consider only events that occurred between the start and the
end of the week. Readiness, Skill Tree, strengths and risks use evidence accumulated
up to the end of the week, allowing evolution to be tracked.

## Absence of data

Without assessed evidence, quiz accuracy and readiness stay null. The interface
shows `No data` or `Insufficient data`, never `0%`.

## Reflection

Editing the reflection in the report updates the same record consumed by Review
Today. Computed metrics are not editable.

## Snapshots

The live report is always derived. The user can save one snapshot per
week. The snapshot contains the serialized report and is not recomputed when the
source data changes.

## Printing

`PDF / Print` uses `window.print()`. Navigation controls are hidden and
important sections avoid internal page breaks.
