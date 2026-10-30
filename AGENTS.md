# Rebuilding Uber Prep in Next.js

I want to rebuild the **Uber Prep** project from scratch, migrating the current React application to a new application in **Next.js with the App Router and TypeScript**.

The current application should be used as:

- a functional reference;
- a content source;
- an initial data source;
- a visual reference;
- a feature inventory.

I don't want to simply convert the current React components to Next.js.

I want to rebuild the application with:

- a cleaner architecture;
- centralized business rules;
- a genuinely dynamic calendar;
- reliable progress;
- consistent review;
- a better user experience;
- robust persistence;
- automated tests;
- room for future evolution.

## Execution rule

Don't implement the whole project at once.

Split the work into the deliveries described in this document and execute **one delivery at a time**.

Before each delivery:

1. Analyze the current project.
2. List the relevant files found.
3. Explain what will be reused.
4. Explain what will be redone.
5. List the files that will be created or modified.
6. Wait for approval before implementing, if working interactively.

After each delivery:

1. Run TypeScript.
2. Run lint.
3. Run tests.
4. Run the build.
5. Fix all the errors found.
6. Present a summary of what was completed.
7. Don't automatically advance to the next delivery.

## Product goal

Uber Prep is a local-first application to organize an intensive six-week preparation for Frontend Engineer interviews, focused on processes similar to Uber's.

The preparation covers:

- algorithms and data structures;
- deep JavaScript;
- React;
- frontend coding;
- frontend system design;
- behavioral interviews;
- technical English;
- mock interviews;
- spaced repetition;
- progress tracking.

The app must clearly answer:

1. What do I need to study today?
2. What's still pending?
3. What do I need to review?
4. What's the next content?
5. How much have I progressed?
6. Which subjects am I struggling with the most?
7. How has my performance evolved over the weeks?

## Mandatory principles

### 1. Single source of truth

Dashboard, Plan, Review Today, reports and recommendations must consume the same services, selectors and domain rules.

Don't create independent calculations for:

- current study;
- next study;
- overdue content;
- due reviews;
- progress;
- readiness;
- weak topics.

### 2. Separation between calendar and progress

The application must separate:

- the real calendar date;
- the sequential position in the plan;
- the person's real progress.

The calendar advances with time.

The plan content only advances when the person makes an explicit decision:

- complete;
- continue;
- reschedule;
- move forward;
- skip.

Never advance the plan just because the day changed.

### 3. Content decoupled from the interface

Questions, flashcards, plan days, STAR questions, templates and resources must not be coupled to React components.

### 4. Business rules outside the components

Components should render data and trigger actions.

Don't put complex rules in the components for:

- dates;
- spaced repetition;
- readiness;
- retention;
- review;
- rescheduling;
- progress.

### 5. Reliable local-first

The application must work without a backend.

However, don't use several uncoordinated `localStorage` keys as the main database of the new version.

Use a structured local persistence layer, preferably:

- IndexedDB;
- Dexie or an equivalent solution;
- repositories abstracting the persistence mechanism.

Storage access must happen through interfaces, not directly inside the components.

### 6. Data migration

The new application needs to be able to import the old version's data.

Implement:

- reading the old JSON backup;
- conversion to the new model;
- validation;
- a report of imported data;
- handling of incompatible records;
- duplicate prevention.

Don't rely on manual `localStorage` editing via DevTools.

---

# Technical stack

Use:

- Next.js with the App Router;
- React;
- TypeScript in strict mode;
- Tailwind CSS;
- shadcn/ui or equivalent accessible components;
- React Hook Form;
- Zod;
- Zustand only for interface or session state when needed;
- TanStack Query only when it makes sense for asynchronous operations and persistence;
- IndexedDB with Dexie or equivalent;
- date-fns for calendar operations;
- Vitest;
- React Testing Library;
- Playwright;
- Monaco Editor loaded on demand;
- a Web Worker for isolated JavaScript execution.

Don't introduce libraries without justifying the need.

## Next.js rules

- Use Server Components by default.
- Use Client Components only when there's interaction, browser state or IndexedDB access.
- Don't turn whole pages into Client Components without need.
- Use dynamic loading for heavy modules.
- Monaco Editor, reports and mock modules can use lazy loading.
- Organize the layouts with the App Router.
- Implement loading, empty-state and error-state states.
- Don't access `window`, `document`, IndexedDB or storage during SSR.

