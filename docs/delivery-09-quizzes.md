# Entrega 09 — Quizzes

## Resumo

Implementa o módulo de quizzes local-first com questões normalizadas, sessões persistidas, correção automática, autoavaliação, filtros, métricas iniciais e integração com a fila central de revisão.

## Arquitetura adotada

- `src/lib/domain/quizzes`: funções puras de normalização, validação, correção, scoring, filtros, quiz diário e métricas.
- `src/lib/application/quizzes`: casos de uso com IndexedDB.
- `src/components/features/quizzes`: tela de `/quizzes`.
- `src/hooks/use-quizzes.ts` e `src/hooks/use-quiz-actions.ts`: acesso client-side ao banco.

## Persistência

Foram adicionadas tabelas normalizadas:

- `quizQuestions`
- `quizSessions`
- `quizAnswers`
- `quizMarkedQuestions`

As tabelas legadas `quizAttempts` e `quizReviews` foram preservadas para compatibilidade, mas novas revisões usam `reviews` com `sourceType: "quiz"`.

## Funcionalidades

- Seed idempotente das questões antigas convertidas.
- Quiz diário determinístico por data.
- Sessões filtradas, revisão de erros e revisão devidas.
- Respostas objetivas com correção automática.
- Respostas abertas/interview com autoavaliação.
- Questões marcadas.
- Importação/exportação JSON.
- Métricas reais com tratamento de amostra insuficiente.
- Revisões de quiz integradas a Revisar Hoje.

## Limitações atuais

- A sessão é renderizada na própria página `/quizzes`, não em rota dedicada `/quizzes/session/[sessionId]`.
- Tempo por questão já existe no schema, mas a UI atual grava `0` para evitar conflito com a regra de pureza do React Compiler.
- Integração visual com Plano/Dashboard é mínima; os dados ficam disponíveis para próximas refinações.
- Os blocos atuais do plano ainda não possuem `quizIds`, então o botão "Praticar quiz" por bloco depende de enriquecimento dos dados do plano.
- Importação faz merge simples sem preview visual.
