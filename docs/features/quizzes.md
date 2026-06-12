# Feature Quizzes

## Página `/quizzes`

A página contém:

- Cabeçalho.
- Resumo real.
- Quiz diário.
- Ações de prática.
- Filtros rápidos.
- Banco de questões.
- Sessão interativa.

## Fluxos

### Quiz diário

Seleciona até 10 questões de forma determinística para o dia atual. Prioriza revisões devidas, erros e marcadas.

### Nova sessão

Cria sessão com as questões filtradas.

### Revisar erros

Cria sessão com questões derivadas do histórico com score menor que 1.

### Revisões devidas

Cria sessão a partir de questões com `ReviewRecord` vencido.

## Estados

- Loading com skeleton.
- Erro com retry.
- Dados insuficientes para métricas.
- Sessão em andamento.
- Banco filtrado vazio.
