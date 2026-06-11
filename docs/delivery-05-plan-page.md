# Entrega 05 — Página Plano

## Objetivo

Construir a Página Plano (`/plano`) completa, funcional e persistida, que consome exclusivamente:

- agenda efetiva do domínio
- progresso persistido no IndexedDB
- casos de uso da camada de aplicação
- hooks de orquestração

A página não deriva lógica de calendário, progresso, atraso ou capacidade diretamente.

---

## Arquitetura

```
src/
  lib/
    data/
      study-plan.ts          # Converte WEEKS → StudyPlan (adaptador)
    application/
      progress/
        change-start-date.ts # Caso de uso: alterar data de início
        index.ts             # Re-exporta change-start-date

  hooks/
    use-plan-page.ts         # Carrega e agrega dados da página
    use-plan-actions.ts      # Expõe ações com callback onSuccess/onError

  components/
    features/
      plan/
        plan-screen.tsx            # Orquestrador (Client Component)
        plan-header.tsx            # Cabeçalho com data de início
        plan-summary.tsx           # Progresso geral + métricas
        plan-current-item.tsx      # Bloco atual + alertas de atraso
        plan-week-navigation.tsx   # Navegação entre semanas
        plan-week.tsx              # Semana selecionada com dias
        plan-day-card.tsx          # Card de dia expandível
        plan-block-card.tsx        # Card de bloco com ações rápidas
        plan-block-details.tsx     # Dialog de detalhes + formulários
        plan-block-form.tsx        # Formulário de conclusão
        skip-block-dialog.tsx      # Dialog de confirmação para pular
        reschedule-dialog.tsx      # Dialog de reagendamento
        missed-day-dialog.tsx      # Dialog para dia perdido (4 estratégias)
        change-start-date-dialog.tsx # Dialog para alterar data de início
        plan-utils.ts              # Utilitários de formatação (sem regras de negócio)
        __tests__/
          plan-utils.test.ts

  app/
    (app)/
      plano/
        page.tsx    # Server Component (metadata + PlanScreen)
        loading.tsx # Skeleton de loading
        error.tsx   # Error boundary
```

---

## Fluxo de dados

```
IndexedDB (settings, planProgress, progressEvents, scheduleOverrides)
  ↓
use-plan-page.ts
  buildStudySchedule(STUDY_PLAN, config)   → ScheduledStudyDay[]
  getEffectiveSchedule(db, baseSchedule)   → EffectiveScheduledDay[]
  groupScheduleByCalendarWeek(effective)   → ScheduledWeek[]
  getCurrentStudyState(effective)          → CurrentStudyState
  getPlanCompletionSummary(effective)      → PlanCompletionSummary
  ↓
PlanScreen (state: loading | error | no_start_date | ready)
  ↓
PlanHeader / PlanSummary / PlanCurrentItem / PlanWeekNavigation / PlanWeek
  → PlanDayCard → PlanBlockCard → dialogs
```

---

## Adaptador do plano (`study-plan.ts`)

Converte `WEEKS` (formato legado com pausas) para `StudyPlan` do domínio:

- Filtra blocos com `category === null` ou `type === "pausa"`
- Gera IDs estáveis: `block-{dayNumber}-{idx}` e `day-{dayNumber}`
- 36 dias com sequências 1–36 sem duplicatas

---

## Novo caso de uso: `changeStartDate`

Localização: `src/lib/application/progress/change-start-date.ts`

Opções:

- `restart`: apaga todo progresso, recria do zero na nova data
- `recalculate_maintaining`: move blocos `pending` para novas datas, preserva `completed`/`stuck`/`in_progress`/`skipped`

Sempre usa transação Dexie para atomicidade.

---

## Componentes e estados

### `PlanScreen`

Estado global da página:

- `loading` → `PlanSkeleton` com skeletons
- `error` → `EmptyState` com botão "Tentar novamente"
- `no_start_date` → `EmptyState` com botão para configurar data
- `ready` → interface completa

### `PlanDayCard`

- Expandível por padrão apenas no dia de hoje
- Mostra badges: Hoje, Passado, Concluído, Atraso, Acima da capacidade
- Dia de descanso mostra `MoonIcon` e texto explicativo, sem ações
- Dias passados com pendências mostram botão "Não estudei neste dia"

### `PlanBlockCard`

Ações por status:

