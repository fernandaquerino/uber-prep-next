# Formato de Questões de Quiz

## Formato normalizado

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

## Regras

- Opções têm IDs estáveis gerados a partir do ID da questão.
- Questões abertas não têm resposta correta objetiva.
- `referenceAnswer` é usado apenas para autoavaliação humana.
- `lifecycleStatus: "archived"` preserva histórico e remove da prática padrão.
