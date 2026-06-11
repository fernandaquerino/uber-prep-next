# Reconstrução do Uber Prep em Next.js

Quero reconstruir do zero o projeto **Uber Prep**, migrando a aplicação atual em React para uma nova aplicação em **Next.js com App Router e TypeScript**.

A aplicação atual deve ser utilizada como:

- referência funcional;
- fonte de conteúdo;
- fonte de dados iniciais;
- referência visual;
- inventário de funcionalidades.

Não quero simplesmente converter os componentes React atuais para Next.js.

Quero reconstruir a aplicação com:

- arquitetura mais limpa;
- regras de negócio centralizadas;
- calendário realmente dinâmico;
- progresso confiável;
- revisão consistente;
- melhor experiência de uso;
- persistência robusta;
- testes automatizados;
- possibilidade de evolução futura.

## Regra de execução

Não implemente todo o projeto de uma vez.

Divida o trabalho nas entregas descritas neste documento e execute **uma entrega por vez**.

Antes de cada entrega:

1. Analise o projeto atual.
2. Liste os arquivos relevantes encontrados.
3. Explique o que será reaproveitado.
4. Explique o que será refeito.
5. Liste os arquivos que serão criados ou modificados.
6. Aguarde aprovação antes de implementar, caso esteja trabalhando de forma interativa.

Depois de cada entrega:

1. Execute TypeScript.
2. Execute lint.
3. Execute testes.
4. Execute build.
5. Corrija todos os erros encontrados.
6. Apresente um resumo do que foi concluído.
7. Não avance automaticamente para a próxima entrega.

## Objetivo do produto

O Uber Prep é uma aplicação local-first para organizar uma preparação intensiva de seis semanas para entrevistas de Frontend Engineer, com foco em processos semelhantes ao da Uber.

A preparação abrange:

- algoritmos e estruturas de dados;
- JavaScript profundo;
- React;
- frontend coding;
- frontend system design;
- behavioral interviews;
- inglês técnico;
- mock interviews;
- revisão espaçada;
- acompanhamento de progresso.

O aplicativo deve responder com clareza:

1. O que preciso estudar hoje?
2. O que ficou pendente?
3. O que preciso revisar?
4. Qual é o próximo conteúdo?
5. Quanto já avancei?
6. Em quais assuntos estou tendo mais dificuldade?
7. Como meu desempenho evoluiu ao longo das semanas?

## Princípios obrigatórios

### 1. Fonte única de verdade

Dashboard, Plano, Revisar Hoje, relatórios e recomendações devem consumir os mesmos serviços, selectors e regras de domínio.

Não crie cálculos independentes para:

- estudo atual;
- próximo estudo;
- conteúdos atrasados;
- revisões vencidas;
- progresso;
- readiness;
- tópicos fracos.

### 2. Separação entre calendário e progresso

A aplicação deve separar:

- data real do calendário;
- posição sequencial no plano;
- progresso real da pessoa.

O calendário avança com o tempo.

O conteúdo do plano só avança quando a pessoa toma uma decisão explícita:

- concluir;
- continuar;
- reagendar;
- mover para frente;
- pular.

Nunca avance o plano somente porque mudou o dia.

### 3. Conteúdo desacoplado da interface

Questões, flashcards, dias do plano, perguntas STAR, templates e recursos não devem ficar acoplados a componentes React.

### 4. Regras de negócio fora dos componentes

Componentes devem renderizar dados e disparar ações.

Não coloque nos componentes regras complexas de:

- datas;
- repetição espaçada;
- readiness;
- retenção;
- revisão;
- reagendamento;
- progresso.

### 5. Local-first confiável

A aplicação deve funcionar sem backend.

Entretanto, não utilize várias chaves de `localStorage` sem coordenação como principal banco da nova versão.

Use uma camada de persistência local estruturada, preferencialmente:

