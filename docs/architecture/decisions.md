# Decisões de Arquitetura — Uber Prep Next.js

## Por que Next.js

Next.js com App Router fornece Server Components por padrão, roteamento por convenção de arquivos, otimização de imagens, `next/font` e uma boa experiência de desenvolvimento com TypeScript. A alternativa (Vite + React Router) exigiria configuração manual de muitas dessas funcionalidades.

## Por que App Router

O App Router é o modelo atual do Next.js (desde v13). Ele permite Server Components, layouts aninhados, colocação de loading/error por rota, e melhor streaming. O Pages Router está em modo de manutenção.

## Por que Server Components por padrão

Server Components reduzem o JavaScript enviado ao cliente. A maioria das páginas deste app são leitura de dados — não precisam de interatividade no servidor. `"use client"` é adicionado apenas onde há estado de browser: sidebar mobile (Sheet), toggle de tema, dropdowns e dialogs.

## Por que local-first com IndexedDB (entregas futuras)

O app não tem backend. Todos os dados de estudo ficam no dispositivo do usuário. IndexedDB (via Dexie) é necessário porque:

- localStorage tem limite de ~5–10 MB (áudios de mock excedem isso)
- IndexedDB suporta Blob nativo (áudio sem base64)
- Dexie oferece tipagem forte, migrations e queries compostas

Na Entrega 01 não há persistência — ela é adicionada na Entrega 02 junto com o schema Dexie e o script de migração do localStorage existente.

## Por que não adicionar persistência na Entrega 01

A fundação deve ser estável antes de adicionar camadas de dados. Introduzir Dexie + migration script na mesma entrega que o layout e as rotas cria superfície de falha grande. O schema de dados precisa ser definido após mapear os domínios (calendário, progresso, flashcards) nas Entregas 03–04.

## Por que separar features

A estrutura `src/features/<nome>/` coloca tudo relacionado a uma funcionalidade junto (componentes, hooks, tipos, utils). Isso facilita encontrar código, medir complexidade por feature e remover uma feature sem tocar no resto.

## Estratégia de testes

- **Vitest + React Testing Library**: testes unitários de componentes, utilitários e domain logic. Ambiente jsdom. Sem testes de implementação interna.
- **Playwright**: testes E2E de fluxos reais no browser. Foco em navegação, tema e mobile. Roda contra build de produção para garantir que o build não quebra nada.
- **Cobertura**: priorizar `lib/domain/` (lógica pura) com ≥ 90% e componentes compartilhados com ≥ 80%.

## Domínio de calendário

O domínio de calendário fica em `src/lib/domain/schedule` porque é lógica pura compartilhada por Plano, Dashboard, Revisar Hoje e relatórios futuros. Ele não importa React, hooks, componentes, Dexie, repositories ou APIs de browser.

Datas civis usam o formato `YYYY-MM-DD` com tipo branded `CalendarDate`. Operações como parse, soma de dias, comparação, diferença e dia da semana são centralizadas em `calendar-date.ts`. O domínio evita `new Date("YYYY-MM-DD")`, pois essa forma é interpretada como UTC e pode deslocar datas em algumas timezones.

O scheduler inicial usa um `StudyPlanDay` por data habilitada e inclui dias de descanso na agenda. Essa decisão preserva a estrutura do plano antigo e permite que a UI futura mostre semanas reais, descanso e próximo dia de estudo sem inventar regras de progresso.

## Estratégia de tema

`next-themes` com `attribute="class"` adiciona `.dark` no `<html>`. A preferência é persistida no `localStorage` automaticamente. `suppressHydrationWarning` previne flash de hidratação. CSS variables no `:root` e `.dark` do globals.css controlam todas as cores — nenhuma cor hardcoded em componentes.

## Estratégia de componentes

- `src/components/ui/`: shadcn/ui primitivos (gerados). Não editar diretamente.
- `src/components/layout/`: shell do app (header, sidebar, mobile-nav, providers).
- `src/components/feedback/`: estados compartilhados (EmptyState, ErrorState, LoadingState, ComingSoonState, PageHeader).
- `src/features/*/`: componentes específicos de feature, agrupados por domínio.
- Sem estilos inline. Todos os estilos via Tailwind. Tokens em CSS variables.
