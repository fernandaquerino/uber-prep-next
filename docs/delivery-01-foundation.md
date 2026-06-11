# Entrega 01 — Fundação do Projeto

**Status:** Concluída  
**Data:** 2026-06-11

---

## Escopo

Criar a fundação técnica limpa e estável do novo Uber Prep em Next.js. Sem regras de negócio, sem persistência, sem métricas reais.

---

## Implementado

- [x] Projeto Next.js 16 + App Router + TypeScript strict
- [x] Tailwind CSS v4 com design system via CSS variables
- [x] shadcn/ui inicializado com todos os componentes base
- [x] next-themes com suporte a claro/escuro/sistema
- [x] Layout com sidebar desktop persistente
- [x] Sidebar mobile via Sheet acessível (abre/fecha)
- [x] Header com toggle de tema e botão de menu mobile
- [x] Skip link para acessibilidade de teclado
- [x] 11 rotas principais (`/dashboard` a `/configuracoes`)
- [x] Redirect `/` → `/dashboard`
- [x] Componentes compartilhados: `PageContainer`, `PageHeader`, `EmptyState`, `ErrorState`, `LoadingState`, `ComingSoonState`
- [x] `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`
- [x] Vitest + React Testing Library + 18 testes passando
- [x] Playwright configurado com testes E2E de navegação, tema e mobile
- [x] ESLint (next/core-web-vitals + typescript)
- [x] Prettier com prettier-plugin-tailwindcss
- [x] README atualizado

---

## Não implementado (intencional)

- Calendário, scheduler, data de início
- Progresso, reviews, readiness, streak, métricas
- Repetição espaçada
- IndexedDB / Dexie
- Persistência de dados
- Timer funcional
- Quizzes, flashcards, mocks, playground funcionais
- Monaco Editor
- Relatórios reais
- Export/Import de dados
- Gamification

---

## Decisões

| Decisão                            | Justificativa                                                              |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Next.js 16                         | Versão mais recente com App Router estável                                 |
| Tailwind v4                        | Gerado pelo create-next-app; CSS variables nativas, sem tailwind.config.js |
| shadcn/ui 4.x                      | Suporte nativo a Tailwind v4; componentes acessíveis via Radix UI          |
| npm                                | Única ferramenta de package manager disponível no ambiente                 |
| Pasta separada `uber-prep-next`    | Não toca o projeto legado enquanto a migração progride                     |
| `suppressHydrationWarning` no html | Necessário para next-themes evitar erro de hidratação                      |

---

## Riscos

- **Tailwind v4 + shadcn/ui**: ainda em adoção inicial. Verificar breaking changes em entregas futuras.
- **Next.js 16**: versão muito recente. Pode haver incompatibilidades com libs que assumem Next 13/14/15.
- **Playwright + build**: os testes E2E rodam após `npm run build && npm start`. Em CI, garantir que a porta 3000 esteja livre.

---

## Comandos

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run typecheck    # verificação TypeScript
npm run lint         # ESLint
npm run format       # Prettier (escrita)
npm run format:check # Prettier (verificação)
npm run test         # Vitest (unitários)
npm run test:watch   # Vitest em modo watch
npm run test:e2e     # Playwright E2E
```

---

## Validação

```
TypeScript:  0 erros
ESLint:      0 warnings
Prettier:    formatação consistente
Vitest:      18 testes passando / 4 suites
Playwright:  testes E2E configurados
Build:       sucesso
```

---

## Próximos passos — Entrega 02

- Definir schema Dexie com todas as tabelas (blocks, reviews, flashcards, quizzes, timerSessions, mocks, notes, playground)
- Criar repositories tipados para cada domínio
- Implementar script de migração: `uber-prep-v2` localStorage → IndexedDB
- Criar hooks de acesso tipados (`useProgressRepo`, `useFlashcardsRepo`, etc.)
- Vitest para cada repository com banco em memória