- IndexedDB;
- Dexie ou solução equivalente;
- repositórios abstraindo o mecanismo de persistência.

O acesso ao armazenamento deve acontecer por interfaces, não diretamente dentro dos componentes.

### 6. Migração de dados

A nova aplicação precisa conseguir importar os dados da versão antiga.

Implemente:

- leitura do backup JSON antigo;
- conversão para o novo modelo;
- validação;
- relatório de dados importados;
- tratamento de registros incompatíveis;
- prevenção de duplicidade.

Não dependa de edição manual do `localStorage` pelo DevTools.

---

# Stack técnica

Utilize:

- Next.js com App Router;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- shadcn/ui ou componentes acessíveis equivalentes;
- React Hook Form;
- Zod;
- Zustand somente para estado de interface ou sessão quando necessário;
- TanStack Query apenas quando fizer sentido para operações assíncronas e persistência;
- IndexedDB com Dexie ou equivalente;
- date-fns para operações de calendário;
- Vitest;
- React Testing Library;
- Playwright;
- Monaco Editor carregado sob demanda;
- Web Worker para execução isolada de JavaScript.

Não introduza bibliotecas sem justificar a necessidade.

## Regras de Next.js

- Use Server Components por padrão.
- Use Client Components somente quando houver interação, estado do navegador ou acesso à IndexedDB.
- Não transforme páginas inteiras em Client Components sem necessidade.
- Use carregamento dinâmico para módulos pesados.
- Monaco Editor, relatórios e módulos de mock podem usar lazy loading.
- Organize os layouts pelo App Router.
- Implemente estados de loading, empty state e error state.
- Não acesse `window`, `document`, IndexedDB ou storage durante SSR.

---

# Arquitetura sugerida

Adapte quando necessário, mas mantenha separação por domínio:

```text
src/
  app/
    (app)/
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
    layout.tsx
    page.tsx

  components/
    ui/
    layout/
    feedback/
    charts/

  features/
    study-plan/
      domain/
      application/
      infrastructure/
      components/
      hooks/
      schemas/
      tests/

    reviews/
      domain/
      application/
      infrastructure/
      components/
      hooks/
      schemas/
      tests/

    flashcards/
    quizzes/
    timer/
    mocks/
    playground/
    notes/
    reports/
    readiness/
    resources/
    settings/
    backup/

  db/
    database.ts
    schema.ts
    migrations/

  data/
    plan/
    quizzes/
    flashcards/
    behavioral/
    system-design/
    frontend-drills/
    resources/
    technical-english/

  shared/
    dates/
    errors/
    types/
    utils/
    constants/

  workers/
    javascript-runner.worker.ts
```

Cada feature deve possuir responsabilidades claras:

```text
domain/
```

Tipos, entidades, regras e funções puras.

```text
application/
```

Casos de uso e orquestração.

```text
infrastructure/
```

IndexedDB, repositórios, exportação e integração com APIs do navegador.

```text
components/
```

Interface da funcionalidade.

---

# Modelo central do plano

Defina uma modelagem explícita para o conteúdo do plano.

Exemplo conceitual:

```ts
type StudyPlan = {
  id: string;
  title: string;
  durationWeeks: number;
  version: number;
  days: PlanDay[];
};

type PlanDay = {
  id: string;
  sequence: number;
  title: string;
  description?: string;
  blocks: PlanBlock[];
};

type PlanBlock = {
  id: string;
  title: string;
  description?: string;
  category: StudyCategory;
  estimatedMinutes: number;
  resourceIds?: string[];
  quizIds?: string[];
  flashcardIds?: string[];
  tags: string[];
};
```

O conteúdo original de seis semanas deve ser migrado, preservando:

- títulos;
- descrições;
- exercícios;
- duração estimada;
- pausas;
- mocks;
- quizzes relacionados;
- recursos;
- categorias;
- links existentes.

---

# Modelo de calendário

A configuração semanal deve ser editável.

Exemplo:

