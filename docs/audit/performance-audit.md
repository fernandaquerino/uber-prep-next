# Auditoria de performance

## Verificado

- Monaco é carregado com `dynamic` e `ssr: false`;
- leituras independentes usam `Promise.all`;
- Dashboard e Relatórios derivam dados fora do ciclo de render;
- timer persiste timestamps e não grava a cada tick;
- relatórios processam somente as semanas do plano;
- seeds são idempotentes.

## Decisões

Não foi introduzido cache persistido adicional: o plano padrão possui poucas semanas e a complexidade de invalidação superaria o ganho atual. Snapshots de relatório já evitam perder números históricos.

## Monitoramento

O build de produção é a referência para chunks e rotas. Crescimento futuro de dados deve priorizar paginação de históricos e selectors incrementais.
