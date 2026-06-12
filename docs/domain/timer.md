# Timer

## Objetivo

O timer registra tempo real de estudo como dado oficial do app. O tempo de quizzes, flashcards e playground interno continua existindo para cada feature, mas só entra nas métricas gerais quando a pessoa inicia uma sessão de foco.

## Modelos

### ActiveTimerRecord

Representa a única sessão ativa ou pausada.

- `id`: sempre `active-timer`
- `mode`: `countdown` ou `stopwatch`
- `status`: `running` ou `paused`
- `sourceType`: origem da sessão
- `sourceId`: vínculo opcional com bloco, revisão, quiz, flashcards, playground ou mock
- `category`: categoria usada em agrupamentos
- `title`: título exibido na UI
- `targetDurationSeconds`: duração alvo para countdown
- `startedAt`: início real da sessão
- `lastResumedAt`: último momento em que voltou a rodar
- `pausedAt`: último momento de pausa
- `accumulatedSeconds`: tempo acumulado antes da execução atual

### TimerSessionRecord

Representa histórico oficial.

- Só é criado ao concluir ou encerrar antecipadamente.
- Sessões canceladas não entram nos totais.
- `actualDurationSeconds` é calculado por timestamps, não por ticks salvos a cada segundo.

## Regras

- Existe no máximo um timer ativo.
- O timer ativo não conta automaticamente como histórico.
- Pausar acumula o tempo decorrido desde `lastResumedAt`.
- Retomar preserva `accumulatedSeconds` e atualiza `lastResumedAt`.
- Concluir cria uma sessão `completed` e remove o ativo.
- Encerrar antes cria uma sessão `stopped_early` e remove o ativo.
- Cancelar remove o ativo sem criar histórico.
- Sessões restauradas com tempo corrido maior que `longSessionThresholdSeconds` são pausadas para confirmação.

## Presets

Presets oficiais:

- 25 minutos
- 45 minutos
- 60 minutos
- 90 minutos

Durações customizadas são validadas entre 1 minuto e 12 horas.