```ts
type WeekdayAvailability = {
  enabled: boolean;
  availableMinutes: number;
};

type StudyCalendarSettings = {
  timezone: string;
  startDate: string;
  weekdayAvailability: Record<Weekday, WeekdayAvailability>;
};
```

Configuração inicial sugerida:

- segunda a sexta: 8 horas;
- sábado: 4 horas;
- domingo: descanso.

Esses valores não devem ficar hardcoded em componentes.

## Regras do calendário

A data real deve determinar:

- dia correto da semana;
- disponibilidade daquele dia;
- se é estudo ou descanso;
- formatação apresentada na interface.

Exemplo obrigatório:

```text
11/06/2026 = quinta-feira
12/06/2026 = sexta-feira
13/06/2026 = sábado
14/06/2026 = domingo
15/06/2026 = segunda-feira
```

Nunca associe datas consecutivas a labels fixos como segunda, terça e quarta.

Datas de calendário devem ser armazenadas como:

```text
YYYY-MM-DD
```

Evite usar diretamente:

```ts
new Date("2026-06-11");
```

Implemente parse e formatação consistentes considerando:

```text
America/Sao_Paulo
```

---

# Modelo de progresso

Implemente registros explícitos para o progresso.

Exemplo:

```ts
type PlanBlockStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "stuck"
  | "skipped"
  | "rescheduled";

type PlanBlockProgress = {
  id: string;
  blockId: string;
  status: PlanBlockStatus;
  scheduledDate: string;
  originalScheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  actualMinutes?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  patternUsed?: string;
};
```

## Dia perdido

Quando a pessoa não estudar, permita:

### Mover plano para frente

O conteúdo pendente permanece como próximo conteúdo, deslocando a agenda futura.

### Reagendar conteúdo

Escolher outra data válida.

### Pular conteúdo

Marcar conscientemente como pulado, exigindo confirmação.

### Manter atrasado

O conteúdo continua pendente, podendo aparecer junto com a agenda atual.

A interface deve informar as consequências antes de aplicar a ação.

---

# Agenda efetiva

Crie um scheduler central que combine:

- plano original;
- data inicial;
- disponibilidade semanal;
- dias de descanso;
- progresso;
- reagendamentos;
- conteúdos atrasados;
- conteúdos pulados.

Exemplo de saída:

```ts
type ScheduledStudyDay = {
  date: string;
  weekday: Weekday;
  availableMinutes: number;
  isRestDay: boolean;
  items: ScheduledPlanBlock[];
  totalEstimatedMinutes: number;
  status: "past" | "today" | "future" | "completed" | "partial" | "missed" | "rest";
};
```

Todos os módulos devem consultar essa agenda.

Crie funções puras equivalentes a:

```ts
buildStudySchedule();
getCurrentStudyDay();
getNextStudyDay();
getPendingItems();
getOverdueItems();
getNextValidStudyDate();
reschedulePlanItem();
shiftPendingSchedule();
getDailyStudySummary();
```

---

# Sistema de revisão

A revisão precisa ser um domínio independente, mas conectado às atividades.

Não utilize um único booleano para representar todos os estados.

Exemplo:

```ts
type ReviewSource = "plan" | "flashcard" | "quiz" | "mock" | "manual";

type ReviewStatus = "scheduled" | "due" | "completed" | "dismissed" | "rescheduled";

type ReviewItem = {
  id: string;
  sourceType: ReviewSource;
  sourceId: string;
  status: ReviewStatus;
  scheduledFor: string;
  completedAt?: string;
  result?: ReviewResult;
  cycleIndex: number;
};
```

Separe claramente:

```ts
isMarkedForReview;
reviewStatus;
reviewedAt;
nextReviewAt;
```

## Repetição espaçada

Preserve os ciclos atuais:

- 1 dia;
- 3 dias;
- 7 dias;
- 14 dias;
- 30 dias.

