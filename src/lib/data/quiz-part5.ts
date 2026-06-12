// Part 5: BFF additional (4), Accessibility/a11y (10)
export const PART5 = [
  // ── BFF / Backend for Frontend ────────────────────────────────────────────

  {
    id: "q-bff-002",
    topic: "BFF",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["BFF", "API Design", "Frontend System Design"],
    linkedFlashcardTags: ["system-design", "bff"],
    prompt: "Qual das afirmações sobre BFF é INCORRETA?",
    options: [
      "BFF permite que cada cliente tenha sua própria camada de API otimizada",
      "BFF elimina completamente a necessidade de um gateway de API",
      "BFF pode agregar chamadas a múltiplos microsserviços em um único endpoint",
      "BFF reduz overfetching ao retornar somente os dados que a UI precisa",
    ],
    correctAnswer: "BFF elimina completamente a necessidade de um gateway de API",
    explanation:
      "BFF e API Gateway são complementares, não substitutos. O gateway lida com cross-cutting concerns (auth, rate limiting, routing), enquanto o BFF lida com formatação e agregação de dados específicos para cada cliente. Muitas arquiteturas usam ambos: gateway na frente de múltiplos BFFs.",
  },

  {
    id: "q-bff-003",
    topic: "BFF",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "open",
    tags: ["BFF", "GraphQL", "REST"],
    linkedFlashcardTags: ["system-design", "bff"],
    prompt: "Como GraphQL se relaciona com o padrão BFF? Um é substituto do outro?",
    idealAnswer:
      "GraphQL pode ser visto como uma forma de implementar BFF — o cliente controla exatamente quais dados busca, eliminando overfetching/underfetching. Diferenças: (1) GraphQL é uma linguagem de query; BFF é um padrão arquitetural; (2) Um BFF pode ser implementado com REST, GraphQL ou gRPC; (3) GraphQL tem schema único; BFF tem endpoints customizados por cliente; (4) GraphQL requer que o cliente saiba o schema de dados do domínio; BFF abstrai isso. Na prática: empresas usam BFF com REST para máximo controle, ou GraphQL como BFF universal quando múltiplos clientes precisam de flexibilidade.",
    keyPoints: [
      "GraphQL pode implementar BFF",
      "BFF é padrão arquitetural, GraphQL é linguagem",
      "BFF abstrai domínio; GraphQL expõe schema",
      "Podem ser usados juntos",
    ],
    explanation:
      "Pergunta frequente em system design: entender que são conceitos diferentes mas relacionados.",
  },

  {
    id: "q-bff-004",
    topic: "BFF",
    group: "frontend_system_design",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["BFF", "caching", "performance"],
    linkedFlashcardTags: ["system-design", "bff"],
    prompt: "Como você implementaria caching em um BFF para maximizar performance do frontend?",
    idealAnswer:
      "Estratégia de caching em BFF: (1) Cache por tipo de dados: dados estáticos (config, enums) → cache longo (24h+); dados semi-estáticos (perfil de usuário) → cache médio (5-15min, invalidado em update); dados dinâmicos (feed) → cache curto (30s-2min) ou SWR; (2) Cache em memória (Redis) no BFF para agregações custosas de múltiplos serviços; (3) HTTP Cache headers para o cliente: Cache-Control, ETag para validação conditional; (4) Stale-While-Revalidate para boa UX: serve cache e atualiza em background; (5) Invalidação por evento: pub/sub para invalidar cache quando dados mudam no backend; (6) Per-user vs shared cache: dados de usuário = per-user; dados públicos = shared cache.",
    keyPoints: [
      "Redis para agregações no BFF",
      "SWR para dados dinâmicos",
      "Invalidação por evento",
      "Shared vs per-user cache",
    ],
    explanation:
      "Caching no BFF é multiplicador de performance: une server-side cache com otimizações específicas do cliente.",
  },

  {
    id: "q-bff-005",
    topic: "BFF",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["BFF", "resilience", "circuit breaker"],
    linkedFlashcardTags: ["system-design", "bff"],
    prompt:
      "Qual padrão de resiliência é mais importante implementar no BFF quando ele agrega múltiplos microsserviços?",
    options: [
      "Circuit Breaker: isola falhas de serviços individuais para não cascatear",
      "Retry ilimitado: tenta até obter resposta de todos os serviços",
      "Timeout global: todos os serviços têm o mesmo SLA máximo",
      "Fallback para banco de dados local como backup primário",
    ],
    correctAnswer: "Circuit Breaker: isola falhas de serviços individuais para não cascatear",
    explanation:
      "O BFF agrega N serviços — se um serviço falha com latência alta, sem Circuit Breaker o BFF fica travado esperando todos. Com Circuit Breaker: detecta falhas, abre o circuito (resposta imediata de erro/fallback), e testa periodicamente se o serviço voltou. Padrão complementar: Timeout por serviço e resposta parcial (retorna dados dos serviços que funcionaram).",
  },

  // ── ACCESSIBILITY / A11Y ──────────────────────────────────────────────────

  {
    id: "q-a11y-001",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Accessibility", "ARIA", "semantics"],
    linkedFlashcardTags: ["a11y", "aria"],
    prompt: "Qual das práticas abaixo é ERRADA quando se usa ARIA?",
    options: [
      "Adicionar role='button' em um <div> que não tem comportamento de botão nativo",
      "Usar aria-label quando o botão tem apenas um ícone sem texto visível",
      "Não usar ARIA quando o elemento HTML semântico já comunica o papel correto",
      "Usar aria-hidden='true' para esconder elementos decorativos de leitores de tela",
    ],
    correctAnswer: "Adicionar role='button' em um <div> que não tem comportamento de botão nativo",
    explanation:
      "A regra número 1 de ARIA: 'Não use ARIA se puder usar HTML nativo'. Um <div role='button'> precisa de todo o comportamento manual: tabindex, keydown para Enter/Space, focus management. Usar <button> nativo já inclui tudo. ARIA deve complementar semântica, não substituir HTML correto.",
  },

  {
    id: "q-a11y-002",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Accessibility", "contrast", "WCAG"],
    linkedFlashcardTags: ["a11y", "wcag"],
    prompt: "Qual é o ratio de contraste mínimo exigido pelo WCAG 2.1 nível AA para texto normal?",
    options: ["4.5:1", "3:1", "7:1", "2:1"],
    correctAnswer: "4.5:1",
    explanation:
      "WCAG 2.1 AA exige: texto normal (< 18pt / 14pt negrito) → 4.5:1; texto grande (≥ 18pt ou ≥ 14pt negrito) → 3:1; componentes de UI (bordas de input, ícones funcionais) → 3:1. Nível AAA: texto normal → 7:1; texto grande → 4.5:1. Use ferramentas como Colour Contrast Analyser ou a11y-color-contrast para verificar. Cinza claro (#767676) em branco falha AA para texto normal.",
  },

  {
    id: "q-a11y-003",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Accessibility", "focus management", "modal"],
    linkedFlashcardTags: ["a11y", "focus"],
    prompt: "Ao abrir um modal, qual sequência de ações de foco está CORRETA?",
    options: [
      "Mover foco para o modal → prender foco dentro do modal → ao fechar, restaurar foco ao elemento que abriu",
      "Deixar foco no botão que abriu → usuário navega manualmente até o modal",
      "Mover foco para o botão de fechar do modal automaticamente",
      "Desativar todo o foco fora do modal via display:none no resto da página",
    ],
    correctAnswer:
      "Mover foco para o modal → prender foco dentro do modal → ao fechar, restaurar foco ao elemento que abriu",
    explanation:
      "Focus management em modais: (1) ao abrir, mover foco para o primeiro elemento interativo do modal (ou o modal em si com tabindex=-1); (2) prender foco dentro do modal com focus trap (Tab/Shift+Tab devem ciclar dentro do modal); (3) ao fechar com Escape ou botão, restaurar foco ao elemento que ativou o modal. Sem isso, usuários de teclado/leitor de tela ficam 'perdidos' no DOM.",
  },

  {
    id: "q-a11y-004",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Accessibility", "images", "alt"],
    linkedFlashcardTags: ["a11y", "images"],
    prompt: "Para uma imagem decorativa (apenas visual, sem informação), o atributo alt correto é:",
    options: [
      "alt='' (string vazia — imagem é ignorada por leitores de tela)",
      "alt='imagem decorativa'",
      "Omitir o atributo alt completamente",
      "aria-hidden='true' em vez de alt",
    ],
    correctAnswer: "alt='' (string vazia — imagem é ignorada por leitores de tela)",
    explanation:
      "alt='' (vazio) instrui o leitor de tela a ignorar a imagem — ela não é anunciada. Omitir alt: o leitor de tela pode anunciar o nome do arquivo ('decorativo-header-2024.png'), confuso e sem valor. alt='imagem decorativa': anuncia o texto, adicionando ruído. aria-hidden='true' no <img> também funciona mas alt='' é o padrão recomendado. Para imagens informativas: alt deve descrever a informação transmitida.",
  },

  {
    id: "q-a11y-005",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "medium",
    type: "open",
    tags: ["Accessibility", "React", "live regions"],
    linkedFlashcardTags: ["a11y", "aria"],
    prompt: "O que são aria-live regions e quando usar em aplicações React?",
    idealAnswer:
      "aria-live regions são áreas do DOM que são anunciadas automaticamente por leitores de tela quando o conteúdo muda, sem precisar de foco. Valores: aria-live='polite': anuncia quando o leitor termina o que está falando — para notificações não urgentes (toasts, status de carregamento); aria-live='assertive': interrompe o leitor imediatamente — para erros críticos. Em React: geralmente adicionado a um container vazio que recebe mensagens de status dinâmico. Exemplos: mensagem 'X resultados encontrados' após busca; 'Email enviado com sucesso'; contador de itens no carrinho. Cuidado: não abuse de assertive (interrompe e frustra).",
    keyPoints: [
      "polite: não urgente",
      "assertive: urgente/erros",
      "React: container estático que recebe msgs dinâmicas",
      "Não abusar de assertive",
    ],
    explanation:
      "aria-live é essencial para notificações dinâmicas em SPAs onde o DOM muda sem navegação de página.",
  },

  {
    id: "q-a11y-006",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "hard",
    type: "interview",
    tags: ["Accessibility", "keyboard", "navigation"],
    linkedFlashcardTags: ["a11y", "keyboard"],
    prompt:
      "Você está implementando um componente de Tabs acessível. Quais comportamentos de teclado deve implementar?",
    idealAnswer:
      "Tabs acessíveis — padrão ARIA Authoring Practices: (1) Tab: move foco para dentro do tablist, depois para o conteúdo do painel ativo. Tab não navega entre tabs; (2) Arrow Right/Down: move para próxima tab (automático: ativa a tab; manual: só foca); (3) Arrow Left/Up: move para tab anterior; (4) Home/End: primeira/última tab; (5) Enter/Space: ativa tab focada (em modo manual); (6) Delete: remove tab se remoção for permitida. Roles: tablist no container, tab nos botões (aria-selected, aria-controls), tabpanel no conteúdo (aria-labelledby). Focus: ao ativar tab, mover foco para o tabpanel ou manter na tab (depende da UX).",
    keyPoints: [
      "Tab vai para tablist/painel (não navega entre tabs)",
      "Arrows navegam entre tabs",
      "aria-selected e aria-controls",
      "tabpanel com aria-labelledby",
    ],
    explanation:
      "Tabs são componente frequente em entrevistas de a11y. Saber o padrão Arrow Key navigation é diferencial.",
  },

  {
    id: "q-a11y-007",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Accessibility", "forms", "labels"],
    linkedFlashcardTags: ["a11y", "forms"],
    prompt: "Qual é a forma MAIS robusta de associar um label a um input?",
    options: [
      "<label htmlFor='email'>Email</label><input id='email' />",
      "placeholder='Email' no input (sem label visível)",
      "aria-label='Email' no input (sem label visível)",
      "Texto adjacente visualmente mas sem associação programática",
    ],
    correctAnswer: "<label htmlFor='email'>Email</label><input id='email' />",
    explanation:
      "htmlFor/id cria associação programática nativa: (1) leitor de tela anuncia o label ao focar no input; (2) clicar no label foca o input (área de clique maior); (3) mais compatível com todos os ATs. placeholder sozinho: desaparece ao digitar, não é anunciado consistentemente como label. aria-label funciona mas não tem a vantagem do clique. label visualmente adjacente mas sem associação: leitor de tela não conecta os dois.",
  },

  {
    id: "q-a11y-008",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "hard",
    type: "open",
    tags: ["Accessibility", "testing", "automated"],
    linkedFlashcardTags: ["a11y", "testing"],
    prompt:
      "Quais ferramentas e estratégias de teste você usa para garantir acessibilidade em uma aplicação frontend?",
    idealAnswer:
      "Estratégia em camadas: (1) Automatizado: axe-core (React: @axe-core/react ou jest-axe) — detecta ~30-40% dos issues de a11y em tempo de desenvolvimento; eslint-plugin-jsx-a11y para regras estáticas; Lighthouse (browser ou CI) para score de a11y. (2) Manual com teclado: navegar toda a UI usando Tab, Shift+Tab, Arrow keys, Enter, Escape — verificar foco visível, ordem lógica, nenhuma armadilha de foco. (3) Leitores de tela: VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android) — testar com Safari+VoiceOver e Chrome+NVDA para maior cobertura. (4) Zoom: testar a 200-400% — layout não deve quebrar. (5) Reduced motion: testar com prefers-reduced-motion.",
    keyPoints: [
      "axe-core/jest-axe para automatizado",
      "Navegação por teclado manual",
      "VoiceOver + NVDA para leitores de tela",
      "Zoom 200-400% e reduced motion",
    ],
    explanation:
      "Testes de a11y são combinação de automatizado (rápido, detecta ~30%) e manual (detalhado). Automático nunca é suficiente sozinho.",
  },

  {
    id: "q-a11y-009",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Accessibility", "color", "perception"],
    linkedFlashcardTags: ["a11y", "color"],
    prompt: "Qual diretriz do WCAG proíbe usar cor como ÚNICO meio de transmitir informação?",
    options: [
      "1.4.1 Use of Color — informação não pode depender só de cor",
      "1.4.3 Contrast Minimum — texto deve ter contraste suficiente",
      "2.1.1 Keyboard — todo conteúdo deve ser acessível por teclado",
      "4.1.2 Name, Role, Value — componentes UI devem ter nome e role",
    ],
    correctAnswer: "1.4.1 Use of Color — informação não pode depender só de cor",
    explanation:
      "WCAG 1.4.1: cor não pode ser o único diferenciador visual. Exemplos problemáticos: gráfico de linhas diferenciado apenas por cor (daltônico não consegue distinguir); campo obrigatório indicado apenas com borda vermelha; status 'aprovado/reprovado' apenas por cor verde/vermelha. Soluções: adicionar ícone, texto, pattern ou outro diferenciador visual junto com a cor.",
  },

  {
    id: "q-a11y-010",
    topic: "Accessibility",
    group: "accessibility",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Accessibility", "skip links", "navigation"],
    linkedFlashcardTags: ["a11y", "navigation"],
    prompt: "O que é um 'skip link' e por que ele é importante?",
    options: [
      "Link escondido no início da página que permite pular para o conteúdo principal, evitando nav repetitiva",
      "Link que ignora validação de formulário",
      "Atalho de teclado para pular para a próxima seção",
      "Atributo que remove um link da ordem de tabulação",
    ],
    correctAnswer:
      "Link escondido no início da página que permite pular para o conteúdo principal, evitando nav repetitiva",
    explanation:
      "Skip links são visualmente ocultos (aparecem ao receber foco) e permitem que usuários de teclado e leitores de tela pulem o menu de navegação repetido em cada página. Implementação: <a href='#main-content' class='skip-link'>Pular para conteúdo</a> com CSS que o posiciona fora da tela normalmente e aparece em focus. Crítico para sites com navegação extensa. WCAG 2.4.1 (Bypass Blocks) exige mecanismo para pular conteúdo repetido.",
  },
];
