# Quiz Question Format

## Normalized format

```ts
type QuizQuestionRecord = {
  id: string;
  prompt: string;
  code?: string;
  type: "single_choice" | "multiple_choice" | "true_false" | "open_text" | "interview";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  group?: string;
  week?: number;
  topicIds: string[];
  tags: string[];
  options?: { id: string; label: string }[];
  correctAnswer?: QuizCorrectAnswerRecord;
  explanation?: string;
  referenceAnswer?: string;
  evaluationCriteria?: string[];
  sourceType: "seed" | "manual" | "flashcard" | "imported";
  sourceId?: string;
  lifecycleStatus: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};
```

## Rules

- Options have stable IDs generated from the question's ID.
- Open questions have no objective correct answer.
- `referenceAnswer` is used only for human self-assessment.
- `lifecycleStatus: "archived"` preserves history and removes it from the default practice.