Mas centralize a regra em um único serviço.

Resultados devem afetar o próximo intervalo:

- domínio alto: avançar;
- domínio parcial: manter ou avançar moderadamente;
- erro ou trava: reduzir intervalo;
- marcação manual: criar revisão;
- desmarcação antes da execução: remover da fila;
- histórico já concluído: preservar como histórico.

---

# Funcionalidades que devem ser preservadas e melhoradas

## 1. Dashboard

Manter:

- readiness geral;
- readiness por área;
- progresso do plano;
- streak;
- calendário de estudo;
- metas;
- recomendações diárias;
- estatísticas de quizzes;
- estatísticas de flashcards;
- tempo estudado;
- retenção;
- acesso a relatórios.

Melhorar:

- utilizar exclusivamente dados reais;
- mostrar claramente como cada indicador é calculado;
- permitir abrir os dados que originaram a métrica;
- diferenciar ausência de dados de desempenho ruim;
- não mostrar readiness artificial antes de existir atividade suficiente;
- mostrar “Hoje”, “Pendências” e “Revisões” como prioridades principais;
- garantir consistência com Plano e Revisar Hoje.

## 2. Plano

Manter:

- seis semanas;
- dias e blocos de estudo;
- detalhes dos blocos;
- status;
- minutos;
- notas;
- padrão usado;
- dificuldade;
- vínculo com quizzes;
- vínculo com flashcards;
- pausas;
- mocks.

Melhorar:

- calendário dinâmico;
- início em qualquer dia da semana;
- dias de descanso;
- reagendamento;
- recuperação de dias perdidos;
- divisão automática de conteúdo quando exceder a disponibilidade;
- edição da disponibilidade semanal;
- visualização por semana e por agenda;
- indicação clara de hoje, atrasado, concluído e reagendado;
- histórico de alterações;
- ação para concluir o dia;
- ação para desfazer conclusão;
- confirmação antes de reiniciar ou recalcular o plano.

## 3. Revisar Hoje

Manter:

- fila de revisão do plano;
- flashcards vencidos;
- quizzes vencidos;
- tópicos fracos;
- gaps de mocks;
- diário de aprendizagem;
- reflexão semanal;
- exercício de explicar sem consultar;
- sugestão de próximo estudo.

Melhorar:

- usar fila única normalizada;
- ordenar por prioridade e atraso;
- explicar por que cada item está na fila;
- permitir revisar, adiar, dispensar ou reagendar;
- evitar itens fantasmas;
- remover marcação cancelada;
- registrar histórico;
- mostrar progresso da sessão;
- mostrar duração estimada;
- fazer “O que estudar amanhã” consultar a mesma agenda do Plano;
- usar “Próximo dia de estudo” quando amanhã for descanso;
- permitir consultar reflexões antigas;
- permitir editar reflexões já salvas.

## 4. Flashcards

Manter:

- criação;
- edição;
- exclusão;
- categorias;
- tags;
- busca;
- filtros;
- sessão de estudo;
- virar cartão;
- “sabia”;
- “não sabia”;
- status;
- repetição espaçada;
- criação a partir de tópicos.

Melhorar:

- sessões com quantidade configurável;
- histórico por cartão;
- estatísticas de acerto;
- detecção de cartões duplicados;
- importação e exportação;
- vínculo com conteúdos do plano;
- editor melhor;
- atalhos de teclado;
- estados novos, aprendendo e dominados;
- suporte a Markdown em pergunta e resposta.

## 5. Quizzes

Manter:

- perguntas versionadas;
- filtros;
- quiz diário;
- prática filtrada;
- revisão de erros;
- quizzes por flashcards;
- perguntas marcadas;
- histórico;
- tempo total;
- tempo por questão;
- correção automática;
- autoavaliação de questões abertas.

Melhorar:

