# Entrega 17 — Auditoria completa

## Resumo

A estabilização final revisou produto, consistência, persistência, UX, acessibilidade, performance, testes e documentação. Não foram adicionados novos domínios de produto.

## Correções principais

- Dashboard, Plano, Revisar Hoje e Relatórios usam a disponibilidade semanal centralizada.
- Settings legadas sem `weekdayAvailability` são normalizadas sem crash.
- Backup passou a incluir quizzes estruturados, evidências e sessões de mocks, versões e vínculos de notas e snapshots.
- Importação valida o envelope completo antes de abrir a transação.
- Reset por módulo remove registros dependentes; reset total cobre todas as tabelas.
- Botões destrutivos icon-only receberam nome acessível.
- Log de debug de normalização de quizzes foi removido.
- README, schema e documentação foram atualizados para o produto real.

## Validação

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run format:check`: passou.
- `npm run test`: 58 arquivos e 406 testes passaram.
- `npm run build`: passou; 14 rotas do app foram pré-renderizadas.
- `npm run test:e2e`: 56 testes passaram e 26 condicionais foram pulados, sem falhas.

O build emitiu um aviso não bloqueante sobre múltiplos `package-lock.json` acima da raiz do projeto.

## Limitações

- Áudios de mocks permanecem fora do backup JSON.
- PDF usa a impressão nativa do navegador.
- Não existe sincronização entre navegadores ou dispositivos.

Não foi iniciada nenhuma funcionalidade posterior à auditoria.
