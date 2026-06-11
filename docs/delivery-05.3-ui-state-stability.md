# Entrega 05.3 — Estabilidade do estado de UI da Página Plano

## Sintoma

Ao interagir com qualquer bloco (iniciar, concluir, salvar anotação, salvar solução, etc.) a interface apresentava:

- Modal fechando automaticamente.
- Página piscando (flicker de skeleton → conteúdo).
- Semana recolhida.
- Dias expandidos fechando.
- Scroll voltando ao topo.
- Filtros rápidos sem efeito visual.

## Causa raiz identificada

### Causa 1 — `refresh()` forçava `status: "loading"` (primária)

`src/hooks/use-plan-page.ts`:

```ts
// ANTES (incorreto)
const refresh = useCallback(() => {
  setState({ status: "loading" }); // ← força skeleton global
  setRev((r) => r + 1);
}, []);
```

Definir `status: "loading"` fazia `PlanScreen` renderizar `<PlanSkeleton />` em vez do conteúdo. Isso **desmontava toda a árvore**: modal, dias, semanas, filtros. Todo o estado local se perdia.

**Correção**: remover a linha `setState({ status: "loading" })` do callback. O estado inicial `"loading"` já é definido pelo `useState` na primeira montagem e não precisa ser repetido em cada refresh.

```ts
// DEPOIS (correto)
const refresh = useCallback(() => {
  setRev((r) => r + 1);
}, []);
```

### Causa 2 — `doAction` fechava o modal após toda ação (secundária)

`src/components/features/plan/plan-block-details.tsx`:

```ts
// ANTES (incorreto)
async function doAction(fn: () => Promise<void>) {
  setLoading(true);
  try {
    await fn();
    onActionDone();
    handleClose(); // ← fechava modal após toda ação bem-sucedida
  } finally {
    setLoading(false);
  }
}
```

`handleClose()` resetava view, aba ativa e chamava `setOpenBlockId(null)`, fechando o modal.

**Correção**: remover `handleClose()` de `doAction`. Retornar para a view "details" (sair de sub-formulários de conclusão/trava) sem fechar o modal:

```ts
// DEPOIS (correto)
async function doAction(fn: () => Promise<void>) {
  setLoading(true);
  try {
    await fn();
    setView("details"); // sai de sub-formulários; preserva activeTab
  } finally {
    setLoading(false);
  }
}
```

O `refresh` interno já é acionado por `usePlanActions.wrap → onSuccess` e não precisa de chamada adicional (`onActionDone` foi removido).

### Causa 3 — Filtros recaíam na agenda base (bug de filtragem)

`src/components/features/plan/plan-week.tsx`:

```ts
// ANTES (incorreto)
const dayMap = new Map(effectiveDays.map((d) => [d.date, d]));
{week.days.map((baseDay) => {
  const effectiveDay = dayMap.get(baseDay.date) ?? {
    ...baseDay,
    items: baseDay.items.map(...) // fallback com TODOS os itens da agenda base!
  };
})}
```

Quando um dia não tinha itens no `filteredEffectiveSchedule`, o fallback usava todos os itens da agenda base, tornando o filtro ineficaz visualmente.

**Correção**: nova prop `isFiltered`. Quando ativa, dias não presentes em `effectiveDays` são omitidos em vez de usar o fallback:

```ts
// DEPOIS (correto)
if (!effectiveDay && isFiltered) return null; // pula dia sem itens filtrados
const day = effectiveDay ?? fallback(baseDay, today);
```

## Componentes envolvidos

| Componente               | Papel no problema                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `use-plan-page.ts`       | Causa 1: `refresh()` → `setState("loading")`                                            |
| `plan-block-details.tsx` | Causa 2: `doAction` → `handleClose()`                                                   |
| `plan-week.tsx`          | Causa 3: fallback para agenda base em dias filtrados                                    |
| `plan-screen.tsx`        | Receptor: passa `isFiltered`, remove `onActionDone`, reseta estado no `changeStartDate` |

## Estratégia de estado de UI

### Modal controlado por ID

```ts
const [openBlockId, setSelectedBlockId] = useState<string | null>(null);
const openBlock = effectiveSchedule.flatMap((d) => d.items).find((b) => b.blockId === openBlockId);
```

O modal abre/fecha pelo `openBlockId`, não pela referência do bloco. Quando os dados são re-buscados, o bloco é encontrado pelo mesmo ID com status atualizado. O modal permanece aberto.

### Tabs do modal — estado local preservado

`view` e `activeTab` são estado local de `PlanBlockDetails`. Como o componente não desmonta durante refresh (Causa 1 resolvida), esses estados são preservados entre mutações.

