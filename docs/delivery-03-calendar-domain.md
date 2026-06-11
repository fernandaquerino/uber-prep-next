# Entrega 03 — Domínio de Calendário e Agenda

## Contexto

Esta entrega cria o domínio puro responsável por transformar `plan + startDate + weekdayAvailability` em uma agenda cronológica correta. O código não depende de React, componentes, hooks, Dexie, IndexedDB, `localStorage`, `window` ou `document`.

O domínio fica em `src/lib/domain/schedule` porque o repositório já concentra infraestrutura e regras compartilhadas em `src/lib`. A UI não foi alterada.

## Problema do app antigo

O app antigo misturava data real, posição sequencial do plano e progresso. Isso fazia `11/06/2026`, uma quinta-feira, aparecer como segunda-feira, além de atribuir capacidade de dia útil a sábados e consumir conteúdo em dias de descanso.

O cenário de regressão agora é coberto por testes:

| Data       | Dia real      | Capacidade |
| ---------- | ------------- | ---------: |
| 2026-06-11 | quinta-feira  |        480 |
| 2026-06-12 | sexta-feira   |        480 |
| 2026-06-13 | sábado        |        240 |
| 2026-06-14 | domingo       |   descanso |
| 2026-06-15 | segunda-feira |        480 |

## Conceitos

- **Data real**: dia civil no formato `YYYY-MM-DD`. Determina dia da semana, descanso e capacidade.
- **Dia sequencial do plano**: posição do conteúdo, como `sequence: 1`, `sequence: 2`.
- **Progresso**: avanço real da pessoa. Não foi implementado nesta entrega.

O calendário avança com o tempo, mas o conteúdo do plano só avançará futuramente quando houver decisão explícita de progresso.

## Arquitetura

Arquivos criados:

- `schedule.types.ts`: contratos do domínio.
- `calendar-date.ts`: operações únicas para datas civis.
- `weekdays.ts`: lista de dias e timezone padrão.
- `availability.ts`: disponibilidade semanal e busca por dias de estudo.
- `schedule-builder.ts`: scheduler inicial.
- `schedule-selectors.ts`: selectors puros para consulta e agrupamento.
- `schedule.errors.ts`: erros tipados.
- `index.ts`: barrel exports.

## Datas civis e timezone

O tipo `CalendarDate` é branded e validado. Datas de dia civil são armazenadas como `YYYY-MM-DD`.

O domínio evita `new Date("YYYY-MM-DD")`. As operações usam parsing próprio e `Date.UTC(...)` centralizado para evitar conversão acidental por timezone local. A timezone padrão do produto é `America/Sao_Paulo`, mas nesta entrega as operações são estritamente sobre datas civis, não timestamps.

## Configuração semanal

A disponibilidade padrão fica centralizada em `DEFAULT_WEEKDAY_AVAILABILITY`:

- segunda a sexta: 480 minutos;
- sábado: 240 minutos;
- domingo: descanso.

A configuração pode ser substituída por chamada de função. O domínio valida semana sem dias habilitados, minutos negativos e dia habilitado com zero minutos.

## Decisões do Scheduler

### Dias de descanso aparecem na agenda

Os dias desabilitados entram no array como `isRestDay: true`, sem itens. Isso prepara calendário visual, relatórios, heatmap e mensagens como “amanhã é descanso”.

A agenda termina no dia em que o último conteúdo é agendado. Descansos após o último conteúdo não são gerados.

### Um `StudyPlanDay` por data habilitada

A entrega usa a Estratégia A: cada `StudyPlanDay` ocupa uma data habilitada. Blocos não são divididos automaticamente.

Se o total estimado exceder a capacidade do dia, o scheduler mantém os blocos juntos e marca `capacityStatus: "over_capacity"`.

Essa escolha preserva a organização do plano antigo e deixa divisão automática para uma regra explícita futura.

## Validações e Erros

Erros tipados:

- `InvalidCalendarDateError`;
- `InvalidAvailabilityError`;
- `NoStudyDaysEnabledError`;
- `InvalidStudyPlanError`.

Validações implementadas:

- data inicial inválida;
- timezone vazia;
- semana totalmente desabilitada;
- minutos negativos;
- dia habilitado com zero minutos;
- plano sem ID;
- sequência inválida;
- sequência duplicada;
- bloco sem ID;
- ID de bloco duplicado;
- duração negativa ou não finita.

Plano sem dias retorna agenda vazia. Esse comportamento é permitido porque uma importação parcial ou bootstrap inicial pode ainda não ter conteúdo carregado.

## Selectors

Foram adicionados selectors puros para:

- buscar dia por data;
- obter primeiro e último dia de estudo;
- obter próximo e anterior dia de estudo;
- calcular status `past | today | future` recebendo `today` por argumento;
- obter range da agenda;
- agrupar por semana real, de segunda a domingo.

## Limitações

Ainda não existem:

- progresso persistido;
- conclusão de blocos;
- atraso real;
- reagendamento;
- mover plano para frente;
- pular conteúdo;
- revisões;
- integração com Dashboard, Plano ou Revisar Hoje.

Essas regras pertencem às próximas entregas.

## Testes Herdados

O caminho do repositório antigo veio como placeholder (`<CAMINHO_DO_REPOSITORIO_ANTIGO>`), então ele não foi consultado. Os cenários foram implementados a partir da especificação da entrega, descartando qualquer comportamento antigo que vinculava datas a labels fixos.

## Preparação para Entrega 04

O scheduler já expõe contratos que podem receber progresso futuramente, mas não antecipa regras de progresso. A Entrega 04 deve consumir esta agenda como base e adicionar decisões explícitas de conclusão, atraso, reagendamento, pulo e histórico.