- normalizar tipos de questão;
- mostrar explicação após resposta;
- histórico por pergunta;
- métricas por tópico;
- fila de erros;
- repetição espaçada centralizada;
- sessões configuráveis;
- opção de refazer;
- evitar repetir questões recentes sem necessidade;
- salvar respostas parcialmente preenchidas;
- validar conteúdo de perguntas;
- permitir importar novos conjuntos.

## 6. Timer

Manter presets:

- 25 minutos;
- 45 minutos;
- 60 minutos;
- 90 minutos.

Manter categorias:

- algoritmos;
- system design;
- JavaScript;
- mock;
- geral.

Melhorar:

- permitir associar a sessão a um bloco do plano;
- pausar;
- retomar;
- encerrar;
- cancelar;
- adicionar tempo manual;
- editar sessão;
- remover sessão;
- histórico diário e semanal;
- funcionar ao navegar entre páginas;
- recuperar sessão após reload;
- não contabilizar automaticamente sessão abandonada;
- notificações acessíveis;
- modo cronômetro além de contagem regressiva.

## 7. Playground

Manter:

- Monaco Editor;
- execução JavaScript;
- captura de console;
- testes;
- timeout;
- Web Worker;
- soluções salvas;
- complexidade;
- notas;
- drills.

Melhorar:

- lazy loading;
- templates;
- múltiplos casos de teste;
- comparação de saída;
- status por teste;
- erros legíveis;
- reinicialização do worker após timeout;
- prevenção de travamento;
- histórico de versões;
- associação ao plano;
- suporte a TypeScript como evolução opcional;
- não executar código com acesso direto ao contexto principal da página.

## 8. Mocks

Manter:

- Coding;
- System Design;
- Behavioral;
- Full Loop;
- pergunta;
- solução;
- feedback;
- pontos fortes;
- pontos fracos;
- próximos passos;
- rubrica;
- readiness;
- áudio;
- STAR;
- templates;
- checklist.

Melhorar:

- fluxo guiado de início e conclusão;
- timer específico;
- rubricas por tipo;
- critérios claros de pontuação;
- histórico;
- comparação de evolução;
- gaps convertidos em revisão;
- áudio armazenado separadamente;
- controle de tamanho e remoção de áudio;
- estados de permissão do microfone;
- opção de mock sem gravação;
- checklist com propósito claro;
- “Nova sessão” deve criar uma sessão real e rastreável;
- permitir continuar uma sessão em andamento.

## 9. Notas

Manter:

- Markdown;
- categorias;
- toolbar;
- preview;
- templates;
- notas por tópico.

Melhorar:

- autosave;
- indicador de salvamento;
- busca;
- tags;
- favoritos;
- notas vinculadas ao plano, quiz, mock ou flashcard;
- histórico mínimo de alterações;
- exclusão com confirmação;
- exportação;
- editor e preview acessíveis.

## 10. Recursos

Manter recursos para:

- algoritmos;
- estruturas de dados;
- frontend system design;
- JavaScript;
- inglês técnico.

Melhorar:

- tags;
- busca;
- status “não iniciado”, “em andamento” e “concluído”;
- favoritos;
- associação a tópicos;
- recomendações com justificativa;
- evitar recomendar conteúdos já dominados sem razão;
- permitir adicionar recursos próprios.

## 11. Inglês técnico

Preservar:

- frases;
- vocabulário;
- respostas de entrevista.

Melhorar:

- organização por contexto;
- favoritos;
- prática;
- flashcards gerados;
- exemplos de uso;
- registro do que já foi praticado.

## 12. Relatórios semanais

Manter:

- comparação entre semanas;
- horas;
- blocos;
- quizzes;
- readiness;
- pontos fortes;
- pontos fracos;
- recomendações;
- Markdown;
- PDF.

Melhorar:

- permitir selecionar semana;
- consultar relatórios antigos;
- mostrar origem dos dados;
- não misturar horas estimadas com horas registradas;
- diferenciar falta de dados de zero;
- gerar relatório somente com métricas válidas;
- manter reflexões semanais associadas ao relatório;
- evitar métricas duplicadas.

