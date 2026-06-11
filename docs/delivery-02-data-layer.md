# Entrega 02 — Banco local, schemas, repositories e migração de dados

## Resumo

Implementação completa da camada de dados usando IndexedDB via Dexie 4. Todos os dados do app são persistidos localmente no browser, com migração automática dos dados legados do localStorage.

## Arquitetura

```
src/
├── types/
│   ├── database.ts          # Todos os tipos de registro (15 tabelas)
│   ├── legacy.ts            # Tipos e chaves do localStorage legado
│   └── backup.ts            # Tipos para export/import de backup
├── lib/
│   ├── db/
│   │   ├── constants.ts     # DATABASE_NAME, DATABASE_VERSION, IDs, limites
│   │   ├── schema.ts        # UberPrepDatabase extends Dexie (15 tabelas)
│   │   ├── db.ts            # getDb(), createDatabase(), _resetDbSingleton()
│   │   ├── errors.ts        # DatabaseError, SsrAccessError, etc.
│   │   ├── seed.ts          # Seeds idempotentes (flashcards iniciais, settings)
│   │   └── migrations.ts    # Migração one-time do localStorage para IndexedDB
│   ├── repositories/        # 12 repositórios tipados
│   │   ├── settings.repository.ts
│   │   ├── progress.repository.ts
│   │   ├── reviews.repository.ts
│   │   ├── flashcards.repository.ts
│   │   ├── quizzes.repository.ts
│   │   ├── timer.repository.ts
│   │   ├── mocks.repository.ts
│   │   ├── notes.repository.ts
│   │   ├── playground.repository.ts
│   │   ├── checklist.repository.ts
│   │   ├── backup.repository.ts
│   │   └── migration.repository.ts
│   ├── data/
│   │   └── initial-flashcards.ts   # 40 flashcards iniciais (fc-1..fc-40)
│   └── validation/
│       ├── legacy.schemas.ts        # Zod tolerante para dados do localStorage
│       ├── database.schemas.ts      # Zod estrito para registros do IndexedDB
│       └── backup.schemas.ts        # Zod para validar arquivos de backup
├── hooks/
│   ├── use-database-status.ts       # Estado do banco + seed automático
│   └── use-legacy-migration.ts      # Controle da migração legado
├── features/backup/components/
│   ├── legacy-migration-check.tsx   # Wrapper com hook + dialog
│   ├── migration-dialog.tsx         # UI do diálogo de migração
│   └── migration-status.tsx         # Badge de status da migração
└── test/
    └── indexed-db.ts                # Helper createTestDatabase() com fake-indexeddb
```

## Fluxo de inicialização

1. `AppLayout` renderiza `<LegacyMigrationCheck />`
2. `useLegacyMigration` checa se há dados legados no localStorage e se a migração já foi feita
3. Se necessário, exibe `MigrationDialog` para o usuário confirmar
4. `runLegacyMigration(db)` executa a migração (idempotente)
5. `useDatabaseStatus` inicializa o banco e executa `runSeeds` na primeira visita

## Checklist de validação

- [x] `npm run typecheck` — sem erros
- [x] `npm run lint` — sem warnings
- [x] `npm run format:check` — todos os arquivos formatados
- [x] `npm test` — 51 testes passando
- [x] `npm run build` — build de produção bem-sucedido
