# Skill Tree

A Skill Tree usa uma taxonomia canônica definida em
`src/lib/data/skill-topics.ts`.

Aliases normalizam tópicos legados, tags livres e títulos do plano.

## Estados

- `not_started`: tópico planejado sem atividade;
- `learning`: primeira evidência;
- `practicing`: múltiplas práticas ou fontes;
- `consistent`: desempenho positivo sustentado;
- `mastered`: conhecimento e retenção altos em pelo menos três fontes;
- `at_risk`: falhas, gaps, revisão atrasada ou confiança baixa.

Cada tópico expõe a explicação, contagem de evidências, fontes, última atividade,
retenção, confiança, tempo e próxima ação.

Risco só é exibido para tópicos presentes no plano.
