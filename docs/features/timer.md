# Feature Timer

## Rotas e UI

- `/timer`: página completa do timer, histórico recente e registro manual.
- Header global: timer compacto com acesso rápido.
- Painel lateral: iniciar, pausar, retomar, concluir, encerrar, cancelar, configurar som/notificação e adicionar sessão manual.

## Integrações implementadas

- Plano: blocos podem iniciar sessão `plan_block`.
- Revisar Hoje: itens da fila podem iniciar sessão `review`.
- Flashcards: sessão de estudo pode iniciar sessão `flashcard_session`.
- Quizzes: sessão de quiz pode iniciar sessão `quiz_session`.
- Playground: editor pode iniciar sessão `playground_solution`.
- Dashboard: mostra sessão ativa, tempo de hoje e tempo da semana.

## Atalhos

- `T`: abre o painel do timer.
- `Espaço`: pausa ou retoma quando existe timer ativo.
- `Esc`: fecha o painel.

Atalhos são ignorados enquanto o foco está em input, textarea, select ou conteúdo editável.

## Estados

- Loading: provider carrega IndexedDB e seeds.
- Ready sem timer ativo: formulário de início.
- Ready com timer ativo: display, controles e histórico.
- Error: toast e mensagem interna do provider.

## Decisões

- O relógio visual atualiza a cada segundo, mas IndexedDB não recebe escrita por tick.
- O histórico oficial vem apenas de `timerSessions`.
- Tempo interno de quiz/flashcard/playground não alimenta métricas globais automaticamente.
- Notificações do navegador exigem permissão explícita.
