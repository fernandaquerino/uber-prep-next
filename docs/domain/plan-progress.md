# Domínio de Progresso do Plano

O domínio de progresso vive em `src/lib/domain/progress` e não depende de React, Dexie, repositories ou APIs do navegador.

## Estados

O status persistido do bloco representa execução:

- `pending`;
- `in_progress`;
- `completed`;
- `stuck`;
- `skipped`.

Reagendamento é representado por `scheduledDate`, `originalScheduledDate`, `ScheduleOverride` e histórico.

## Status do Dia

O status do dia é derivado dos blocos:

- todos pendentes ou sem blocos: `not_started`;
- algum em andamento: `in_progress`;
- todos concluídos: `completed`;
- todos pulados: `skipped`;
- algum travado sem em andamento: `stuck`;
- misturas de concluído, pulado e pendente: `partial`.

## Métricas

`completionPercentage` considera apenas concluídos.

`resolutionPercentage` considera concluídos + pulados, para diferenciar “feito” de “decidido”.

## Undo

Eventos guardam snapshots antes/depois. O undo cria novo evento `undone`; histórico não é apagado.