## 13. Backup

Manter exportação JSON.

Adicionar:

- importação pela interface;
- validação com Zod;
- versionamento do schema;
- preview antes de importar;
- importação substituindo ou mesclando;
- detecção de duplicidade;
- relatório de erros;
- backup completo;
- backup seletivo;
- migração da versão antiga;
- opção de limpar todos os dados com confirmação reforçada.

## 14. Configurações

Criar uma área própria para:

- data inicial;
- timezone;
- disponibilidade por dia da semana;
- duração padrão;
- tema;
- preferências de notificação;
- metas semanais;
- regras de reagendamento;
- preferências do timer;
- dados e backup;
- reinício do plano.

---

# Readiness e tópicos de risco

Não implemente readiness como uma fórmula arbitrária escondida.

Crie documentação da fórmula e testes.

A pontuação pode considerar:

- conclusão do plano;
- consistência;
- quizzes;
- flashcards;
- mocks;
- retenção;
- revisões atrasadas;
- tempo real estudado.

Mas deve:

- ter pesos explícitos;
- exigir quantidade mínima de dados;
- limitar cada dimensão;
- não punir áreas ainda não iniciadas como se fossem fracasso;
- mostrar explicação ao usuário;
- permitir inspecionar os fatores da pontuação.

Exemplo conceitual:

```ts
type ReadinessBreakdown = {
  overall: number | null;
  confidence: "insufficient_data" | "low" | "medium" | "high";
  areas: ReadinessArea[];
  factors: ReadinessFactor[];
};
```

## Heatmap

O heatmap deve utilizar dados reais de atividade.

Pode representar:

- minutos registrados por dia;
- blocos concluídos;
- sessões realizadas;
- intensidade combinada.

Escolha uma definição e deixe isso claro na interface.

Não misture métricas diferentes sem explicação.

## Tópicos de risco

Um tópico pode ser considerado em risco por:

- erros repetidos;
- baixa confiança;
- dificuldade alta;
- revisões vencidas;
- desempenho ruim em mocks;
- muitas marcações “Travei”;
- baixa retenção.

A função deve retornar não apenas o score, mas os motivos:

```ts
type RiskTopic = {
  topicId: string;
  score: number;
  reasons: RiskReason[];
  recommendedActions: RecommendedAction[];
};
```

---

# Experiência de usuário

A interface deve priorizar clareza.

## Navegação principal

Sugestão:

```text
Dashboard
Plano
Revisar
Flashcards
Quizzes
Mocks
Playground
Notas
Recursos
Relatórios
Configurações
```

## Dashboard prioritário

O topo do Dashboard deve mostrar:

1. Estudo atual.
2. Conteúdos pendentes.
3. Revisões devidas.
4. Próxima ação recomendada.

Métricas secundárias devem aparecer abaixo.

## Estados obrigatórios

Toda funcionalidade deve considerar:

- loading;
- vazio;
- erro;
- sucesso;
- confirmação;
- dados insuficientes;
- operação em andamento.

## Acessibilidade

Implemente:

- navegação por teclado;
- foco visível;
- labels;
- contraste;
- ARIA quando necessário;
- dialogs acessíveis;
- mensagens de erro associadas aos campos;
- suporte a redução de movimento;
- atalhos que não interfiram com inputs e editores.

## Responsividade

A aplicação deve funcionar em:

- desktop;
- tablet;
- celular.

O timer não pode ocupar espaço excessivo em telas menores.

---

# Entregas

## Entrega 0 — Auditoria e planejamento

Não escreva código ainda.

Entregue:

- inventário de páginas;
- inventário de componentes;
- inventário de hooks;
- inventário de utilitários;
- inventário de fontes de dados;
- mapa das chaves atuais do localStorage;
- mapa de dependências;
- problemas arquiteturais;
- regras duplicadas;
- funcionalidades incompletas;
- funcionalidades descritas no README que não funcionam como esperado;
- plano de migração;
- riscos;
- proposta da arquitetura nova.

