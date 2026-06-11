# Entrega 06 — Dashboard

## Objetivo

Implementar o Dashboard funcional, consistente com a Página Plano, orientado à ação e sem métricas falsas.

## Princípios

- Usa os **mesmos selectors** da página Plano (`getCurrentStudyState`, `getPlanCompletionSummary`, `getOverduePlanItems`)
- Usa o **mesmo `getEffectiveSchedule`** da camada de aplicação
- Se o Plano diz que o item atual é X, o Dashboard também mostra X
- Sem readiness sem dados suficientes
- Sem métricas de timer, flashcards ou quizzes (módulos ainda não implementados)
- Recomendações são **determinísticas**: baseadas em contagens reais

## Arquitetura

### Camadas

```
DB (IndexedDB)
  ↓
getEffectiveSchedule() — application/progress
  ↓
progress-selectors.ts — domain/progress (puro, testável)
  ↓
getDashboardData() — application/dashboard (agrega)
  ↓
getDashboardRecommendations() — application/dashboard (regras)
  ↓
useDashboard() — hook (estado loading/ready/error)
  ↓
DashboardScreen → componentes
```

### Hierarquia de conteúdo

1. **Item atual de estudo** (`DashboardCurrentStudy`) — pendente ou em andamento
2. **Recomendações** (`DashboardRecommendations`) — determinísticas e priorizadas
3. **Métricas em grid** — Hoje | Progresso do plano | Sequência
4. **Atrasados** (`DashboardOverdue`) — somente se existirem
5. **Próximos** (`DashboardUpcoming`) — os 3 próximos blocos
6. **Calendário de atividade** (`DashboardActivityCalendar`) — heatmap de blocos concluídos

## Definições explícitas

### Streak (sequência)

Dias de estudo consecutivos com ao menos 1 bloco concluído, contando a partir de hoje em direção ao passado. **Dias de descanso não quebram a sequência** (são transparentes). Dias futuros são ignorados.

```ts
function computeStreak(activityDays: ActivityDay[], today: CalendarDate): DashboardStreak
```

### Calendário de atividade

Métrica: **blocos concluídos por dia** (não horas, não sessões estimadas).

Intensidade:
- 0 blocos → cinza claro
- 1 bloco → verde 200
- 2 blocos → verde 400
- 3+ blocos → verde 600

Dias de descanso aparecem em cor neutra distinta.

### Recomendações

| ID | Prioridade | Condição |
|----|-----------|----------|
| `overdue_items` | alta | `overdueItems.length > 0` |
| `stuck_items` | alta | `stuck > 0` |
| `continue_in_progress` | média | `inProgress > 0` |
| `start_next` | média | `inProgress === 0 && currentItem && overdueItems.length === 0` |
| `on_track` | baixa | sem atrasos, sem travamentos, com blocos pendentes |
| `plan_complete` | baixa | `isPlanCompleted` |

Ordenação: alta → média → baixa.

## Estados da tela

| Estado | Quando |
|--------|--------|
| `loading` | Primeira carga (`useState` inicial) |
| `no_start_date` | Settings sem `startDate` |
| `error` | Exception no `getDashboardData` |
| `ready` | Dados carregados com sucesso |

Refresh (botão) usa stale-while-revalidate: só incrementa `rev`, não define `loading`. Dados antigos ficam visíveis durante o re-fetch.

## Componentes criados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `dashboard-current-study.tsx` | Item atual/próximo + último concluído |
| `dashboard-today-progress.tsx` | Progresso do dia (count + minutos + %) |
| `dashboard-progress.tsx` | Completion % do plano todo |
| `dashboard-streak.tsx` | Sequência atual + recorde |
| `dashboard-recommendations.tsx` | Lista priorizada de recomendações |
| `dashboard-overdue.tsx` | Blocos atrasados (top 5 + link) |
| `dashboard-upcoming.tsx` | Próximos 3 blocos futuros |
| `dashboard-activity-calendar.tsx` | Heatmap de atividade |
| `dashboard-screen.tsx` | Orquestrador com estados loading/empty/error |
