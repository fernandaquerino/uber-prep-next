# Entrega 10 — Timer

## Resumo

Implementa timer global local-first com countdown, cronômetro, sessão ativa restaurável, histórico oficial de estudo, registro manual, página dedicada e integrações com os fluxos já existentes.

## Arquitetura adotada

- `src/lib/domain/timer`: funções puras de duração, relógio, transições e agregações.
- `src/lib/application/timer`: casos de uso transacionais com IndexedDB.
- `src/components/features/timer`: provider global, painel, compact timer, formulário e histórico.
- `src/hooks/use-timer.ts`, `use-timer-actions.ts`, `use-timer-history.ts`: acesso client-side.

## Persistência

Foram adicionadas as tabelas:

- `activeTimer`
- `timerSettings`

A tabela `timerSessions` foi migrada para o novo formato com origem, modo, status, alvo e duração real.

## Funcionalidades

- Um timer ativo por vez.
- Countdown e stopwatch.
- Presets 25, 45, 60 e 90 minutos.
- Duração customizada.
- Pausar, retomar, concluir, encerrar antes e cancelar.
- Sessão ativa restaurada após reload.
- Política para sessão longa restaurada: pausa e abre painel para confirmação.
- Histórico de sessões oficiais.
- Registro manual de tempo.
- Edição simples e exclusão de sessão histórica.
- Som e notificação ao concluir countdown.
- Integração com Plano, Revisar Hoje, Flashcards, Quizzes, Playground e Dashboard.
- Backup, importação e migração do timer legado.

## Limitações atuais

- Configurações completas de timer ainda não aparecem em `/configuracoes`.
- Mocks ainda não possuem fluxo real para iniciar timer associado.
- Relatórios avançados e readiness ainda não consomem o timer; isso fica para entregas futuras.
- Notificações dependem da permissão do navegador.
