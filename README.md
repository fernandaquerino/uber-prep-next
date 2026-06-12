# Uber Prep

Plataforma de preparação para entrevistas de engenharia de software. Local-first, sem backend, sem conta.

> **Estado atual:** Entrega 10 concluída — Timer global, sessões de foco e histórico oficial de tempo.
> As Entregas 01–10 têm implementação funcional no app local-first. Relatórios avançados e Mocks ainda não fazem parte deste recorte.

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
      timer/
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
      progress/      <- Progresso do plano, agenda efetiva, shift e undo
      timer/         <- Timer, duração, transições e agregações
    application/
      progress/      <- Casos de uso transacionais de progresso
      timer/         <- Casos de uso transacionais do timer
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
    plan-progress.md
    effective-schedule.md
  data/
    database-schema.md
    legacy-migration.md
    backup-format.md
  delivery-01-foundation.md
  delivery-02-data-layer.md
  delivery-03-calendar-domain.md
  delivery-04-plan-progress.md
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
| `/timer`         | 10      |
| `/playground`    | 11      |
| `/mocks`         | 12      |
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
| 04  | Progresso do plano, agenda efetiva, undo       | Concluída |
| 05  | Página Plano                                   | Concluída |
| 06  | Dashboard                                      | Concluída |
| 07  | Revisão Hoje                                   | Concluída |
| 08  | Flashcards                                     | Concluída |
| 09  | Quizzes                                        | Concluída |
| 10  | Timer                                          | Concluída |
| 11  | Playground                                     | Parcial   |
| 12  | Mocks                                          | Pendente  |
| 13  | Notas + Recursos                               | Pendente  |
| 14  | Configurações                                  | Parcial   |
| 15  | Dashboard analytics, Skill Tree e Readiness    | Concluída |
| 16  | Relatórios semanais                            | Pendente  |
| 17  | Auditoria final                                | Pendente  |

---

## Calendário e Agenda

- Datas civis são validadas no formato `YYYY-MM-DD`.
- `2026-06-11` é tratado como quinta-feira e `2026-06-13` como sábado.
- A disponibilidade padrão é segunda a sexta com 480 minutos, sábado com 240 minutos e domingo como descanso.
- O scheduler puro gera agenda cronológica com dias de descanso incluídos.
- Cada dia sequencial do plano ocupa uma data habilitada; blocos não são divididos automaticamente.
- Dias acima da capacidade são marcados como `over_capacity`.
- Agrupamento semanal usa a semana real do calendário, de segunda a domingo.

## Progresso do Plano

- Progresso de bloco possui máquina de estados validada.
- Agenda efetiva combina agenda base, progresso, reagendamentos e shifts.
- Atrasos são derivados por `scheduledDate < today`, sem status persistido `missed`.
- Reagendamento preserva data original e gera histórico.
- Dias perdidos suportam estratégias explícitas: manter atrasado, mover pendentes, reagendar itens ou pular itens.
- Skip, restore e undo foram implementados no domínio e na camada de aplicação.
- Persistência usa IndexedDB com tabelas de progresso, eventos e overrides.

## Timer

- Existe um timer global acessível pelo header e pela rota `/timer`.
- Modos suportados: countdown e cronômetro.
- Presets oficiais: 25, 45, 60 e 90 minutos.
- O tempo oficial é salvo em `timerSessions` somente ao concluir ou encerrar uma sessão.
- A sessão ativa fica separada em `activeTimer` e é restaurada após reload.
- Sessões longas restauradas são pausadas para confirmação.
- Plano, Revisar Hoje, Flashcards, Quizzes e Playground podem iniciar sessões de foco associadas.
- Dashboard mostra sessão ativa e totais de hoje/semana.

## Limitações atuais

- Algumas preferências de Configurações ainda não alimentam todos os módulos.
- Relatórios semanais consolidados ainda não foram implementados.
- Áudio de mocks não é incluído no backup JSON (apenas metadados).

## Dashboard Analytics

- Evidências são derivadas de todas as fontes locais sem criar métricas artificiais.
- Readiness exige quantidade mínima de dados e múltiplas fontes.
- Skill Tree diferencia não iniciado, aprendizado, prática, consistência, domínio e risco.
- Tópicos de risco incluem motivos e ações recomendadas.
- O heatmap de conhecimento não deve ser confundido com o calendário de atividade.
- Fórmulas: `docs/domain/readiness.md`.
