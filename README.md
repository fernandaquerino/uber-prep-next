# Uber Prep

A local-first app for organizing intensive preparation for Frontend Engineer interviews. It works with no account and no backend; your data lives in the browser's IndexedDB.

> Current status: Delivery 17 completed, with functional modules, explainable metrics, weekly reports and a final audit.

## Stack

- Next.js 16 with App Router and React 19
- TypeScript strict and Tailwind CSS 4
- shadcn/ui components on top of Base UI
- Dexie 4 and IndexedDB
- Zod 4
- Vitest, React Testing Library and Playwright
- Monaco Editor loaded on demand

## How to run

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Full validation:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

## Modules

| Route            | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `/dashboard`     | Priorities, progress, evidence, readiness, risks and the Skill Tree   |
| `/plano`         | Effective schedule, progress, delays and reschedules                  |
| `/revisoes`      | Unified queue, journal and weekly reflection                          |
| `/flashcards`    | Creation, study and spaced repetition                                 |
| `/quizzes`       | Sessions, history, mistakes and reviews                               |
| `/timer`         | Global timer and real-time history                                    |
| `/mocks`         | Coding, System Design, Behavioral, Full Loop and evidence             |
| `/playground`    | Monaco, isolated execution and saved solutions                        |
| `/notas`         | Markdown, versions, links and search                                  |
| `/recursos`      | Resource library and technical English                                |
| `/configuracoes` | Plan, schedule, appearance, accessibility, backup and reset           |
| `/relatorios`    | Weekly reports, comparison, Markdown, printing and snapshots          |

> Note: route names are in Portuguese because the app's interface is in Brazilian Portuguese (its target user).

## Architecture

- Calendar, progress, review, evidence and reporting rules live in domain functions and use cases.
- Dashboard, Plan, Review Today and Reports consume the same effective schedule and the same settings.
- Components access persistence through repositories and use cases; IndexedDB is not read during SSR.
- The current schema is versioned and has migrations in [`src/lib/db/schema.ts`](src/lib/db/schema.ts).
- Seed content is decoupled from the interface in `src/lib/data`.

Main documentation:

- [`docs/architecture/decisions.md`](docs/architecture/decisions.md)
- [`docs/data/database-schema.md`](docs/data/database-schema.md)
- [`docs/data/backup-format.md`](docs/data/backup-format.md)
- [`docs/domain/study-schedule.md`](docs/domain/study-schedule.md)
- [`docs/domain/readiness.md`](docs/domain/readiness.md)
- [`docs/features/reports.md`](docs/features/reports.md)
- [`docs/delivery-17-final-audit.md`](docs/delivery-17-final-audit.md)

> The internal documentation under `docs/` is written in Brazilian Portuguese.

## Data and privacy

- All personal content stays in the browser.
- JSON backups include settings, progress, quizzes, timer, mocks, notes, resources, technical English and report snapshots.
- Audio recordings are not part of the JSON; the backup reports how many audios were left out.
- Import validates the envelope before changing the database and supports older backups with missing collections.
- A full reset requires typing the confirmation `RESETAR`.

## Metrics

- Readiness only appears once there is minimum evidence.
- Missing data is not presented as zero performance.
- Risks and recommendations include reasons and sources.
- Planned time and recorded time are separate metrics.
- Reports use the schedule's real weeks and can be derived or frozen into snapshots.

## Known limitations

- The app is local to one browser and profile; there is no sync across devices.
- Clearing the browser's data removes the local database.
- Mock audio must be preserved separately from the JSON backup.
- PDF printing depends on the browser's print dialog.

See [`docs/audit/test-plan.md`](docs/audit/test-plan.md) for the validation matrix and manual scenarios.

## License

[MIT](LICENSE) © fernandaquerino
