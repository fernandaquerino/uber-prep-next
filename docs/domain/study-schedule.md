# Domínio de Agenda de Estudos

O domínio de agenda vive em `src/lib/domain/schedule` e é a única fonte para operações de data civil, disponibilidade semanal e geração inicial da agenda.

## Exemplo

Com início em `2026-06-11` e disponibilidade padrão:

```ts
import {
  DEFAULT_WEEKDAY_AVAILABILITY,
  PRODUCT_TIMEZONE,
  buildStudySchedule,
  parseCalendarDate,
} from "@/lib/domain/schedule";

const schedule = buildStudySchedule(plan, {
  startDate: parseCalendarDate("2026-06-11"),
  timezone: PRODUCT_TIMEZONE,
  weekdayAvailability: DEFAULT_WEEKDAY_AVAILABILITY,
});
```

Resultado esperado para cinco dias sequenciais:

| Plan Day | Data       | Dia real      | Observação |
| -------- | ---------- | ------------- | ---------- |
| 1        | 2026-06-11 | quinta-feira  | estudo     |
| 2        | 2026-06-12 | sexta-feira   | estudo     |
| 3        | 2026-06-13 | sábado        | 240 min    |
| —        | 2026-06-14 | domingo       | descanso   |
| 4        | 2026-06-15 | segunda-feira | estudo     |
| 5        | 2026-06-16 | terça-feira   | estudo     |

## Contratos Principais

- `CalendarDate`: data civil validada no formato `YYYY-MM-DD`.
- `WeekdayAvailability`: disponibilidade configurável por dia real da semana.
- `StudyPlan`: plano sequencial mínimo.
- `ScheduledStudyDay`: dia cronológico gerado pelo scheduler.

## Regras

- A data real determina o dia da semana.
- Dias desabilitados não consomem conteúdo.
- Dias de descanso aparecem na agenda sem itens.
- Cada `StudyPlanDay` ocupa uma data habilitada.
- Blocos não são divididos silenciosamente.
- Dias acima da capacidade recebem `capacityStatus: "over_capacity"`.
- O domínio não calcula progresso e não descobre “hoje” sozinho.

## Consulta

Use `schedule-selectors.ts` para buscar dias, próximo estudo, estudo anterior, range e agrupamento semanal. Semanas visuais começam na segunda-feira e terminam no domingo.