---

# Suggested architecture

Adapt when needed, but keep separation by domain:

```text
src/
  app/
    (app)/
      dashboard/
      plano/
      revisar/
      flashcards/
      quizzes/
      mocks/
      playground/
      notas/
      recursos/
      relatorios/
      configuracoes/
    layout.tsx
    page.tsx

  components/
    ui/
    layout/
    feedback/
    charts/

  features/
    study-plan/
      domain/
      application/
      infrastructure/
      components/
      hooks/
      schemas/
      tests/

    reviews/
      domain/
      application/
      infrastructure/
      components/
      hooks/
      schemas/
      tests/

    flashcards/
    quizzes/
    timer/
    mocks/
    playground/
    notes/
    reports/
    readiness/
    resources/
    settings/
    backup/

  db/
    database.ts
    schema.ts
    migrations/

  data/
    plan/
    quizzes/
    flashcards/
    behavioral/
    system-design/
    frontend-drills/
    resources/
    technical-english/

  shared/
    dates/
    errors/
    types/
    utils/
    constants/

  workers/
    javascript-runner.worker.ts
```

Each feature should have clear responsibilities:

```text
domain/
```

Types, entities, rules and pure functions.

```text
application/
```

Use cases and orchestration.

```text
infrastructure/
```

IndexedDB, repositories, export and integration with browser APIs.

```text
components/
```

The feature's interface.

---

# Core plan model

Define an explicit model for the plan content.

Conceptual example:

```ts
type StudyPlan = {
  id: string;
  title: string;
  durationWeeks: number;
  version: number;
  days: PlanDay[];
};

type PlanDay = {
  id: string;
  sequence: number;
  title: string;
  description?: string;
  blocks: PlanBlock[];
};

type PlanBlock = {
  id: string;
  title: string;
  description?: string;
  category: StudyCategory;
  estimatedMinutes: number;
  resourceIds?: string[];
  quizIds?: string[];
  flashcardIds?: string[];
  tags: string[];
};
```

The original six-week content must be migrated, preserving:

- titles;
- descriptions;
- exercises;
- estimated duration;
- breaks;
- mocks;
- related quizzes;
- resources;
- categories;
- existing links.

---

# Calendar model

The weekly configuration must be editable.

Example:

```ts
type WeekdayAvailability = {
  enabled: boolean;
  availableMinutes: number;
};

type StudyCalendarSettings = {
  timezone: string;
  startDate: string;
  weekdayAvailability: Record<Weekday, WeekdayAvailability>;
};
```

Suggested initial configuration:

- Monday to Friday: 8 hours;
- Saturday: 4 hours;
- Sunday: rest.

These values must not be hardcoded in components.

## Calendar rules

The real date must determine:

- the correct day of the week;
- that day's availability;
- whether it's study or rest;
- the formatting shown in the interface.

Mandatory example:

```text
2026-06-11 = Thursday
2026-06-12 = Friday
2026-06-13 = Saturday
2026-06-14 = Sunday
2026-06-15 = Monday
```

Never associate consecutive dates with fixed labels like Monday, Tuesday and Wednesday.

Calendar dates must be stored as:

```text
YYYY-MM-DD
```

Avoid using directly:

```ts
new Date("2026-06-11");
```

Implement consistent parsing and formatting considering:

```text
America/Sao_Paulo
```

---

# Progress model

Implement explicit records for progress.

Example:

```ts
type PlanBlockStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "stuck"
  | "skipped"
  | "rescheduled";

type PlanBlockProgress = {
  id: string;
  blockId: string;
  status: PlanBlockStatus;
  scheduledDate: string;
  originalScheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
};
```

## Missed day

When the person doesn't study, allow:

### Move the plan forward

The pending content stays as the next content, shifting the future schedule.

### Reschedule content

Choose another valid date.

### Skip content

Consciously mark it as skipped, requiring confirmation.

### Keep it overdue

The content stays pending and may appear alongside the current schedule.

The interface must inform the consequences before applying the action.

---

# Effective schedule

Create a central scheduler that combines:

- the original plan;
- the start date;
- the weekly availability;
- rest days;
- progress;
- reschedules;
- overdue content;
- skipped content.

Example output:

```ts
type ScheduledStudyDay = {
  date: string;
  weekday: Weekday;
  availableMinutes: number;
  isRestDay: boolean;
  items: ScheduledPlanBlock[];
  totalEstimatedMinutes: number;
  status: "past" | "today" | "future" | "completed" | "partial" | "missed" | "rest";
};
```

All modules must consult this schedule.

Create pure functions equivalent to:

```ts
buildStudySchedule();
getCurrentStudyDay();
getNextStudyDay();
getPendingItems();
getOverdueItems();
getNextValidStudyDate();
reschedulePlanItem();
shiftPendingSchedule();
getDailyStudySummary();
```

---

# Review system

The review needs to be an independent domain, but connected to the activities.

Don't use a single boolean to represent all the states.

Example:

```ts
type ReviewSource = "plan" | "flashcard" | "quiz" | "mock" | "manual";

type ReviewStatus = "scheduled" | "due" | "completed" | "dismissed" | "rescheduled";

type ReviewItem = {
  id: string;
  sourceType: ReviewSource;
  sourceId: string;
  status: ReviewStatus;
  scheduledFor: string;
  completedAt?: string;
  result?: ReviewResult;
  cycleIndex: number;
};
```

Clearly separate:

```ts
isMarkedForReview;
reviewStatus;
reviewedAt;
nextReviewAt;
```

## Spaced repetition

Preserve the current cycles:

- 1 day;
- 3 days;
- 7 days;
- 14 days;
- 30 days.

But centralize the rule in a single service.

Results must affect the next interval:

- high mastery: advance;
- partial mastery: keep or advance moderately;
- error or stuck: reduce the interval;
- manual marking: create a review;
- unmarking before execution: remove from the queue;
- already-completed history: preserve as history.

---

# Features that must be preserved and improved

## 1. Dashboard

Keep:

- overall readiness;
- readiness per area;
- plan progress;
- streak;
- study calendar;
- goals;
- daily recommendations;
- quiz statistics;
- flashcard statistics;
- time studied;
- retention;
- access to reports.

Improve:

- use exclusively real data;
- clearly show how each indicator is computed;
- allow opening the data that originated the metric;
- distinguish absence of data from poor performance;
- don't show artificial readiness before there's enough activity;
- show "Today", "Pending" and "Reviews" as the main priorities;
- ensure consistency with Plan and Review Today.

## 2. Plan

Keep:

- six weeks;
- study days and blocks;
- block details;
- status;
- minutes;
- notes;
- pattern used;
- difficulty;
- link to quizzes;
- link to flashcards;
- breaks;
- mocks.

Improve:

- a dynamic calendar;
- start on any day of the week;
- rest days;
- rescheduling;
- recovery of missed days;
- automatic content splitting when it exceeds availability;
- editing the weekly availability;
- a per-week and per-schedule view;
- a clear indication of today, overdue, completed and rescheduled;
- a change history;
- an action to complete the day;
- an action to undo completion;
- confirmation before restarting or recomputing the plan.

## 3. Review Today

Keep:

- the plan's review queue;
- overdue flashcards;
- overdue quizzes;
- weak topics;
- mock gaps;
- a learning journal;
- weekly reflection;
- an explain-without-looking exercise;
- a next-study suggestion.

Improve:

- use a single normalized queue;
- order by priority and lateness;
- explain why each item is in the queue;
- allow reviewing, deferring, dismissing or rescheduling;
- avoid ghost items;
- remove canceled markings;
- record history;
- show session progress;
- show estimated duration;
- make "What to study tomorrow" consult the same schedule as Plan;
- use "Next study day" when tomorrow is a rest day;
- allow consulting old reflections;
- allow editing already-saved reflections.

## 4. Flashcards

Keep:

- creation;
- editing;
- deletion;
- categories;
- tags;
- search;
- filters;
- study session;
- flip the card;
- "knew it";
- "didn't know it";
- status;
- spaced repetition;
- creation from topics.

Improve:

- sessions with a configurable amount;
- per-card history;
- hit statistics;
- duplicate-card detection;
- import and export;
- link to plan content;
- a better editor;
- keyboard shortcuts;
- new, learning and mastered states;
- Markdown support in question and answer.

## 5. Quizzes

Keep:

- versioned questions;
- filters;
- daily quiz;
- filtered practice;
- mistake review;
- quizzes from flashcards;
- flagged questions;
- history;
- total time;
- time per question;
- automatic grading;
- self-assessment of open questions.

Improve:

- normalize the question types;
- show an explanation after the answer;
- per-question history;
- per-topic metrics;
- a mistakes queue;
- centralized spaced repetition;
- configurable sessions;
- a redo option;
- avoid repeating recent questions unnecessarily;
- save partially filled answers;
- validate the questions' content;
- allow importing new sets.

## 6. Timer

Keep the presets:

- 25 minutes;
- 45 minutes;
- 60 minutes;
- 90 minutes.

Keep the categories:

- algorithms;
- system design;
- JavaScript;
- mock;
- general.

Improve:

- allow linking the session to a plan block;
- pause;
- resume;
- finish;
- cancel;
- add manual time;
- edit the session;
- remove the session;
- daily and weekly history;
- work while navigating between pages;
- recover the session after a reload;
- don't automatically count an abandoned session;
- accessible notifications;
- a stopwatch mode in addition to countdown.

## 7. Playground

Keep:

- Monaco Editor;
- JavaScript execution;
- console capture;
- tests;
- timeout;
- Web Worker;
- saved solutions;
- complexity;
- notes;
- drills.

Improve:

- lazy loading;
- templates;
- multiple test cases;
- output comparison;
- per-test status;
- readable errors;
- worker restart after a timeout;
- freeze prevention;
- version history;
- a link to the plan;
- TypeScript support as an optional evolution;
- don't run code with direct access to the page's main context.

## 8. Mocks

Keep:

- Coding;
- System Design;
- Behavioral;
- Full Loop;
- question;
- solution;
- feedback;
- strengths;
- weaknesses;
- next steps;
- rubric;
- readiness;
- audio;
- STAR;
- templates;
- checklist.

Improve:

- a guided start and finish flow;
- a specific timer;
- rubrics per type;
- clear scoring criteria;
- history;
- evolution comparison;
- gaps converted into review;
- audio stored separately;
- size control and audio removal;
- microphone permission states;
- an option for a mock without recording;
- a checklist with a clear purpose;
- "New session" must create a real, trackable session;
- allow continuing an in-progress session.

## 9. Notes

Keep:

- Markdown;
- categories;
- toolbar;
- preview;
- templates;
- notes per topic.

Improve:

- autosave;
- a save indicator;
- search;
- tags;
- favorites;
- notes linked to the plan, quiz, mock or flashcard;
- a minimal change history;
- deletion with confirmation;
- export;
- an accessible editor and preview.

## 10. Resources

Keep resources for:

- algorithms;
- data structures;
- frontend system design;
- JavaScript;
- technical English.

Improve:

- tags;
- search;
- "not started", "in progress" and "completed" status;
- favorites;
- a link to topics;
- recommendations with a justification;
- avoid recommending already-mastered content without reason;
- allow adding your own resources.

## 11. Technical English

Preserve:

- phrases;
- vocabulary;
- interview answers.

Improve:

- organization by context;
- favorites;
- practice;
- generated flashcards;
- usage examples;
- a record of what has already been practiced.

## 12. Weekly reports

Keep:

- comparison between weeks;
- hours;
- blocks;
- quizzes;
- readiness;
- strengths;
- weaknesses;
- recommendations;
- Markdown;
- PDF.

Improve:

- allow selecting a week;
- consult old reports;
- show the source of the data;
- don't mix estimated hours with recorded hours;
- distinguish missing data from zero;
- generate a report only with valid metrics;
- keep weekly reflections linked to the report;
- avoid duplicate metrics.

## 13. Backup

Keep JSON export.

Add:

- import via the interface;
- validation with Zod;
- schema versioning;
- a preview before importing;
- import replacing or merging;
- duplicate detection;
- an error report;
- a full backup;
- a selective backup;
- migration of the old version;
- an option to clear all data with reinforced confirmation.

## 14. Settings

Create a dedicated area for:

- start date;
- timezone;
- availability per day of the week;
- default duration;
- theme;
- notification preferences;
- weekly goals;
- rescheduling rules;
- timer preferences;
- data and backup;
- plan restart.

---

# Readiness and risk topics

Don't implement readiness as an arbitrary hidden formula.

Create documentation of the formula and tests.

The score can consider:

- plan completion;
- consistency;
- quizzes;
- flashcards;
- mocks;
- retention;
- overdue reviews;
- real time studied.

But it must:

- have explicit weights;
- require a minimum amount of data;
- cap each dimension;
- not punish areas not yet started as if they were a failure;
- show an explanation to the user;
- allow inspecting the score's factors.

Conceptual example:

```ts
type ReadinessBreakdown = {
  overall: number | null;
  confidence: "insufficient_data" | "low" | "medium" | "high";
  areas: ReadinessArea[];
  factors: ReadinessFactor[];
};
```

## Heatmap

The heatmap must use real activity data.

It can represent:

- minutes recorded per day;
- completed blocks;
- sessions carried out;
- combined intensity.

Choose a definition and make it clear in the interface.

Don't mix different metrics without explanation.

## Risk topics

A topic can be considered at risk due to:

- repeated errors;
- low confidence;
- high difficulty;
- overdue reviews;
- poor performance in mocks;
- many "Stuck" markings;
- low retention.

The function must return not only the score, but the reasons:

```ts
type RiskTopic = {
  topicId: string;
  score: number;
  reasons: RiskReason[];
  recommendedActions: RecommendedAction[];
};
```

---

# User experience

The interface must prioritize clarity.

## Main navigation

Suggestion:

```text
Dashboard
Plano
Revisar
Flashcards
Quizzes
Mocks
Playground
Notas
Recursos
Relatórios
Configurações
```

## Prioritized dashboard

The top of the Dashboard must show:

1. Current study.
2. Pending content.
3. Due reviews.
4. The next recommended action.

Secondary metrics should appear below.

## Mandatory states

Every feature must consider:

- loading;
- empty;
- error;
- success;
- confirmation;
- insufficient data;
- operation in progress.

## Accessibility

Implement:

- keyboard navigation;
- visible focus;
- labels;
- contrast;
- ARIA when needed;
- accessible dialogs;
- error messages associated with the fields;
- reduced-motion support;
- shortcuts that don't interfere with inputs and editors.

## Responsiveness

The application must work on:

- desktop;
- tablet;
- mobile.

The timer must not take up excessive space on smaller screens.

---

# Deliveries

## Delivery 0 — Audit and planning

Don't write code yet.

Deliver:

- a page inventory;
- a component inventory;
- a hook inventory;
- a utility inventory;
- a data-source inventory;
- a map of the current localStorage keys;
- a dependency map;
- architectural problems;
- duplicated rules;
- incomplete features;
- features described in the README that don't work as expected;
- a migration plan;
- risks;
- a proposal for the new architecture.

Identify everything that can be reused:

- content;
- styles;
- components;
- schemas;
- utilities;
- tests;
- assets.

## Delivery 1 — Project foundation

Create:

- a new Next.js project;
- the App Router;
- TypeScript strict;
- Tailwind;
- UI components;
- a theme;
- layout;
- navigation;
- responsiveness;
- lint;
- formatting;
- aliases;
- Vitest;
- Testing Library;
- Playwright;
- error handling;
- the feature structure.

Create empty functional pages for all routes.

Don't implement product rules in this delivery.

## Delivery 2 — Local database, schemas and migration

Create:

- IndexedDB;
- schemas;
- tables;
- repositories;
- versioning;
- migrations;
- backup;
- import;
- export;
- reading the old backup;
- persistence tests.

Define stable IDs for all content.

## Delivery 3 — Calendar and schedule domain

Implement:

- weekly settings;
- local dates;
- timezone;
- rest days;
- the scheduler;
- availability;
- content splitting;
- the next valid date;
- the effective schedule;
- calendar tests.

Mandatorily test starting on:

- Monday;
- Thursday;
- Saturday;
- Sunday.

## Delivery 4 — Progress and plan recovery

Implement:

- status;
- completion;
- stuck;
- difficulty;
- confidence;
- minutes;
- notes;
- rescheduling;
- missed day;
- move the plan;
- skip;
- undo;
- history;
- persistence.

## Delivery 5 — Plan page

Build the complete Plan interface using exclusively the domains of the previous deliveries.

Don't duplicate calendar rules on the page.

## Delivery 6 — Dashboard

Implement first:

- current study;
- pending;
- reviews;
- progress;
- streak;
- calendar;
- recommendations.

Then add advanced metrics.

All data must be derived from the central services.

## Delivery 7 — Spaced repetition and Review Today

Implement:

- the review domain;
- cycle generation;
- a unified queue;
- priorities;
- rescheduling;
- completion;
- history;
- a journal;
- weekly reflection;
- next study.