Identifique tudo que pode ser reaproveitado:

- conteúdo;
- estilos;
- componentes;
- schemas;
- utilitários;
- testes;
- assets.

## Entrega 1 — Fundação do projeto

Criar:

- novo projeto Next.js;
- App Router;
- TypeScript strict;
- Tailwind;
- componentes UI;
- tema;
- layout;
- navegação;
- responsividade;
- lint;
- formatação;
- aliases;
- Vitest;
- Testing Library;
- Playwright;
- tratamento de erros;
- estrutura de features.

Criar páginas vazias funcionais para todas as rotas.

Não implementar regras do produto nessa entrega.

## Entrega 2 — Banco local, schemas e migração

Criar:

- IndexedDB;
- schemas;
- tabelas;
- repositórios;
- versionamento;
- migrations;
- backup;
- importação;
- exportação;
- leitura do backup antigo;
- testes de persistência.

Definir IDs estáveis para todos os conteúdos.

## Entrega 3 — Domínio de calendário e agenda

Implementar:

- configurações semanais;
- datas locais;
- timezone;
- dias de descanso;
- scheduler;
- disponibilidade;
- divisão de conteúdos;
- próxima data válida;
- agenda efetiva;
- testes de calendário.

Testar obrigatoriamente início em:

- segunda;
- quinta;
- sábado;
- domingo.

## Entrega 4 — Progresso e recuperação do plano

Implementar:

- status;
- conclusão;
- trava;
- dificuldade;
- confiança;
- minutos;
- notas;
- reagendamento;
- dia perdido;
- mover plano;
- pular;
- desfazer;
- histórico;
- persistência.

## Entrega 5 — Página Plano

Construir a interface completa do Plano utilizando exclusivamente os domínios das entregas anteriores.

Não duplicar regras de calendário na página.

## Entrega 6 — Dashboard

Implementar primeiro:

- estudo atual;
- pendências;
- revisões;
- progresso;
- streak;
- calendário;
- recomendações.

Depois adicionar métricas avançadas.

Todos os dados devem ser derivados dos serviços centrais.

## Entrega 7 — Revisão espaçada e Revisar Hoje

Implementar:

- domínio de revisão;
- geração de ciclos;
- fila unificada;
- prioridades;
- reagendamento;
- conclusão;
- histórico;
- diário;
- reflexão semanal;
- próximo estudo.

## Entrega 8 — Flashcards

Migrar conteúdo e implementar todos os recursos descritos.

## Entrega 9 — Quizzes

Migrar as questões atuais, normalizar o schema e implementar todos os fluxos.

## Entrega 10 — Timer

Criar timer global e associável às atividades.

## Entrega 11 — Playground

Migrar Monaco, worker, testes e soluções salvas.

## Entrega 12 — Mocks e behavioral

Migrar:

- registros;
- STAR;
- templates;
- checklist;
- rubricas;
- áudio;
- gaps;
- readiness por mock.

## Entrega 13 — Notas, recursos e inglês técnico

Implementar os três módulos e seus vínculos com os outros domínios.

## Entrega 14 — Readiness, risco e relatórios

Somente implemente após existir uma base real de dados.

Documentar as fórmulas.

Adicionar testes para todos os cálculos.

## Entrega 15 — Backup completo e migração final

Implementar:

- importação do app anterior;
- merge;
- substituição;
- validação;
- relatório;
- rollback em caso de erro.

## Entrega 16 — Qualidade final

Executar:

- auditoria de acessibilidade;
- testes unitários;
- testes de integração;
- testes E2E;
- análise de bundle;
- lazy loading;
- tratamento de erros;
- responsividade;
- validação dos fluxos;
- revisão do README.

---