`handleClose()` reseta ambos apenas no fechamento explícito (Fechar, Escape, clicar fora).

### Accordions dos dias — estado local preservado

`open` é estado local de `PlanDayCard` com `key={baseDay.date}`. Como o componente não desmonta durante refresh (Causa 1 resolvida), o estado é preservado. Nenhuma mudança de key ou lifting necessário.

### Semana selecionada

`selectedWeekId` é inicializado com `prev ?? result.data.initialWeekId` no primeiro carregamento. Subsequentes refreshes usam `prev ?? ...`, preservando a seleção manual do usuário.

Resetado apenas quando `changeStartDate` é chamado (a agenda inteira muda).

### Loading inicial vs. mutation

| Situação                | Comportamento                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Primeira carga          | `useState({ status: "loading" })` → skeleton                                        |
| Refresh após mutação    | `setRev(r+1)` → dados antigos ficam visíveis; atualização chega em background       |
| Mudança de data inicial | Reset explícito de `openBlockId` e `selectedWeekId`; novo `initialWeekId` calculado |

### Scroll

Não há navegação de rota durante mutações. O scroll é preservado naturalmente porque o DOM não é desmontado.

### Keys e identidade

Todos os componentes usam keys estáveis:

- `PlanDayCard`: `key={baseDay.date}` (data imutável)
- `PlanBlockCard`: `key={block.blockId}` (ID do domínio)
- `PlanWeek`: não possui key próprio (única instância)

### Formulários

Botões dentro de formulários sem `type="button"` e sem `onSubmit` usando `e.preventDefault()` poderiam causar reload. Revisado: todos os botões de ação estão corretamente tipados.

## Modal — tabela de ações

| Ação                 | Modal permanece?                 |
| -------------------- | -------------------------------- |
| Iniciar              | ✅ Sim                           |
| Concluir             | ✅ Sim                           |
| Marcar que travou    | ✅ Sim                           |
| Voltar para pendente | ✅ Sim                           |
| Pausar               | ✅ Sim                           |
| Salvar anotações     | ✅ Sim                           |
| Salvar solução       | ✅ Sim                           |
| Reagendar            | ✅ Sim (via dialog separado)     |
| Pular                | ✅ Sim (via dialog separado)     |
| Restaurar            | ✅ Sim                           |
| Desfazer             | ✅ Sim                           |
| Fechar               | ❌ Fecha (comportamento correto) |
| Escape               | ❌ Fecha (comportamento correto) |
| Clicar fora          | ❌ Fecha (comportamento correto) |

## Testes

### Testes de regressão (unitários)

172 testes existentes — todos passando após as correções.

### Testes E2E novos

`tests/e2e/plan-stability.spec.ts`:

1. **05.3.1** — Modal não fecha após iniciar bloco; semana selecionada mantida.
2. **05.3.2** — Aba Anotações permanece após salvar.
3. **05.3.3** — Aba Solução permanece após salvar.
4. **05.3.4** — Accordion do dia não fecha após ação.
5. **05.3.5** — Filtros (em andamento) mostram apenas blocos correspondentes.
6. **05.3.6** — Modal estável em viewport mobile (375px).

Todos os testes são condicionais: pulam caso o plano não esteja carregado (sem data de início configurada).

## Arquivos modificados

| Arquivo                                               | Alteração                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/use-plan-page.ts`                          | Remove `setState({ status: "loading" })` de `refresh()`; expõe `setSelectedWeekId(id: string \| null)`                    |
| `src/components/features/plan/plan-block-details.tsx` | Remove `onActionDone` prop; remove `handleClose()` de `doAction`; adiciona `setView("details")`                           |
| `src/components/features/plan/plan-week.tsx`          | Adiciona prop `isFiltered`; pula dias sem itens quando filtrando                                                          |
| `src/components/features/plan/plan-screen.tsx`        | Passa `isFiltered` para `PlanWeek`; remove `onActionDone` de `PlanBlockDetails`; reseta estado em `handleChangeStartDate` |

## Arquivos criados

| Arquivo                                    | Conteúdo                     |
| ------------------------------------------ | ---------------------------- |
| `tests/e2e/plan-stability.spec.ts`         | 6 testes E2E de estabilidade |
| `docs/delivery-05.3-ui-state-stability.md` | Este documento               |

## Regressões verificadas

- Fechar modal com Escape/Fechar continua funcionando.
- Sub-formulários de conclusão e trava continuam funcionando.
- Reagendamento e pular (dialogs separados) continuam funcionando.
- Filtro "Todos" continua mostrando todos os dias/blocos.
- Semana é inicializada na semana atual na primeira carga.
- Mudança de data inicial reseta semana e bloco aberto.
