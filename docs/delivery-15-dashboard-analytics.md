# Entrega 15 — Dashboard Analytics

## Escopo

A entrega consolida evidências reais de Plano, Revisões, Flashcards, Quizzes,
Playground, Timer, Mocks, Notas, Recursos e Inglês Técnico.

Não foram implementados relatórios semanais nem auditoria final.

## Resultado

- snapshot derivado em memória por atualização do Dashboard;
- readiness geral e por área com estado de dados insuficientes;
- Skill Tree por tópico canônico;
- tópicos de risco e tópicos fortes;
- heatmap de conhecimento;
- métricas por módulo, evolução semanal e tempo por área;
- recomendações determinísticas e explicáveis.

## Performance

As tabelas são lidas uma única vez, em paralelo. O snapshot é calculado na camada
de aplicação e entregue pronto aos componentes. Não há consultas IndexedDB nem
cálculos de domínio durante o render.

Não foi criada tabela de snapshots porque a recomputação atual é simples e evita
sincronização duplicada. Persistência poderá ser considerada se medições futuras
mostrarem necessidade.
