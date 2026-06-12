# Relatórios semanais

## Fonte de verdade

O relatório usa:

- agenda efetiva do Plano;
- evidências consolidadas da Entrega 15;
- `weeklyReflections`;
- `weeklyReportSnapshots`.

Métricas de atividade consideram somente eventos ocorridos entre o início e o
fim da semana. Readiness, Skill Tree, forças e riscos usam evidências acumuladas
até o fim da semana, permitindo acompanhar evolução.

## Ausência de dados

Sem evidência avaliada, quiz accuracy e readiness permanecem nulos. A interface
mostra `Sem dados` ou `Dados insuficientes`, nunca `0%`.

## Reflexão

Editar a reflexão no relatório atualiza o mesmo registro consumido por Revisar
Hoje. Métricas calculadas não são editáveis.

## Snapshots

O relatório ao vivo é sempre derivado. O usuário pode salvar um snapshot por
semana. O snapshot contém o relatório serializado e não é recalculado quando os
dados de origem mudam.

## Impressão

`PDF / Imprimir` usa `window.print()`. Controles de navegação são ocultados e
seções importantes evitam quebra interna.
