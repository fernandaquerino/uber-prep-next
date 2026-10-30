# Report Export Format

## Markdown

Suggested name:

```text
uber-prep-week-{number}-{start}.md
```

Sections:

1. title, period, status and generation date;
2. metrics table;
3. time per category;
4. strong topics;
5. risk topics;
6. reflection;
7. next steps.

Values without evidence are exported as `Insufficient data`.

## IndexedDB snapshot

Table:

```text
weeklyReportSnapshots
```

Fields:

```ts
type WeeklyReportSnapshotRecord = {
  id: string;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  reportJson: string;
};
```

Snapshots are included in the general backup. Old backups without this collection
are still valid and receive an empty list during validation.
