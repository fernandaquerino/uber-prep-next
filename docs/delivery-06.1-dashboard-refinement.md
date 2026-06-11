# Entrega 06.1 — Refinamento do Dashboard

## Problemas anteriores corrigidos

| Problema | Solução |
|----------|---------|
| Cards largos com pouco conteúdo | Layout 2-colunas no desktop, cards com densidade adequada |
| Recomendações ocupavam espaço demais | Substituídas por prioridades compactas (max 3 itens) |
| Estado positivo em card grande | Banner inline de 1 linha |
| Calendário de atividade pequeno | Componente dedicado com rows de dias |
| Falta de progresso por categoria | Seção com barra por categoria usando cores reais |
| Falta de resumo semanal | Widget de 7 dias + quick summary na coluna lateral |
| Falta de identidade visual | Bordas coloridas por categoria, indicadores por status |
| Sem período do plano no cabeçalho | Header com data, semana e período |
| Refresh sem feedback | Botão com `Loader2` animado e `isRefreshing` state |

## Nova hierarquia do Dashboard

```
1. Cabeçalho (data · semana · período)
2. Foco do dia + Resumo rápido semanal (2 colunas)
3. Prioridades compactas
4. Progresso geral + Progresso por área (2 colunas)
5. Semana atual — 7 dias
6. Próximos estudos + Atividade (2 colunas)
7. Consistência
```

## Componentes criados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `dashboard-focus.tsx` | Estudo atual (2-col: foco + week quick summary) |
| `dashboard-priorities.tsx` | Prioridades compactas (max 3) |
| `dashboard-progress-section.tsx` | Progresso geral + por área (2 colunas) |
| `dashboard-week-days.tsx` | Vista dos 7 dias da semana atual |
| `dashboard-upcoming-enhanced.tsx` | Próximos estudos com mais contexto |
| `dashboard-activity-enhanced.tsx` | Calendário de atividade com legenda clara |
| `dashboard-consistency.tsx` | Consistência em grid compacto (4 métricas) |

## Componentes removidos

- `dashboard-current-study.tsx` → absorvido em `dashboard-focus.tsx`
- `dashboard-today-progress.tsx` → absorvido no focus
- `dashboard-progress.tsx` → substituído por `dashboard-progress-section.tsx`
- `dashboard-streak.tsx` → substituído por `dashboard-consistency.tsx`
- `dashboard-recommendations.tsx` → substituído por `dashboard-priorities.tsx`
- `dashboard-overdue.tsx` → absorvido em prioridades
- `dashboard-upcoming.tsx` → substituído por `dashboard-upcoming-enhanced.tsx`
- `dashboard-activity-calendar.tsx` → substituído por `dashboard-activity-enhanced.tsx`

## View model

A arquitetura agora usa um `DashboardViewModel` completo com todas as seções pré-computadas. Os componentes recebem apenas dados formatados, sem calcular nada.

```ts
type DashboardViewModel = {
  header: DashboardHeaderViewModel;
  focus: DashboardFocusViewModel;
  weekQuickSummary: DashboardWeekQuickSummary;
  priorities: DashboardPriorityViewModel[];
  progress: DashboardProgressViewModel;
  categoryProgress: DashboardCategoryProgressViewModel[];
  currentWeek: DashboardCurrentWeekViewModel;
  upcoming: DashboardUpcomingItemViewModel[];
  activity: DashboardActivityViewModel;
  consistency: DashboardConsistencyViewModel;
};
```

## Novos selectors de domínio

`src/lib/domain/progress/dashboard-selectors.ts`:

- `getPlanProgressByCategory()` — agrupa itens por categoria
- `getCurrentWeekDays()` — 7 dias da semana atual com status calculado
- `getWeekItemSummary()` — contagens resumidas da semana
- `getUpcomingStudyItems()` — próximos N blocos não concluídos
- `getActivityWeeks()` — semanas de atividade para o heatmap

## Progresso por categoria

Usa exclusivamente dados reais do effective schedule. Categorias com 0 blocos são omitidas. O estado "não iniciado" mostra "Não iniciado · 0/N" em vez de "0%" em card grande.

## Calendário de atividade

- Definição clara: "Cada célula representa a quantidade de blocos concluídos naquele dia."
- Day labels alternados (Seg, Qua, Sex, Dom) para economia de espaço
- Estado vazio com orientação: "Conclua blocos para visualizar sua consistência."

## Consistência

Grid compacto com 4 métricas: sequência atual, recorde, dias esta semana, total de dias estudados.

Tooltip explicando a regra (dias de descanso não quebram a sequência).

## Prioridades

Substituem as antigas "recomendações". Máximo de 3 itens. Estado positivo vira banner inline de 1 linha.

## Refresh sem flicker

O hook `useDashboard` segue o mesmo padrão stale-while-revalidate da Entrega 05.3:
- `refresh()` define `isRefreshing=true` e incrementa `rev`
- O efeito busca novos dados sem tocar no estado `loading`
- Dados existentes permanecem visíveis durante o re-fetch
- Botão mostra `Loader2` animado enquanto `isRefreshing=true`

## Métricas propositalmente omitidas

- Readiness (sem dados suficientes)
- Domínio por tópico (depende de quizzes/mocks)
- Heatmap de conhecimento (depende de múltiplos módulos)
- Skill tree (prematura)
- Métricas de timer, flashcards, quizzes, mocks
- Risco de esquecimento

## Responsividade

- Desktop (≥1024px): layout em 2-3 colunas
- Tablet (768px): layout em 2 colunas onde possível
- Mobile (375px): stack vertical, sem overflow horizontal

## Acessibilidade

- Região semana: `role="list"` com `aria-label` por dia
- Calendário de atividade: `role="img"` com `aria-label`
- `aria-label` em cells individuais com informação legível
- Botão de refresh com `aria-label` dinâmico (estado de carregamento)
- Prioridades com `aria-labelledby`
- Dias de semana com `title` attribute para tooltip nativo
