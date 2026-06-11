# Uber Prep

Plataforma de preparação para entrevistas de engenharia de software. Local-first, sem backend, sem conta.

> **Estado atual:** Entrega 03 concluída — domínio de calendário e scheduler puro.
> As Entregas 01, 02 e 03 estão concluídas. Progresso, revisões, Dashboard e página Plano funcional ainda não foram implementados.

---

## Stack

| Camada           | Tecnologia                             |
| ---------------- | -------------------------------------- |
| Framework        | Next.js 16 + App Router                |
| Linguagem        | TypeScript strict                      |
| Estilo           | Tailwind CSS v4                        |
| Componentes      | shadcn/ui + Radix UI                   |
| Ícones           | Lucide React                           |
| Tema             | next-themes                            |
| Notificações     | Sonner                                 |
| Testes unitários | Vitest + React Testing Library         |
| Testes E2E       | Playwright                             |
| Lint             | ESLint (next/core-web-vitals)          |
| Formatação       | Prettier + prettier-plugin-tailwindcss |
| Persistência     | IndexedDB via Dexie 4                  |
| Validação        | Zod 4                                  |
| Testes IndexedDB | fake-indexeddb                         |

---

## Requisitos

- Node.js >= 20
- npm >= 10

---

## Instalação

```bash
npm install
```

---

## Comandos

```bash
npm run dev           # Servidor de desenvolvimento em http://localhost:3000
npm run build         # Build de produção
npm run start         # Inicia servidor de produção (requer build)
npm run typecheck     # Verificação de tipos TypeScript
npm run lint          # ESLint
npm run format        # Formatar arquivos com Prettier
npm run format:check  # Verificar formatação sem alterar
npm run test          # Testes unitários (Vitest)
npm run test:watch    # Testes unitários em modo watch
npm run test:e2e      # Testes E2E (Playwright) — requer build
```

---

## Estrutura

```
src/
  app/
    (app)/           <- Grupo de rotas do app shell
      dashboard/
      plano/
      revisar/
      flashcards/
      quizzes/
      mocks/
      playground/
      notas/
      recursos/
      relatorios/
      configuracoes/
      layout.tsx     <- Shell: sidebar + header
    error.tsx
    global-error.tsx
    loading.tsx
    not-found.tsx
    layout.tsx       <- Root layout: fonts, providers, skip link
    page.tsx         <- Redirect -> /dashboard

  components/
    ui/              <- shadcn/ui primitivos (gerados)
    layout/          <- Shell do app (AppSidebar, AppHeader, etc.)
    feedback/        <- Estados compartilhados (EmptyState, ErrorState, etc.)

  features/          <- Funcionalidades por domínio (Entregas 05-16)

  shared/
    constants/       <- NAV_ITEMS
    types/           <- Tipos globais
    utils/           <- Utilitários puros

  lib/
    domain/
      schedule/      <- Datas civis, disponibilidade semanal e scheduler puro
    db/              <- Dexie schema, seed, migrations, constants, errors
    repositories/    <- 12 repositórios tipados
    data/            <- Dados iniciais (40 flashcards)
    validation/      <- Schemas Zod (legacy, database, backup)

  types/
    database.ts      <- Tipos de registro (15 tabelas)
    legacy.ts        <- Tipos e chaves do localStorage legado
    backup.ts        <- Tipos para export/import de backup

  hooks/
    use-database-status.ts
    use-legacy-migration.ts

  test/
    setup.ts         <- Configuração do Vitest + mocks
    indexed-db.ts    <- Helper createTestDatabase() com fake-indexeddb

tests/
  e2e/               <- Testes Playwright
  integration/       <- Testes de integração (migration)
  fixtures/          <- Dados de teste (legacy, backup)

docs/
  architecture/
    decisions.md
  domain/
    study-schedule.md
  data/
    database-schema.md
    legacy-migration.md
    backup-format.md
  delivery-01-foundation.md
  delivery-02-data-layer.md
  delivery-03-calendar-domain.md
```

---

## Rotas

| Rota             | Entrega |
| ---------------- | ------- |
| `/dashboard`     | 06      |
| `/plano`         | 05      |
| `/revisar`       | 07      |
| `/flashcards`    | 08      |
| `/quizzes`       | 09      |
| `/mocks`         | 11      |
| `/playground`    | 12      |
| `/notas`         | 13      |
| `/recursos`      | 13      |
| `/relatorios`    | 15      |
| `/configuracoes` | 16      |

---

## Convenções

- Server Components por padrão. `"use client"` apenas para componentes com estado de browser.
- Sem estilos inline. Todos os estilos via classes Tailwind.
- Cores via CSS variables (`--background`, `--primary`, etc.) definidas em `globals.css`.
- Imports via alias `@/*` (mapeia para `src/`).
- Testes unitários em `__tests__/` próximos ao componente testado.
- Testes E2E em `tests/e2e/`.

---

## Entregas

| #   | Escopo                                         | Status    |
| --- | ---------------------------------------------- | --------- |
| 01  | Fundação: Next.js, layout, rotas, tema, testes | Concluída |
| 02  | IndexedDB, schema, migration, repositories     | Concluída |
| 03  | Domínio de calendário                          | Concluída |
| 04  | Progresso, reviews, spaced repetition          | Pendente  |
| 05  | Página Plano                                   | Pendente  |
| 06  | Dashboard                                      | Pendente  |
| 07  | Revisão Hoje                                   | Pendente  |
| 08  | Flashcards                                     | Pendente  |
| 09  | Quizzes                                        | Pendente  |
| 10  | Timer                                          | Pendente  |
| 11  | Mocks                                          | Pendente  |
| 12  | Playground                                     | Pendente  |
| 13  | Notas + Recursos                               | Pendente  |
| 14  | Retention metrics, skill tree, gamification    | Pendente  |
| 15  | Relatórios semanais                            | Pendente  |
| 16  | Configurações, polishing, PWA                  | Pendente  |

---

## Calendário e Agenda

- Datas civis são validadas no formato `YYYY-MM-DD`.
- `2026-06-11` é tratado como quinta-feira e `2026-06-13` como sábado.
- A disponibilidade padrão é segunda a sexta com 480 minutos, sábado com 240 minutos e domingo como descanso.
- O scheduler puro gera agenda cronológica com dias de descanso incluídos.
- Cada dia sequencial do plano ocupa uma data habilitada; blocos não são divididos automaticamente.
- Dias acima da capacidade são marcados como `over_capacity`.
- Agrupamento semanal usa a semana real do calendário, de segunda a domingo.

## Limitações atuais

- Progresso, atrasos, reagendamento, pular conteúdo e mover plano ainda não foram implementados.
- Revisões e repetição espaçada ainda não usam a agenda.
- Dashboard, Plano e Revisar Hoje ainda não estão integrados ao scheduler.
- As páginas mostram estado "em construção" — o banco existe mas não há UI funcional ainda.
- Nenhuma métrica, readiness ou progresso é exibido.
- Áudio de mocks não é incluído no backup JSON (apenas metadados).
