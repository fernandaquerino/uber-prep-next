# Architecture Decisions — Uber Prep Next.js

## Why Next.js

Next.js with the App Router provides Server Components by default, file-convention routing, image optimization, `next/font` and a good development experience with TypeScript. The alternative (Vite + React Router) would require manual configuration of many of these features.

## Why the App Router

The App Router is Next.js's current model (since v13). It allows Server Components, nested layouts, per-route loading/error colocation, and better streaming. The Pages Router is in maintenance mode.

## Why Server Components by default

Server Components reduce the JavaScript sent to the client. Most of this app's pages are data reads — they don't need interactivity on the server. `"use client"` is added only where there's browser state: the mobile sidebar (Sheet), the theme toggle, dropdowns and dialogs.

## Why local-first with IndexedDB (future deliveries)

The app has no backend. All study data lives on the user's device. IndexedDB (via Dexie) is needed because:

- localStorage has a ~5–10 MB limit (mock audio exceeds it)
- IndexedDB supports native Blob (audio without base64)
- Dexie offers strong typing, migrations and composite queries

In Delivery 01 there's no persistence — it's added in Delivery 02 along with the Dexie schema and the migration script for the existing localStorage.

## Why not add persistence in Delivery 01

The foundation must be stable before adding data layers. Introducing Dexie + a migration script in the same delivery as the layout and routes creates a large failure surface. The data schema needs to be defined after mapping the domains (calendar, progress, flashcards) in Deliveries 03–04.

## Why separate features

The `src/features/<name>/` structure puts everything related to a feature together (components, hooks, types, utils). This makes it easier to find code, measure complexity per feature and remove a feature without touching the rest.

## Testing strategy

- **Vitest + React Testing Library**: unit tests of components, utilities and domain logic. jsdom environment. No internal-implementation tests.
- **Playwright**: E2E tests of real flows in the browser. Focus on navigation, theme and mobile. Runs against the production build to ensure the build doesn't break anything.
- **Coverage**: prioritize `lib/domain/` (pure logic) with ≥ 90% and shared components with ≥ 80%.

## Calendar domain

The calendar domain lives in `src/lib/domain/schedule` because it's pure logic shared by Plan, Dashboard, Review Today and future reports. It doesn't import React, hooks, components, Dexie, repositories or browser APIs.

Civil dates use the `YYYY-MM-DD` format with a branded `CalendarDate` type. Operations like parsing, adding days, comparison, difference and day of the week are centralized in `calendar-date.ts`. The domain avoids `new Date("YYYY-MM-DD")`, since that form is interpreted as UTC and can shift dates in some timezones.

The initial scheduler uses one `StudyPlanDay` per enabled date and includes rest days in the schedule. This decision preserves the old plan's structure and allows the future UI to show real weeks, rest and the next study day without inventing progress rules.

## Theme strategy

`next-themes` with `attribute="class"` adds `.dark` on the `<html>`. The preference is persisted in `localStorage` automatically. `suppressHydrationWarning` prevents a hydration flash. CSS variables on `:root` and `.dark` in globals.css control all the colors — no hardcoded color in components.

## Component strategy

- `src/components/ui/`: shadcn/ui primitives (generated). Don't edit directly.
- `src/components/layout/`: the app shell (header, sidebar, mobile-nav, providers).
- `src/components/feedback/`: shared states (EmptyState, ErrorState, LoadingState, ComingSoonState, PageHeader).
- `src/features/*/`: feature-specific components, grouped by domain.
- No inline styles. All styles via Tailwind. Tokens in CSS variables.
