# Delivery 09 — Quizzes

## Summary

Implements the local-first quizzes module with normalized questions, persisted sessions, automatic grading, self-assessment, filters, initial metrics and integration with the central review queue.

## Adopted architecture

- `src/lib/domain/quizzes`: pure functions for normalization, validation, grading, scoring, filters, daily quiz and metrics.
- `src/lib/application/quizzes`: use cases with IndexedDB.
- `src/components/features/quizzes`: the `/quizzes` screen.
- `src/hooks/use-quizzes.ts` and `src/hooks/use-quiz-actions.ts`: client-side access to the database.

## Persistence

Normalized tables were added:

- `quizQuestions`
- `quizSessions`
- `quizAnswers`
- `quizMarkedQuestions`

The legacy `quizAttempts` and `quizReviews` tables were preserved for compatibility, but new reviews use `reviews` with `sourceType: "quiz"`.

## Features

- Idempotent seed of the converted old questions.
- A deterministic daily quiz by date.
- Filtered sessions, mistake review and due reviews.
- Objective answers with automatic grading.
- Open/interview answers with self-assessment.
- Flagged questions.
- JSON import/export.
- Real metrics with handling of an insufficient sample.
- Quiz reviews integrated into Review Today.

## Current limitations

- The session is rendered on the `/quizzes` page itself, not in a dedicated `/quizzes/session/[sessionId]` route.
- Time per question already exists in the schema, but the current UI records `0` to avoid a conflict with the React Compiler's purity rule.
- The visual integration with Plan/Dashboard is minimal; the data is available for future refinements.
- The current plan blocks don't yet have `quizIds`, so the per-block "Practice quiz" button depends on enriching the plan's data.
- Import does a simple merge without a visual preview.
