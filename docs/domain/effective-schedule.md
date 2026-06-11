# Agenda Efetiva

A agenda efetiva combina:

- agenda base da Entrega 03;
- progresso dos blocos;
- reagendamentos;
- shifts;
- skips;
- conclusões.

## Exemplo de Dia Perdido

Início: `2026-06-11`, quinta-feira.

Agenda base:

| Conteúdo | Data       |
| -------- | ---------- |
| Dia 1    | 2026-06-11 |
| Dia 2    | 2026-06-12 |
| Dia 3    | 2026-06-13 |
| descanso | 2026-06-14 |
| Dia 4    | 2026-06-15 |
| Dia 5    | 2026-06-16 |

Se Dia 1 foi concluído e sexta foi perdida com `shift_pending`:

| Conteúdo | Data efetiva |
| -------- | ------------ |
| Dia 1    | 2026-06-11   |
| Dia 2    | 2026-06-13   |
| Dia 3    | 2026-06-15   |
| Dia 4    | 2026-06-16   |
| Dia 5    | 2026-06-17   |

Domingo permanece descanso.

## Atraso

Um item está atrasado quando a data efetiva é anterior ao `today` recebido pela função e o status não é `completed` nem `skipped`.

## Capacidade

Reagendamentos e shifts recalculam capacidade por dia. Excesso não bloqueia automaticamente; o dia fica `over_capacity`.