## Delivery 8 — Flashcards

Migrate the content and implement all the described features.

## Delivery 9 — Quizzes

Migrate the current questions, normalize the schema and implement all the flows.

## Delivery 10 — Timer

Create a global timer that can be linked to activities.

## Delivery 11 — Playground

Migrate Monaco, the worker, tests and saved solutions.

## Delivery 12 — Mocks and behavioral

Migrate:

- records;
- STAR;
- templates;
- checklist;
- rubrics;
- audio;
- gaps;
- per-mock readiness.

## Delivery 13 — Notes, resources and technical English

Implement the three modules and their links with the other domains.

## Delivery 14 — Readiness, risk and reports

Only implement it once a real data base exists.

Document the formulas.

Add tests for all the calculations.

## Delivery 15 — Full backup and final migration

Implement:

- import from the previous app;
- merge;
- replacement;
- validation;
- a report;
- rollback on error.

## Delivery 16 — Final quality

Run:

- an accessibility audit;
- unit tests;
- integration tests;
- E2E tests;
- bundle analysis;
- lazy loading;
- error handling;
- responsiveness;
- flow validation;
- a README review.

---

# Minimum tests

## Unit

Cover:

- calendar;
- progress;
- scheduler;
- rescheduling;
- review;
- spaced repetition;
- readiness;
- risk topics;
- streak;
- metrics;
- import;
- migration;
- validations.

## Integration

Ensure that:

- Plan and Dashboard show the same current study;
- Plan and Review Today show the same next study;
- completing a block updates the progress;
- marking a review creates an item;
- unmarking removes an item not yet executed;
- a wrong quiz creates a review;
- an answered flashcard updates the cycle;
- a mock gap creates a recommendation;
- a timer session updates the metrics;
- a saved reflection appears in the correct report.

## E2E

Create scenarios for:

1. Configure the start date.
2. Start the plan on a Thursday.
3. Complete the first block.
4. Don't study the next day.
5. Move the content forward.
6. Reschedule another block.
7. Mark content for review.
8. Complete a review.
9. Take a quiz.
10. Study flashcards.
11. Record a timer session.
12. Create a mock.
13. Save a weekly reflection.
14. Export a backup.
15. Clear the data.
16. Import a backup.
17. Confirm the restoration.

---

# Global acceptance criteria

The rebuild will be complete when:

- [ ] The app uses Next.js with the App Router.
- [ ] TypeScript is in strict mode.
- [ ] There's no business logic centralized in a single giant component.
- [ ] The calendar starts correctly on any day.
- [ ] Saturday uses its real availability.
- [ ] Sunday respects rest.
- [ ] Content doesn't advance automatically with the date.
- [ ] Missed days can be recovered.
- [ ] Dashboard, Plan and Review Today are consistent.
- [ ] "What to study tomorrow" matches the schedule.
- [ ] Reviews don't stay in the queue improperly.
- [ ] Previous reflections can be consulted.
- [ ] Readiness and risk have an explanation.
- [ ] The heatmap has a clear definition.
- [ ] The timer is linked to the activities.
- [ ] Mocks have trackable sessions.
- [ ] All the old content was migrated.
- [ ] There's import and export.
- [ ] Old data can be migrated.
- [ ] Tests pass.
- [ ] Lint passes.
- [ ] TypeScript passes.
- [ ] The build passes.
- [ ] The main flows have E2E tests.
- [ ] The application works on desktop and mobile.
- [ ] The README reflects the real behavior.

---

# Constraints

Don't do:

- automatic file-by-file conversion;
- a copy of the old architecture;
- an `App` component concentrating the whole application;
- direct storage access in components;
- a different calculation on each page;
- dates based on fixed labels;
- readiness without explanation;
- data mocks replacing real features;
- delivery of all features in a single step;
- removal of existing content without documenting it;
- a complete visual change without need;
- creating a backend at this stage;
- unnecessary authentication for a personal local-first app.

# Expected result of each delivery

When finishing each delivery, present:

```md
## Delivery completed

### Implemented

### Files created

### Files modified

### Technical decisions

### Business rules added

### Tests added

### Commands run

### TypeScript result

### Lint result

### Test result

### Build result

### Pending

### Suggested next delivery
```

Start exclusively with **Delivery 0 — Audit and planning**.

Don't write code in this first step.
