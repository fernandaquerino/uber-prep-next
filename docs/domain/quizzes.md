# Domínio de Quizzes

## Entidades

- `QuizQuestionRecord`: conteúdo da questão.
- `QuizSessionRecord`: sessão de prática.
- `QuizAnswerRecord`: resposta/draft por sessão e questão.
- `QuizAttemptRecord`: resumo histórico de sessão concluída.
- `ReviewRecord`: revisão espaçada central, usando `sourceType: "quiz"`.

## Tipos de questão

- `single_choice`
- `multiple_choice`
- `true_false`
- `open_text`
- `interview`

## Correção

Questões objetivas são corrigidas por funções puras:

- `correctSingleChoiceAnswer`
- `correctMultipleChoiceAnswer`
- `correctTrueFalseAnswer`

Questões abertas e interview exigem `QuizSelfAssessment`:

- `incorrect = 0`
- `partial = 0.5`
- `correct = 1`

## Revisão espaçada

O módulo não cria uma segunda regra de repetição. Ele usa o domínio central de reviews:

```ts
sourceType: "quiz";
sourceId: question.id;
```

Respostas erradas/parciais agendam revisão curta. Respostas corretas avançam o ciclo central.
