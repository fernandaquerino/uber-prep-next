# Quizzes Feature

## `/quizzes` page

The page contains:

- A header.
- A real summary.
- The daily quiz.
- Practice actions.
- Quick filters.
- The question bank.
- An interactive session.

## Flows

### Daily quiz

Selects up to 10 questions deterministically for the current day. Prioritizes due reviews, mistakes and flagged ones.

### New session

Creates a session with the filtered questions.

### Review mistakes

Creates a session with questions derived from history with a score lower than 1.

### Due reviews

Creates a session from questions with an overdue `ReviewRecord`.

## States

- Loading with a skeleton.
- Error with retry.
- Insufficient data for metrics.
- Session in progress.
- Empty filtered bank.
