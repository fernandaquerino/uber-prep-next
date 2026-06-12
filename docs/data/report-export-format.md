# Formato de exportação de relatório

## Markdown

Nome sugerido:

```text
uber-prep-semana-{numero}-{inicio}.md
```

Seções:

1. título, período, status e data de geração;
2. tabela de métricas;
3. tempo por categoria;
4. tópicos fortes;
5. tópicos de risco;
6. reflexão;
7. próximos passos.

Valores sem evidência são exportados como `Dados insuficientes`.

## Snapshot IndexedDB

Tabela:

```text
weeklyReportSnapshots
```

Campos:

```ts
type WeeklyReportSnapshotRecord = {
  id: string;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  reportJson: string;
};
```

Snapshots são incluídos no backup geral. Backups antigos sem essa coleção
continuam válidos e recebem uma lista vazia durante a validação.
