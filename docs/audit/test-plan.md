# Final test plan

## Automated

- domain: calendar, scheduler, progress, review, quizzes, timer, mocks, evidence, readiness and reports;
- integration: migrations, IndexedDB, plan consistency and backup;
- components: navigation, forms, editors and states;
- E2E: routes, Dashboard, Plan, theme, mobile, Reports, invalid import and canceled reset.

## Manual bug bash

Run on desktop and mobile:

1. a new user with no start date;
2. starting on a Thursday and a Sunday;
3. partial data and legacy settings;
4. a plan with overdue items and a completed plan;
5. a queue with no reviews and with overdue reviews;
6. an active timer during navigation and a reload;
7. a mock with and without audio;
8. an invalid import, a merge and a replace;
9. a canceled reset and a confirmed reset;
10. offline navigation after the first asset load.

## Criterion

Type, lint, formatting, test, build or E2E failures block completion. Scenarios that depend on device APIs, such as the microphone and printing, require manual verification.