# Testes mínimos

## Unitários

Cobrir:

- calendário;
- progresso;
- scheduler;
- reagendamento;
- revisão;
- repetição espaçada;
- readiness;
- tópicos de risco;
- streak;
- métricas;
- importação;
- migração;
- validações.

## Integração

Garantir que:

- Plano e Dashboard mostram o mesmo estudo atual;
- Plano e Revisar Hoje mostram o mesmo próximo estudo;
- concluir bloco atualiza o progresso;
- marcar revisão cria item;
- desmarcar remove item ainda não executado;
- quiz errado cria revisão;
- flashcard respondido atualiza ciclo;
- gap de mock cria recomendação;
- sessão do timer atualiza métricas;
- reflexão salva aparece no relatório correto.

## E2E

Criar cenários para:

1. Configurar data inicial.
2. Começar o plano em uma quinta-feira.
3. Concluir o primeiro bloco.
4. Não estudar no dia seguinte.
5. Mover o conteúdo para frente.
6. Reagendar outro bloco.
7. Marcar conteúdo para revisão.
8. Concluir uma revisão.
9. Fazer quiz.
10. Estudar flashcards.
11. Registrar sessão do timer.
12. Criar mock.
13. Salvar reflexão semanal.
14. Exportar backup.
15. Limpar dados.
16. Importar backup.
17. Confirmar restauração.

---

# Critérios globais de aceite

A reconstrução estará concluída quando:

- [ ] O app utiliza Next.js com App Router.
- [ ] TypeScript está em modo estrito.
- [ ] Não existe lógica de negócio centralizada em um único componente gigante.
- [ ] O calendário começa corretamente em qualquer dia.
- [ ] O sábado usa sua disponibilidade real.
- [ ] O domingo respeita descanso.
- [ ] O conteúdo não avança automaticamente com a data.
- [ ] Dias perdidos podem ser recuperados.
- [ ] Dashboard, Plano e Revisar Hoje são consistentes.
- [ ] “O que estudar amanhã” corresponde à agenda.
- [ ] Revisões não permanecem indevidamente na fila.
- [ ] Reflexões anteriores podem ser consultadas.
- [ ] Readiness e risco possuem explicação.
- [ ] Heatmap possui definição clara.
- [ ] Timer está ligado às atividades.
- [ ] Mocks possuem sessões rastreáveis.
- [ ] Todos os conteúdos antigos foram migrados.
- [ ] Existe importação e exportação.
- [ ] Dados antigos podem ser migrados.
- [ ] Testes passam.
- [ ] Lint passa.
- [ ] TypeScript passa.
- [ ] Build passa.
- [ ] Fluxos principais possuem testes E2E.
- [ ] A aplicação funciona em desktop e mobile.
- [ ] O README representa o comportamento real.

---

# Restrições

Não faça:

- conversão automática arquivo por arquivo;
- cópia da arquitetura antiga;
- componente `App` concentrando toda a aplicação;
- acesso direto ao storage em componentes;
- cálculo diferente em cada página;
- datas baseadas em labels fixos;
- readiness sem explicação;
- mocks de dados substituindo funcionalidades reais;
- entrega de todas as features em um único passo;
- remoção de conteúdo existente sem documentar;
- alteração visual completa sem necessidade;
- criação de backend nesta fase;
- autenticação desnecessária para um app pessoal local-first.

# Resultado esperado de cada entrega

Ao terminar cada entrega, apresente:

```md
## Entrega concluída

### Implementado

### Arquivos criados

### Arquivos modificados

### Decisões técnicas

### Regras de negócio adicionadas

### Testes adicionados

### Comandos executados

### Resultado do TypeScript

### Resultado do lint

### Resultado dos testes

### Resultado do build

### Pendências

### Próxima entrega sugerida
```

Comece exclusivamente pela **Entrega 0 — Auditoria e planejamento**.

Não escreva código nesta primeira etapa.
