# Uber Prep

Aplicação local-first para organizar preparação intensiva para entrevistas de Frontend Engineer. Funciona sem conta e sem backend; os dados ficam no IndexedDB do navegador.

> Estado atual: Entrega 17 concluída, com módulos funcionais, métricas explicáveis, relatórios semanais e auditoria final.

## Stack

- Next.js 16 com App Router e React 19
- TypeScript strict e Tailwind CSS 4
- Componentes shadcn/ui sobre Base UI
- Dexie 4 e IndexedDB
- Zod 4
- Vitest, React Testing Library e Playwright
- Monaco Editor carregado sob demanda

## Como executar

Requisitos: Node.js 20+ e npm 10+.

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

## Módulos

| Rota             | Função                                                             |
| ---------------- | ------------------------------------------------------------------ |
| `/dashboard`     | Prioridades, progresso, evidências, readiness, riscos e Skill Tree |
| `/plano`         | Agenda efetiva, progresso, atrasos e reagendamentos                |
| `/revisoes`      | Fila unificada, diário e reflexão semanal                          |
| `/flashcards`    | Criação, estudo e repetição espaçada                               |
| `/quizzes`       | Sessões, histórico, erros e revisões                               |
| `/timer`         | Timer global e histórico de tempo real                             |
| `/mocks`         | Coding, System Design, Behavioral, Full Loop e evidências          |
| `/playground`    | Monaco, execução isolada e soluções salvas                         |
| `/notas`         | Markdown, versões, vínculos e busca                                |
| `/recursos`      | Biblioteca de recursos e inglês técnico                            |
| `/configuracoes` | Plano, agenda, aparência, acessibilidade, backup e reset           |
| `/relatorios`    | Relatórios semanais, comparação, Markdown, impressão e snapshots   |

## Arquitetura

- Regras de calendário, progresso, revisões, evidências e relatórios vivem em funções de domínio e casos de uso.
- Dashboard, Plano, Revisar Hoje e Relatórios consomem a mesma agenda efetiva e as mesmas configurações.
- Componentes acessam persistência por repositórios e casos de uso; IndexedDB não é lido durante SSR.
- O schema atual possui versionamento e migrations em [`src/lib/db/schema.ts`](src/lib/db/schema.ts).
- Conteúdo inicial fica desacoplado da interface em `src/lib/data`.

Documentação principal:

- [`docs/architecture/decisions.md`](docs/architecture/decisions.md)
- [`docs/data/database-schema.md`](docs/data/database-schema.md)
- [`docs/data/backup-format.md`](docs/data/backup-format.md)
- [`docs/domain/study-schedule.md`](docs/domain/study-schedule.md)
- [`docs/domain/readiness.md`](docs/domain/readiness.md)
- [`docs/features/reports.md`](docs/features/reports.md)
- [`docs/delivery-17-final-audit.md`](docs/delivery-17-final-audit.md)

## Dados e privacidade

- Todo o conteúdo pessoal fica no navegador.
- Backups JSON incluem configurações, progresso, quizzes, timer, mocks, notas, recursos, inglês técnico e snapshots de relatórios.
- Gravações de áudio não entram no JSON; o backup informa quantos áudios ficaram de fora.
- A importação valida o envelope antes de alterar o banco e suporta backups antigos com coleções ausentes.
- Reset total exige a confirmação textual `RESETAR`.

## Métricas

- Readiness só aparece quando existe evidência mínima.
- Ausência de dados não é apresentada como desempenho zero.
- Riscos e recomendações incluem motivos e fontes.
- Tempo planejado e tempo registrado são métricas separadas.
- Relatórios usam semanas reais da agenda e podem ser derivados ou congelados em snapshots.

## Limitações conhecidas

- O app é local a um navegador e perfil; não há sincronização entre dispositivos.
- Limpar os dados do navegador remove o banco local.
- Áudio de mocks deve ser preservado separadamente do backup JSON.
- Impressão em PDF depende do diálogo de impressão do navegador.

Consulte [`docs/audit/test-plan.md`](docs/audit/test-plan.md) para a matriz de validação e cenários manuais.
