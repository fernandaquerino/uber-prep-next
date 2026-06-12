# Auditoria de dados

## IndexedDB

O banco Dexie possui schema versionado, seeds idempotentes e migrations para dados legados. IDs estáveis evitam duplicação de conteúdo inicial.

## Backup

O backup cobre progresso, revisões, flashcards, quizzes, timer, mocks estruturados, notas e versões, reflexões, relatórios, recursos, inglês técnico e configurações.

Antes da transação, `backupFileSchema` valida app, versão e estrutura. Coleções adicionadas em versões recentes usam `[]` como default para compatibilidade com backups antigos.

## Reset

Resets por módulo removem tabelas dependentes sem atingir outros módulos. O catálogo de questões de quiz é preservado no reset de progresso; o reset total remove catálogo e metadata para permitir reseed limpo.

## Áudio

Blobs de `mockAudio` não entram no JSON. `audioCount` e `audioNote` tornam a limitação explícita.