- `pending` → Iniciar, Concluir, Travei, Reagendar, Pular
- `in_progress` → Concluir, Travei, Pausar, Reagendar, Pular
- `stuck` → Concluir mesmo assim, Retomar, Reagendar, Pular
- `completed` → Desfazer (via `returnToPending`)
- `skipped` → Restaurar

### `PlanBlockDetails`

Dialog com três views:

- `details` → informações completas + ações
- `complete` → `PlanBlockForm` (minutos, dificuldade, confiança, notas, padrão)
- `stuck` → formulário simplificado

---

## Formulário de conclusão

Campos:

- Minutos reais (number, ≥ 0, opcional)
- Dificuldade 1–5 com labels descritivos (botões acessíveis com `aria-pressed`)
- Confiança 1–5 com labels descritivos
- Padrão usado (texto livre)
- Notas (textarea)

Validação via state controlado — sem react-hook-form (não instalado).

---

## Tratamento de dia perdido

`MissedDayDialog` oferece 4 estratégias:

1. `shift_pending` — move pendentes para frente preservando descanso
2. `keep_overdue` — mantém datas, aparece como atraso
3. `skip_items` — pula conteúdos pendentes
4. `reschedule_items` — reagendar individualmente (delegado ao usuário)

Cada estratégia chama `handleMissedStudyDay` do caso de uso existente.

---

## Reagendamento

`RescheduleDialog`:

- Alerta visual para dias de descanso (bloqueia confirmação)
- Alerta visual para acima da capacidade (permite confirmar)
- Capacidade calculada localmente a partir do `baseSchedule` (sem re-derivar regra do domínio)

---

## Alteração da data de início

`ChangeStartDateDialog`:

- Sem progresso → aplica `restart` (comportamento simplificado)
- Com progresso → escolha entre `recalculate_maintaining` e `restart`
- `restart` exibe aviso de confirmação reforçado

---

## Undo

- Ações toast com botão "Desfazer" planejado mas não conectado nesta versão
- `undoProgressAction` disponível via `usePlanActions`

---

## Acessibilidade

- Todos os botões têm `aria-label` descritivo
- Ratings usam `aria-pressed` (não só cor)
- Dias de descanso não expõem ações inválidas
- Dialogs usam `<DialogTitle>` e `<DialogDescription>`
- Status `role="alert"` em mensagens de erro
- `role="radiogroup"` e `role="radio"` em seleções de estratégia

---

## Responsividade

- 375px: cards empilhados, navegação compacta, sem overflow horizontal
- 768px: layout de 2 colunas nas métricas
- 1024px+: aproveitamento de largura

---

## Testes

### Unitários

- `plan-utils.test.ts`: formatação de datas, minutos, weekdays, status labels
- `study-plan.test.ts`: estrutura do STUDY_PLAN + cenário de regressão com 2026-06-11

### Integração

- `plan-progress.test.ts`: fluxo completo (inicializar → iniciar → concluir → skip → restore → dia perdido → reagendar → desfazer)
- Usa `fake-indexeddb` para isolamento

### E2E (Playwright)

- `plan.spec.ts`: 6 grupos de cenários cobrindo navegação, mobile, dialogs, acessibilidade

---

## Cenário de regressão obrigatório

```
startDate = 2026-06-11 (quinta-feira)

Dia 1 → quinta-feira, 11/06/2026 — 480 min
Dia 2 → sexta-feira, 12/06/2026 — 480 min
Dia 3 → sábado, 13/06/2026 — 240 min
domingo, 14/06/2026 → descanso, 0 min, sem itens
Dia 4 → segunda-feira, 15/06/2026 — 480 min
Dia 5 → terça-feira, 16/06/2026 — 480 min
```

Verificado em `study-plan.test.ts` (buildStudySchedule) e `plan-progress.test.ts`.

---

## Limitações

- Undo via toast não está completamente conectado (infraestrutura pronta, UI parcial)
- Filtros por status/categoria/busca estão modelados mas não renderizados como UI
- Opção `reschedule_items` no dia perdido abre o dialog mas não guia cada bloco individualmente
- Timer funcional não implementado (planejado para Entrega seguinte)
- Dashboard, Revisar Hoje, revisão espaçada não foram antecipados

---

## Preparação para Entrega 06

- `usePlanActions` e `usePlanPage` já expõem todas as ações necessárias para Dashboard
- `PlanCompletionSummary` e `CurrentStudyState` prontos para reutilização
- `STUDY_PLAN` e `buildStudySchedule` já estabilizados
- Não há dependência circular entre os domínios
