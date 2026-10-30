# Quizzes Domain

## Entities

- `QuizQuestionRecord`: the question's content.
- `QuizSessionRecord`: a practice session.
- `QuizAnswerRecord`: an answer/draft per session and question.
- `QuizAttemptRecord`: a historical summary of a completed session.
- `ReviewRecord`: the central spaced-repetition review, using `sourceType: "quiz"`.

## Question types

- `single_choice`
- `multiple_choice`
- `true_false`
- `open_text`
- `interview`

## Grading

Objective questions are graded by pure functions:

- `correctSingleChoiceAnswer`
- `correctMultipleChoiceAnswer`
- `correctTrueFalseAnswer`

Open and interview questions require a `QuizSelfAssessment`:

- `incorrect = 0`
- `partial = 0.5`
- `correct = 1`

## Spaced repetition

The module doesn't create a second repetition rule. It uses the central reviews domain:

```ts
sourceType: "quiz";
sourceId: question.id;
```

Wrong/partial answers schedule a short review. Correct answers advance the central cycle.
