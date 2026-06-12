// Part 4: JavaScript (16), React (16), Frontend System Design (12)
export const PART4 = [
  // ── JAVASCRIPT ───────────────────────────────────────────────────────────────

  {
    id: "q-javascript-001",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["JavaScript", "hoisting", "let-const"],
    linkedFlashcardTags: ["javascript", "hoisting"],
    prompt: "O que acontece ao acessar uma variável `let` antes da sua linha de declaração?",
    options: [
      "ReferenceError — let e const ficam na Temporal Dead Zone (TDZ) até a declaração",
      "Retorna undefined, igual a var",
      "Retorna null",
      "Retorna 0 como valor padrão",
    ],
    correctAnswer:
      "ReferenceError — let e const ficam na Temporal Dead Zone (TDZ) até a declaração",
    explanation:
      "let e const são içados (hoisted) mas não inicializados — ficam na TDZ do início do bloco até a declaração. Acessar na TDZ lança ReferenceError. var é içado E inicializado como undefined, por isso não lança erro.",
  },

  {
    id: "q-javascript-002",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["JavaScript", "typeof"],
    linkedFlashcardTags: ["javascript"],
    prompt: "Qual é o resultado de `typeof null` em JavaScript?",
    options: [
      '"object" — bug histórico do JavaScript mantido por retrocompatibilidade',
      '"null"',
      '"undefined"',
      '"error"',
    ],
    correctAnswer: '"object" — bug histórico do JavaScript mantido por retrocompatibilidade',
    explanation:
      "typeof null === 'object' é um bug da implementação original do JavaScript de 1995. null não é um objeto — é um valor primitivo. Correto para checar null: value === null. Este bug nunca foi corrigido para não quebrar código existente.",
  },

  {
    id: "q-javascript-003",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["JavaScript", "event-loop"],
    linkedFlashcardTags: ["javascript", "event-loop"],
    prompt: "Qual é a ordem de execução do seguinte código?",
    code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
    options: [
      "A, D, C, B — síncronos primeiro, depois microtask (Promise), depois macrotask (setTimeout)",
      "A, B, C, D — ordem de escrita",
      "A, D, B, C — síncronos primeiro, depois macrotasks, depois microtasks",
      "A, C, D, B — Promise antes de síncrono pendente",
    ],
    correctAnswer:
      "A, D, C, B — síncronos primeiro, depois microtask (Promise), depois macrotask (setTimeout)",
    explanation:
      "A call stack executa código síncrono primeiro: A e D. Ao esvaziar, processa a microtask queue (Promises, queueMicrotask): C. Só depois processa macrotasks (setTimeout, setInterval): B. Regra: microtasks têm prioridade sobre macrotasks.",
  },

  {
    id: "q-javascript-004",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["JavaScript", "closures"],
    linkedFlashcardTags: ["javascript", "closure"],
    prompt: "O que é closure em JavaScript? Dê um exemplo de uso prático.",
    idealAnswer:
      "Closure é uma função que mantém acesso ao escopo léxico onde foi criada, mesmo após esse escopo ter terminado de executar. A função 'fecha sobre' as variáveis do escopo externo. Exemplo prático: factory de funções counter — cada chamada de makeCounter() cria uma count independente. Em React: hooks como useState dependem de closures para capturar o valor correto do estado em event handlers. Módulo pattern: variáveis privadas através de closure que só são acessíveis pelas funções expostas.",
    keyPoints: [
      "Acessa escopo léxico após término da função externa",
      "Variáveis compartilhadas entre chamadas da mesma closure",
      "Usado em: factories, módulos, callbacks, React hooks",
      "Cuidado: closures em loops com var capturam a mesma variável",
    ],
    explanation:
      "Closures são fundamentais em JavaScript — aparece em praticamente toda entrevista de JS.",
  },

  {
    id: "q-javascript-005",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["JavaScript", "this"],
    linkedFlashcardTags: ["javascript"],
    prompt: "Qual é a diferença de comportamento de `this` entre função arrow e função regular?",
    options: [
      "Arrow: this é lexical (captura do escopo onde foi definida). Regular: this é dinâmico (determinado pelo call-site)",
      "Arrow: this é sempre window/global. Regular: this é undefined em strict mode",
      "Arrow e regular têm o mesmo comportamento de this em todos os contextos",
      "Arrow: this é null. Regular: this é o objeto chamador",
    ],
    correctAnswer:
      "Arrow: this é lexical (captura do escopo onde foi definida). Regular: this é dinâmico (determinado pelo call-site)",
    explanation:
      "Funções regulares: this depende de COMO a função é chamada (obj.method() → obj; callback() → undefined em strict mode). Arrow functions não têm próprio this — herdam do escopo léxico. Consequência: arrow functions não servem como métodos de objetos quando precisa de this do objeto.",
  },

  {
    id: "q-javascript-006",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["JavaScript", "promises"],
    linkedFlashcardTags: ["javascript", "promise"],
    prompt: "Qual é a diferença entre Promise.all, Promise.allSettled, Promise.race e Promise.any?",
    idealAnswer:
      "Promise.all: rejeita imediatamente se qualquer promise rejeitar (fail-fast). Resolve com array de valores na ordem original. Use quando TODAS precisam ter sucesso. Promise.allSettled: espera TODAS terminarem (sucesso ou falha). Retorna array de {status: 'fulfilled'|'rejected', value|reason}. Use para operações independentes. Promise.race: resolve/rejeita com a PRIMEIRA a completar (qualquer resultado). Use para timeout. Promise.any: resolve com a PRIMEIRA a ter SUCESSO; rejeita apenas se TODAS rejeitarem. Use quando qualquer fonte de dados serve.",
    keyPoints: [
      "all: fail-fast, resolve com todos",
      "allSettled: espera todos, informa cada resultado",
      "race: primeiro a completar vence",
      "any: primeiro sucesso vence",
    ],
    explanation:
      "Conhecer a distinção entre os métodos de Promise é pergunta frequente em entrevistas de JavaScript.",
  },

  {
    id: "q-javascript-007",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["JavaScript", "async-await"],
    linkedFlashcardTags: ["javascript", "promise"],
    prompt: "O que acontece internamente quando a engine JavaScript encontra um `await`?",
    idealAnswer:
      "await pausa a execução da função async no ponto do await e retorna o controle para o event loop — sem bloquear a thread principal. A continuação da função (código após o await) é agendada como microtask quando a Promise resolve. Funções async sempre retornam uma Promise implicitamente. await em promise rejeitada lança exceção capturável com try/catch. Múltiplos awaits sequenciais executam em série. Para paralelismo, usar Promise.all([p1, p2]) e depois await.",
    keyPoints: [
      "Pausa a função, não bloqueia a thread",
      "Continuação = microtask",
      "async function retorna Promise",
      "Sequencial por padrão; usar Promise.all para paralelo",
    ],
    explanation:
      "Entender o modelo de execução de async/await é fundamental para debugging de código assíncrono.",
  },

  {
    id: "q-javascript-008",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["JavaScript", "const-imutabilidade"],
    linkedFlashcardTags: ["javascript"],
    prompt: "Por que `const` não garante imutabilidade de objetos em JavaScript?",
    options: [
      "`const` impede reatribuição da VARIÁVEL, mas propriedades do objeto referenciado podem ser modificadas livremente",
      "`const` é equivalente a `Object.freeze()` para objetos",
      "`const` impede qualquer modificação do valor, incluindo propriedades",
      "`const` congela apenas o primeiro nível do objeto",
    ],
    correctAnswer:
      "`const` impede reatribuição da VARIÁVEL, mas propriedades do objeto referenciado podem ser modificadas livremente",
    explanation:
      "const obj = {x: 1}; obj.x = 2 → válido. obj = {} → TypeError. Para imutabilidade: Object.freeze(obj) (shallow) ou deep freeze recursivo. Em React, isso explica por que mutação direta de estado não aciona re-render — a referência não muda.",
  },

  {
    id: "q-javascript-009",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["JavaScript", "debounce-throttle"],
    linkedFlashcardTags: ["javascript"],
    prompt: "Explique debounce e throttle. Quando usar cada um? Descreva a implementação básica.",
    idealAnswer:
      "Debounce: executa a função apenas após um período de INATIVIDADE. Cada chamada reinicia o timer. Implementação: clearTimeout(timer); timer = setTimeout(fn, delay). Use para: campo de busca (esperar usuário parar de digitar), redimensionamento de janela. Throttle: executa no máximo UMA VEZ por período. Ignora chamadas durante o intervalo. Implementação: usar lastCalled timestamp, se Date.now() - lastCalled >= delay, executar e atualizar lastCalled. Use para: scroll handler (60fps), rate limiting de cliques, drag events. Analogia: debounce = elevador que espera as portas fecharem; throttle = dar de ombros a máximo 1 por segundo.",
    keyPoints: [
      "Debounce: inatividade antes de executar",
      "Throttle: máximo uma vez por período",
      "Debounce usa clearTimeout + setTimeout",
      "Throttle usa timestamp ou flag",
    ],
    explanation:
      "Debounce e throttle são perguntas clássicas de otimização de performance em entrevistas.",
  },

  {
    id: "q-javascript-010",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["JavaScript", "prototype"],
    linkedFlashcardTags: ["javascript"],
    prompt:
      "O que acontece quando você acessa uma propriedade que não existe no objeto em JavaScript?",
    options: [
      "JavaScript percorre a cadeia de protótipos (prototype chain) até encontrar ou chegar ao null; retorna undefined se não encontrar",
      "Lança TypeError imediatamente",
      "Retorna null",
      "Busca em todas as variáveis do escopo atual",
    ],
    correctAnswer:
      "JavaScript percorre a cadeia de protótipos (prototype chain) até encontrar ou chegar ao null; retorna undefined se não encontrar",
    explanation:
      "Lookup de propriedade: objeto próprio → __proto__ → __proto__.__proto__ → ... → Object.prototype → null. Toda vez que você usa um método como .toString() em qualquer objeto, ele está sendo encontrado na cadeia de protótipos.",
  },

  {
    id: "q-javascript-011",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["JavaScript", "memory-leak"],
    linkedFlashcardTags: ["javascript"],
    prompt: "Qual padrão mais frequentemente causa memory leak em aplicações JavaScript modernas?",
    options: [
      "Event listeners adicionados a elementos DOM que são removidos sem remover o listener",
      "Variáveis locais declaradas dentro de funções",
      "Objetos criados com new dentro de loops",
      "Closures simples que não referenciam o DOM",
    ],
    correctAnswer:
      "Event listeners adicionados a elementos DOM que são removidos sem remover o listener",
    explanation:
      "Se o elemento DOM é removido mas o listener ainda referencia o elemento, o GC não pode coletar. O listener mantém o elemento na memória. Solução: removeEventListener antes de remover o elemento, ou usar AbortController. Outros leaks: timers não cancelados (clearInterval), closures em caches sem limite.",
  },

  {
    id: "q-javascript-012",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["JavaScript", "event-delegation"],
    linkedFlashcardTags: ["javascript"],
    prompt: "O que é event delegation e por que é importante para performance?",
    idealAnswer:
      "Ao invés de adicionar listener em cada elemento filho, adicionar um único listener no elemento pai e usar event.target para identificar qual filho foi clicado. Funciona graças ao event bubbling — eventos sobem pela árvore DOM. Vantagens: (1) menos listeners = menos memória; (2) funciona com elementos adicionados dinamicamente depois do listener; (3) menos código. Desvantagem: event.stopPropagation() no filho quebra a delegation. Padrão: document.querySelector('#lista').addEventListener('click', e => { if (e.target.matches('li')) handler(e.target) }). Muito usado em listas virtualizadas.",
    keyPoints: [
      "Listener único no pai",
      "event.target identifica o filho",
      "Funciona com elementos dinâmicos",
      "stopPropagation() pode quebrar",
    ],
    explanation:
      "Event delegation é uma técnica fundamental de performance e é frequentemente perguntada em entrevistas.",
  },

  {
    id: "q-javascript-013",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["JavaScript", "shallow-deep-copy"],
    linkedFlashcardTags: ["javascript"],
    prompt:
      "Qual método cria uma deep copy de um objeto JavaScript de forma simples (com limitações conhecidas)?",
    options: [
      "JSON.parse(JSON.stringify(obj)) — funciona para dados serializáveis, perde Functions, undefined, Date, e referências circulares",
      "Object.assign({}, obj) — deep copy completa sem limitações",
      "structuredClone(obj) — nativo mas com restrições em navegadores antigos",
      "{...obj} — spread operator cria deep copy automática",
    ],
    correctAnswer:
      "JSON.parse(JSON.stringify(obj)) — funciona para dados serializáveis, perde Functions, undefined, Date, e referências circulares",
    explanation:
      "JSON.parse/stringify: simples mas perde: functions, undefined, Symbols, Date (vira string), Set/Map, referências circulares (lança erro). Para deep copy completa: structuredClone() (nativo moderno) ou biblioteca como lodash cloneDeep. Object.assign e spread são shallow copies.",
  },

  {
    id: "q-javascript-014",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "open",
    tags: ["JavaScript", "generators"],
    linkedFlashcardTags: ["javascript"],
    prompt: "O que são generators em JavaScript? Para qual caso de uso são mais adequados?",
    idealAnswer:
      "Generators são funções que podem pausar e retomar execução via yield. Declaração: function* gen() {}. Retornam um iterator com next(). Cada chamada de next() executa até o próximo yield e pausa. Use cases: (1) Sequências lazy/infinitas — gerar IDs sem criar array; (2) Iteração customizada — implementar [Symbol.iterator]; (3) Co-rotinas simples; (4) Cancelamento: verificar um flag a cada yield para interromper. Redux-saga usa generators para fluxos assíncronos complexos. Vantagem sobre promises: controle de fluxo mais legível com múltiplas pausas.",
    keyPoints: [
      "function* e yield para pausar/retomar",
      "Retorna iterator com next()",
      "Lazy evaluation: gera valores sob demanda",
      "Casos: sequências infinitas, fluxos assíncronos, cancelamento",
    ],
    explanation:
      "Generators são um tópico avançado de JS que aparece em entrevistas de nível senior.",
  },

  {
    id: "q-javascript-015",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["JavaScript", "includes-has"],
    linkedFlashcardTags: ["javascript"],
    prompt:
      "Por que substituir `array.includes(value)` por `set.has(value)` dentro de um loop melhora a complexidade?",
    options: [
      "Array.includes() é O(n) por chamada; Set.has() é O(1). Em um loop de n iterações: O(n²) vs O(n)",
      "Não há diferença de performance — ambos são O(1) em arrays modernos",
      "Set.has() é O(log n), melhor que O(n) mas não O(1)",
      "A melhoria só se aplica a arrays com mais de 1000 elementos",
    ],
    correctAnswer:
      "Array.includes() é O(n) por chamada; Set.has() é O(1). Em um loop de n iterações: O(n²) vs O(n)",
    explanation:
      "Array.includes() faz busca linear: O(n). Dentro de loop O(n): O(n²). Converter para Set uma vez (O(n)) e usar has() (O(1) amortizado) reduz para O(n) total. Custo: O(n) de memória extra para o Set.",
  },

  {
    id: "q-javascript-016",
    topic: "JavaScript",
    group: "javascript",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["JavaScript", "proxy"],
    linkedFlashcardTags: ["javascript"],
    prompt: "O que é Proxy em JavaScript e para qual caso de uso é mais adequado?",
    idealAnswer:
      "Proxy envolve um objeto e intercepta operações fundamentais: get, set, has, deleteProperty, apply (para funções). new Proxy(target, handler). Casos de uso: (1) Validação de dados — interceptar set e lançar erro se valor inválido; (2) Reatividade — interceptar get/set para notificar observers (Vue 3 usa Proxy internamente); (3) Lazy initialization — interceptar get para criar propriedades sob demanda; (4) Logging/debugging — rastrear acesso a propriedades. Trade-off: Proxy tem overhead maior que acesso direto a objetos — usar apenas quando o benefício justifica.",
    keyPoints: [
      "Intercepta operações: get, set, has, apply",
      "Vue 3 usa Proxy para reatividade",
      "Validação de schema em runtime",
      "Overhead: não usar para hot paths",
    ],
    explanation:
      "Proxy é uma feature avançada de JS que demonstra conhecimento profundo da linguagem.",
  },

  // ── REACT ─────────────────────────────────────────────────────────────────────

  {
    id: "q-react-001",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["React", "useState"],
    linkedFlashcardTags: ["react"],
    prompt: "O que acontece quando você chama `setState` com o mesmo valor que já está no estado?",
    options: [
      "React pula a re-renderização (bail-out) se o valor é idêntico por Object.is",
      "Sempre re-renderiza o componente, independente do valor",
      "Lança erro de estado duplicado",
      "Causa loop infinito de renderização",
    ],
    correctAnswer: "React pula a re-renderização (bail-out) se o valor é idêntico por Object.is",
    explanation:
      "React usa Object.is para comparar o estado atual com o novo. Se idênticos, pula o render. Importante: Object.is({a:1}, {a:1}) === false (objetos diferentes). Por isso, mutação direta não aciona re-render — a referência é a mesma.",
  },

  {
    id: "q-react-002",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "easy",
    type: "interview",
    tags: ["React", "useEffect"],
    linkedFlashcardTags: ["react"],
    prompt: "Quais são os três comportamentos de `useEffect` dependendo do array de dependências?",
    idealAnswer:
      "(1) Sem array de dependências: executa após CADA render. Raro uso intencional. (2) Array vazio []: executa apenas após o primeiro render (componentDidMount). Ideal para: fetch inicial, subscriptions, configuração única. (3) Array com dependências [a, b]: executa após o primeiro render e sempre que a ou b mudam. O cleanup (função de retorno) executa antes do próximo efeito e no unmount — use para cancelar requests, remover listeners, limpar timers.",
    keyPoints: [
      "Sem array: executa sempre",
      "[] executa uma vez no mount",
      "[deps]: executa quando deps mudam",
      "Cleanup: antes do próximo efeito e no unmount",
    ],
    explanation:
      "useEffect é o hook mais mal-utilizado — entender seus comportamentos é fundamental.",
  },

  {
    id: "q-react-003",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["React", "key"],
    linkedFlashcardTabs: ["react"],
    linkedFlashcardTags: ["react"],
    prompt: "Por que usar o índice do array como `key` em listas React pode causar bugs?",
    options: [
      "Quando a ordem dos itens muda, React reutiliza o DOM errado, causando perda ou troca de estado local dos componentes",
      "key como número é mais lento que como string",
      "React não aceita índices numéricos como key",
      "Aumenta o tempo de reconciliation desnecessariamente",
    ],
    correctAnswer:
      "Quando a ordem dos itens muda, React reutiliza o DOM errado, causando perda ou troca de estado local dos componentes",
    explanation:
      "Se você reordenar, adicionar no início ou remover do meio, o índice muda para cada item. React vai associar o estado do item antigo com o novo item na mesma posição. Consequência: inputs perdem dados, animações ficam erradas. Use IDs estáveis como key.",
  },

  {
    id: "q-react-004",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["React", "reconciliation"],
    linkedFlashcardTags: ["react"],
    prompt: "O que é reconciliation no React e como o algoritmo de diffing funciona?",
    idealAnswer:
      "Reconciliation é o processo de comparar o Virtual DOM anterior com o novo para determinar as mudanças mínimas necessárias no DOM real. O algoritmo de React tem complexidade O(n) com duas heurísticas: (1) Elementos de tipos diferentes produzem árvores completamente diferentes — React destrói e recria ao invés de tentar transformar; (2) Keys identificam itens em listas — sem keys únicas e estáveis, React não consegue preservar estado de componentes reordenados. Sem essas heurísticas, o diffing ótimo seria O(n³). React Fiber (React 16+) permite interromper reconciliation para priorizar interações do usuário.",
    keyPoints: [
      "Compara Virtual DOM anterior com novo",
      "Tipos diferentes = destroy + create",
      "Keys: preservar identidade em listas",
      "O(n) com heurísticas vs O(n³) ótimo",
    ],
    explanation:
      "Entender reconciliation explica por que keys importam e como React otimiza re-renders.",
  },

  {
    id: "q-react-005",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["React", "useMemo-useCallback"],
    linkedFlashcardTags: ["react"],
    prompt: "Qual é a diferença entre `useMemo` e `useCallback`?",
    options: [
      "useMemo memoiza o VALOR retornado por uma função; useCallback memoiza a REFERÊNCIA DA FUNÇÃO em si",
      "São equivalentes — apenas sintaxe diferente",
      "useMemo é para valores primitivos; useCallback é para objetos e arrays",
      "useCallback tem melhor performance que useMemo para qualquer caso",
    ],
    correctAnswer:
      "useMemo memoiza o VALOR retornado por uma função; useCallback memoiza a REFERÊNCIA DA FUNÇÃO em si",
    explanation:
      "useMemo(() => expensiveCalc(a, b), [a, b]) — armazena o resultado. useCallback((x) => fn(x, a), [a]) — armazena a função. useCallback(fn, deps) === useMemo(() => fn, deps). Use useMemo para: cálculos pesados, transformar dados. Use useCallback para: funções passadas como props para filhos memoizados, dependências de useEffect.",
  },

  {
    id: "q-react-006",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["React", "React.memo"],
    linkedFlashcardTags: ["react"],
    prompt: "Quando `React.memo` NÃO ajuda na performance?",
    idealAnswer:
      "React.memo pula re-render quando props não mudam (comparação rasa). Não ajuda quando: (1) O pai cria objetos/arrays/funções inline a cada render — props 'diferentes' a cada vez, memoização ineficaz; solução: useMemo/useCallback no pai; (2) O componente é barato de renderizar — custo da comparação pode superar o custo do render; (3) O componente consome Context que muda frequentemente — Context não é verificado pelo memo; (4) O estado interno muda com frequência. Regra: meça antes de adicionar. React DevTools Profiler mostra quantos renders são poupados.",
    keyPoints: [
      "Props criadas inline invalidam a memoização",
      "Comparação rasa: objetos novos = props 'diferentes'",
      "Context muda bypass React.memo",
      "Medir antes de adicionar: custo da comparação",
    ],
    explanation: "React.memo mal aplicado pode até piorar performance pelo custo da comparação.",
  },

  {
    id: "q-react-007",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["React", "context"],
    linkedFlashcardTags: ["react"],
    prompt: "Um componente que consume Context re-renderiza quando:",
    options: [
      "O VALOR do Context muda, mesmo que as props do componente não tenham mudado",
      "Apenas quando as próprias props do componente mudam",
      "Apenas quando o Provider pai re-renderiza",
      "Context nunca causa re-renders extras",
    ],
    correctAnswer: "O VALOR do Context muda, mesmo que as props do componente não tenham mudado",
    explanation:
      "Todos os consumers do Context re-renderizam quando o value do Provider muda. Se o value é um objeto criado inline ({user, theme}), cada render do Provider cria um novo objeto → todos consumers re-renderizam. Solução: memoizar o value com useMemo ou separar contextos por frequência de atualização.",
  },

  {
    id: "q-react-008",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["React", "useRef-vs-useState"],
    linkedFlashcardTags: ["react"],
    prompt: "Qual é a diferença entre useRef e useState? Quando usar cada um?",
    idealAnswer:
      "useState: persiste estado entre renders E causa re-render ao mudar. useRef: persiste valor entre renders mas NÃO causa re-render ao mudar .current. Use useState: para qualquer coisa que afeta a UI — precisa re-render quando muda. Use useRef: (1) Referência a elemento DOM (ref={myRef}); (2) Guardar valor entre renders sem causar re-render: timer IDs, valores de render anterior, flags de efeito; (3) Comunicação imperativa com filhos via forwardRef. Erro comum: usar useState para timer ID causa re-render desnecessário; useRef é correto.",
    keyPoints: [
      "useState: muda → re-render",
      "useRef: muda .current → sem re-render",
      "useRef para: DOM refs, timer IDs, valores que não afetam UI",
      "useState para: tudo que afeta o que é exibido",
    ],
    explanation:
      "A distinção useState vs useRef é pergunta frequente que revela entendimento do modelo de renderização.",
  },

  {
    id: "q-react-009",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["React", "SSR", "CSR"],
    linkedFlashcardTags: ["react"],
    prompt: "Qual é a principal vantagem de SSR sobre CSR para uma landing page pública?",
    options: [
      "HTML já renderizado pelo servidor: melhor FCP, LCP e SEO — sem esperar o JS carregar para exibir conteúdo",
      "SSR é sempre mais rápido que CSR para qualquer tipo de interação",
      "SSR elimina a necessidade de JavaScript no cliente",
      "SSR é mais barato de hospedar que CSR",
    ],
    correctAnswer:
      "HTML já renderizado pelo servidor: melhor FCP, LCP e SEO — sem esperar o JS carregar para exibir conteúdo",
    explanation:
      "CSR: browser recebe HTML vazio, carrega JS, executa, renderiza — usuário vê tela em branco enquanto aguarda. SSR: servidor envia HTML completo — conteúdo visível imediatamente, melhor LCP. Trade-off: custo de CPU no servidor, hydration no cliente. Para conteúdo interativo pesado com dados privados, CSR pode ser preferível.",
  },

  {
    id: "q-react-010",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["React", "Server Components"],
    linkedFlashcardTags: ["react"],
    prompt:
      "Qual é a principal diferença entre Server Components e Client Components no React (Next.js App Router)?",
    idealAnswer:
      "Server Components: rodam exclusivamente no servidor, nunca no cliente. Podem acessar diretamente banco de dados, filesystem, variáveis de ambiente secretas. Não enviam código JS para o cliente — reduzem bundle size. Não suportam: useState, useEffect, event handlers, browser APIs. Client Components: rodam no cliente (e no servidor para hidratação). Marcados com 'use client'. Suportam todos os hooks e eventos. No App Router, componentes são Server Components por padrão. Regra: use Server Components para busca de dados e conteúdo estático; use Client Components para interatividade. Server Components podem importar Client Components, mas não o contrário.",
    keyPoints: [
      "Server: sem JS no cliente, acesso direto a dados",
      "Client: interatividade, hooks de estado/efeito",
      "Server por padrão no App Router",
      "Server pode importar Client, não o contrário",
    ],
    explanation:
      "Server Components são a mudança mais significativa no modelo mental do React nos últimos anos.",
  },

  {
    id: "q-react-011",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["React", "batching"],
    linkedFlashcardTags: ["react"],
    prompt: "O React 18 introduziu Automatic Batching. O que isso significa na prática?",
    options: [
      "Múltiplos setState dentro de handlers assíncronos (Promise, setTimeout) agora são agrupados em um único re-render",
      "Todos os setState passaram a ser síncronos",
      "React não re-renderiza mais de uma vez por frame independente do número de setState",
      "O React processa atualizações de estado em um Web Worker",
    ],
    correctAnswer:
      "Múltiplos setState dentro de handlers assíncronos (Promise, setTimeout) agora são agrupados em um único re-render",
    explanation:
      "Antes do React 18: batching apenas em event handlers síncronos do React. Múltiplos setState em setTimeout ou fetch.then causavam re-renders separados. React 18: automatic batching agrupa todos, independente do contexto. Se precisar forçar render imediato: flushSync().",
  },

  {
    id: "q-react-012",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["React", "virtualização"],
    linkedFlashcardTags: ["react"],
    prompt:
      "Por que listas com 10.000 itens renderizadas com map() têm problema de performance? Como resolver?",
    idealAnswer:
      "Problemas de 10k itens no DOM: (1) Criação de 10k nós DOM — custo de memória e garbage collection; (2) Layout computation — browser calcula posição e estilo de todos, mesmo os invisíveis; (3) Paint — renderizar pixels para todos; (4) Scroll performance degradada. Solução: virtualização (windowing) — renderizar apenas os itens visíveis (~20-30 + buffer). Container pai tem altura total = itens × altura, dando a ilusão de lista completa. Bibliotecas: react-window (janela fixa), react-virtual (mais flexível), react-virtuoso (altura dinâmica). Desafios de implementação: altura dinâmica (usar ResizeObserver), scroll restoration, acessibilidade.",
    keyPoints: [
      "DOM nodes custam memória e layout",
      "Virtualização: renderizar apenas o visível",
      "Container com altura total para barra de scroll correta",
      "Desafios: altura dinâmica, acessibilidade",
    ],
    explanation:
      "Virtualização de listas é um problema real de performance que aparece em entrevistas de frontend sênior.",
  },

  {
    id: "q-react-013",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["React", "hydration"],
    linkedFlashcardTags: ["react"],
    prompt: "O que causa um 'hydration error' no Next.js?",
    options: [
      "Divergência entre o HTML gerado no servidor e o que React renderiza no cliente — geralmente por acesso a APIs do browser (Date.now(), window, Math.random()) durante o render",
      "Versão desatualizada do React ou Next.js",
      "Uso incorreto de useState no nível superior do componente",
      "Memory leak em event listeners não removidos",
    ],
    correctAnswer:
      "Divergência entre o HTML gerado no servidor e o que React renderiza no cliente — geralmente por acesso a APIs do browser (Date.now(), window, Math.random()) durante o render",
    explanation:
      "Hidratação: React no cliente re-renderiza e 'anexa' ao HTML do servidor. Se o HTML não bate, erro. Causas: timestamps (usar useEffect para código client-only), window/document (checar typeof window !== 'undefined'), conteúdo gerado aleatoriamente. Solução: mover código client-only para useEffect ou usar dynamic import com ssr: false.",
  },

  {
    id: "q-react-014",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "medium",
    type: "open",
    tags: ["React", "useReducer"],
    linkedFlashcardTags: ["react"],
    prompt: "Quando você preferiria `useReducer` ao invés de `useState`?",
    idealAnswer:
      "useReducer é preferível quando: (1) O estado tem múltiplos sub-valores relacionados que mudam juntos; (2) O próximo estado depende do anterior de forma complexa; (3) A lógica de atualização é extensa e reutilizável — reducer é testável independentemente; (4) Ações têm semântica explícita (dispatch({ type: 'INCREMENT' }) vs setState(n => n+1)). useState é suficiente para estado simples e independente. Vantagem em componentes profundos: dispatch é uma referência estável (não precisa de useCallback), pode ser passada via context sem causar re-renders no provider.",
    keyPoints: [
      "Estado complexo com múltiplos campos",
      "Lógica de atualização extensa/reutilizável",
      "dispatch é referência estável",
      "Testabilidade do reducer isolado",
    ],
    explanation: "Saber quando usar useReducer vs useState demonstra maturidade com React.",
  },

  {
    id: "q-react-015",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "easy",
    type: "interview",
    tags: ["React", "prop-drilling"],
    linkedFlashcardTags: ["react"],
    prompt: "O que é prop drilling e quais são as soluções em React?",
    idealAnswer:
      "Prop drilling: passar props por múltiplos níveis de componentes intermediários que não usam o valor — apenas repassam para componentes mais profundos. Problema: acoplamento desnecessário, dificuldade de refatoração. Soluções: (1) React Context: para estado global leve acessado por muitos componentes; (2) State management (Zustand, Redux): para estado complexo com muitas atualizações; (3) Component composition: passar componentes como children ou props ao invés de dados — o componente pai configura o filho diretamente; (4) Colocar estado mais perto de onde é usado — nem sempre precisa subir tanto. Não é sempre um problema — props explícitas melhoram a rastreabilidade.",
    keyPoints: [
      "Passar props por níveis que não usam o valor",
      "Soluções: Context, state management, composition",
      "Composition: componente como prop ao invés de dado",
      "Nem sempre é problema — trade-off com explicitidade",
    ],
    explanation:
      "Prop drilling e suas soluções é uma das perguntas mais frequentes em entrevistas de React.",
  },

  {
    id: "q-react-016",
    topic: "React",
    group: "react",
    week: 5,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["React", "concurrent"],
    linkedFlashcardTags: ["react"],
    prompt: "O que `startTransition` do React 18 permite fazer?",
    options: [
      "Marcar atualizações de estado como não-urgentes, permitindo que React interrompa seu processamento para responder a interações do usuário",
      "Executar operações pesadas em um Web Worker automaticamente",
      "Criar animações com 60fps garantido usando requestAnimationFrame",
      "Habilitar SSR automático para qualquer componente",
    ],
    correctAnswer:
      "Marcar atualizações de estado como não-urgentes, permitindo que React interrompa seu processamento para responder a interações do usuário",
    explanation:
      "startTransition(() => { setQuery(input) }): a busca/filtro é não-urgente. Se o usuário digitar novamente, React pode pausar o render atual e processar a nova digitação primeiro. Resultado: UI responsiva mesmo com renders pesados. useTransition retorna [isPending, startTransition] para mostrar loading state.",
  },

  // ── FRONTEND SYSTEM DESIGN ───────────────────────────────────────────────────

  {
    id: "q-fsd-001",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Frontend System Design", "Core Web Vitals"],
    linkedFlashcardTags: ["system-design", "performance"],
    prompt:
      "Qual Core Web Vital mede o tempo até o maior elemento de conteúdo visível ser renderizado?",
    options: [
      "LCP (Largest Contentful Paint) — meta: < 2.5s para 'bom'",
      "FCP (First Contentful Paint) — primeiro pixel de conteúdo",
      "CLS (Cumulative Layout Shift) — estabilidade visual",
      "INP (Interaction to Next Paint) — responsividade a inputs",
    ],
    correctAnswer: "LCP (Largest Contentful Paint) — meta: < 2.5s para 'bom'",
    explanation:
      "LCP mede quando o maior elemento (imagem, bloco de texto) é renderizado. Correlaciona com percepção de velocidade. Principais fatores: TTFB lento, recursos bloqueantes, imagens sem preload. FCP é o primeiro pixel. CLS mede deslocamento de layout. INP substituiu FID no Google em 2024.",
  },

  {
    id: "q-fsd-002",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "easy",
    type: "interview",
    tags: ["Frontend System Design", "infinite-scroll"],
    linkedFlashcardTags: ["system-design"],
    prompt:
      "Como você projetaria um feed de posts infinito? Quais são os componentes principais do sistema?",
    idealAnswer:
      "Componentes: (1) Paginação com cursor (não offset — evita itens duplicados/omitidos com inserções simultâneas); (2) Intersection Observer para detectar quando usuário está próximo do final; (3) Cache local dos dados já carregados (evitar re-fetch ao voltar); (4) Virtualização para não manter todos os itens no DOM; (5) Estados: loading, error, empty, end-of-feed; (6) Skeleton loading durante fetch; (7) Deduplicação de itens (IDs únicos). Considerações extras: atualização em tempo real, retry automático em erros de rede, prefetch do próximo batch.",
    keyPoints: [
      "Cursor-based pagination (não offset)",
      "Intersection Observer para trigger",
      "Virtualização para DOM com muitos itens",
      "Estados: loading, error, empty, fim",
    ],
    explanation:
      "Infinite scroll é um dos problemas de system design mais pedidos em entrevistas frontend.",
  },

  {
    id: "q-fsd-003",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Frontend System Design", "cache"],
    linkedFlashcardTags: ["system-design", "cache"],
    prompt:
      "Qual estratégia de cache retorna dados do cache imediatamente e atualiza em background?",
    options: [
      "Stale-while-revalidate — resposta imediata com dados potencialmente antigos, revalida sem bloquear",
      "Cache-first — só busca da rede se não estiver em cache",
      "Network-first — sempre busca da rede, usa cache apenas se offline",
      "Cache-only — nunca vai à rede",
    ],
    correctAnswer:
      "Stale-while-revalidate — resposta imediata com dados potencialmente antigos, revalida sem bloquear",
    explanation:
      "SWR e React Query implementam stale-while-revalidate: retornam dados em cache imediatamente (elimina loading spinner na maioria das navegações), depois buscam versão atualizada silenciosamente. Trade-off: usuário pode ver dados levemente antigos por alguns segundos. Ótimo para dados que mudam com pouca frequência.",
  },

  {
    id: "q-fsd-004",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["Frontend System Design", "performance"],
    linkedFlashcardTags: ["system-design", "performance"],
    prompt:
      "Um usuário reclama que a página carrega lentamente. Como você diagnosticaria e priorizaria as otimizações?",
    idealAnswer:
      "Processo: (1) MEDIR antes de otimizar — Chrome DevTools Network, Performance, Lighthouse, WebPageTest. Não assumir o gargalo. (2) Identificar: TTFB alto (problema de servidor/CDN), bundle JS grande (code splitting, tree shaking), imagens não otimizadas (WebP, lazy loading, preload LCP), render blocking (scripts async/defer), layout thrashing. (3) Priorizar por impacto em LCP e INP (Core Web Vitals do Google). Quick wins: preload LCP image, defer scripts não críticos, compressão gzip/brotli. Evitar: otimização prematura sem dados reais.",
    keyPoints: [
      "Medir primeiro: DevTools, Lighthouse",
      "Identificar gargalo: rede, JS, renderização",
      "Priorizar LCP e INP",
      "Quick wins: preload, defer, compressão",
    ],
    explanation:
      "Metodologia de diagnóstico de performance é mais valorizada que saber otimizações isoladas.",
  },

  {
    id: "q-fsd-005",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Frontend System Design", "code-splitting"],
    linkedFlashcardTags: ["system-design"],
    prompt: "O que é code splitting e qual é seu principal benefício?",
    options: [
      "Dividir o bundle JS em chunks menores carregados sob demanda, reduzindo o JavaScript enviado no carregamento inicial",
      "Dividir o CSS em múltiplos arquivos por componente",
      "Separar código de servidor e cliente em deploys independentes",
      "Distribuir assets estáticos em múltiplos CDNs para melhor disponibilidade",
    ],
    correctAnswer:
      "Dividir o bundle JS em chunks menores carregados sob demanda, reduzindo o JavaScript enviado no carregamento inicial",
    explanation:
      "Sem code splitting: um bundle enorme carrega mesmo código que o usuário nunca usa. Com splitting: rota /dashboard carrega apenas o código do dashboard. Em React: React.lazy() + Suspense. Em Next.js: automático por página. Impacto: reduz parse/execute time de JS, melhora FCP e LCP.",
  },

  {
    id: "q-fsd-006",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["Frontend System Design", "BFF"],
    linkedFlashcardTags: ["system-design"],
    prompt: "O que é o padrão BFF (Backend for Frontend)? Quando sua complexidade se justifica?",
    idealAnswer:
      "BFF é uma camada de API específica para cada tipo de cliente (web, mobile, TV) que agrega dados de múltiplos microsserviços e os formata para as necessidades específicas de cada UI. Benefícios: (1) Evitar overfetching/underfetching — BFF retorna exatamente o que a UI precisa; (2) Lógica específica de UI no BFF (transformações, agregações), não no domínio; (3) Versioning independente por cliente; (4) Caching otimizado por use case; (5) Reduz chattiness entre cliente e serviços. Custo: nova camada para manter, ponto adicional de falha, time de backend necessário. Se justifica quando: múltiplos clientes com necessidades diferentes, microsserviços granulares demais para o frontend consumir diretamente.",
    keyPoints: [
      "API específica por tipo de cliente",
      "Agrega múltiplos serviços",
      "Evita overfetching/underfetching",
      "Custo: manutenção adicional",
    ],
    explanation:
      "BFF é um padrão frequente em empresas com múltiplos clientes e arquitetura de microsserviços.",
  },

  {
    id: "q-fsd-007",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Frontend System Design", "microfrontends"],
    linkedFlashcardTags: ["system-design"],
    prompt: "Qual é o maior desafio técnico de uma arquitetura de microfrontends?",
    options: [
      "Compartilhamento de dependências (múltiplas versões de React) e comunicação entre fragmentos sem acoplamento",
      "Implementar roteamento no servidor",
      "Usar TypeScript em todos os módulos independentes",
      "Garantir autenticação consistente entre os fragmentos",
    ],
    correctAnswer:
      "Compartilhamento de dependências (múltiplas versões de React) e comunicação entre fragmentos sem acoplamento",
    explanation:
      "Múltiplos microfrontends podem carregar versões diferentes da mesma biblioteca (React 17 e React 18). Module Federation do Webpack tenta resolver o compartilhamento. Comunicação: custom events ou state management global. Autenticação é um desafio, mas solucionável com SSO.",
  },

  {
    id: "q-fsd-008",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["Frontend System Design", "virtualização"],
    linkedFlashcardTags: ["system-design"],
    prompt: "Como você implementaria virtualização de lista (windowing) do zero, sem biblioteca?",
    idealAnswer:
      "Estrutura: container com overflow: auto e height fixo. Lista interna com height = totalItems × itemHeight (para barra de scroll correta). Posicionar itens com position: absolute e top = index × itemHeight. Lógica: ao scroll, calcular startIndex = floor(scrollTop / itemHeight), endIndex = startIndex + ceil(containerHeight / itemHeight) + bufferSize. Renderizar apenas [startIndex, endIndex]. Desafios: (1) Altura dinâmica — usar ResizeObserver para medir e armazenar alturas reais; (2) Scroll restoration; (3) Acessibilidade — role=listbox, aria-setsize, aria-posinset; (4) Performance — requestAnimationFrame para updates de scroll.",
    keyPoints: [
      "height total no container = totalItems × itemHeight",
      "Calcular startIndex e endIndex via scrollTop",
      "Posicionamento absoluto por index",
      "Desafios: altura dinâmica, acessibilidade",
    ],
    explanation:
      "Implementar virtualização do zero é uma pergunta de nível senior que testa profundidade técnica.",
  },

  {
    id: "q-fsd-009",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "hard",
    type: "interview",
    tags: ["Frontend System Design", "observabilidade"],
    linkedFlashcardTags: ["system-design"],
    prompt:
      "O que você instrumentaria em uma aplicação frontend para garantir boa observabilidade em produção?",
    idealAnswer:
      "Três pilares: (1) Erros: Error Boundary catches, window.onerror, unhandledrejection, reportar para Sentry/Datadog com stack trace e contexto do usuário. (2) Performance: Core Web Vitals (PerformanceObserver API), custom timings para operações críticas (fetch, render de componentes pesados), distribuição de p50/p95/p99. (3) Produto/UX: cliques, navegações, conversões, funnels de abandono. Considerações: sampling (não logar 100% das events), correlation IDs para rastrear request do frontend ao backend, PII compliance (não logar dados pessoais), feature flags para alertas em rollouts graduais.",
    keyPoints: [
      "Erros: Error Boundary + Sentry",
      "Performance: Core Web Vitals + custom timings",
      "Produto: eventos de interação e conversão",
      "Sampling, correlation IDs, PII compliance",
    ],
    explanation: "Observabilidade frontend é cada vez mais valorizada em engenharia sênior.",
  },

  {
    id: "q-fsd-010",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Frontend System Design", "critical-rendering"],
    linkedFlashcardTags: ["system-design", "performance"],
    prompt: "O que bloqueia o Critical Rendering Path de uma página web?",
    options: [
      "Scripts síncronos no <head> bloqueiam parsing do HTML; CSS bloqueia renderização até ser processado",
      "Imagens grandes abaixo do fold",
      "Fontes carregadas com font-display: swap",
      "WebSockets abertos durante o carregamento",
    ],
    correctAnswer:
      "Scripts síncronos no <head> bloqueiam parsing do HTML; CSS bloqueia renderização até ser processado",
    explanation:
      "Script no <head> sem async/defer: parser HTML para até o script baixar e executar. CSS: bloqueia rendering (CSSOM precisa estar pronto para o render tree). Soluções: scripts no final do body ou com defer/async; CSS crítico inline; link rel=preload para recursos críticos. Imagens e fontes não bloqueiam o parser.",
  },

  {
    id: "q-fsd-011",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "medium",
    type: "interview",
    tags: ["Frontend System Design", "cache-layers"],
    linkedFlashcardTags: ["system-design", "cache"],
    prompt:
      "Quais são as camadas de cache disponíveis em uma aplicação frontend? Como decidir qual usar?",
    idealAnswer:
      "Camadas: (1) Browser HTTP Cache: Cache-Control (max-age, s-maxage), ETag para validação — automático, para assets estáticos; (2) Service Worker Cache: controle total sobre o que cachear e por quanto tempo — para PWA e offline; (3) CDN/Edge: assets estáticos próximos ao usuário — melhor TTFB; (4) In-memory no cliente: React state, React Query/SWR para dados da API; (5) localStorage/sessionStorage: dados simples com persistência — cuidado com espaço (~5MB) e sync; (6) IndexedDB: dados estruturados complexos para offline. Decidir por: tamanho dos dados, frequência de atualização, necessidade de persistência, latência aceitável.",
    keyPoints: [
      "HTTP Cache: assets estáticos",
      "Service Worker: PWA e offline",
      "React Query/SWR: dados de API",
      "IndexedDB: dados complexos offline",
    ],
    explanation: "Entender as camadas de cache mostra visão de sistema completa.",
  },

  {
    id: "q-fsd-012",
    topic: "Frontend System Design",
    group: "frontend_system_design",
    week: 5,
    difficulty: "hard",
    type: "open",
    tags: ["Frontend System Design", "design-tokens"],
    linkedFlashcardTags: ["system-design"],
    prompt: "O que são design tokens e qual problema eles resolvem em Design Systems?",
    idealAnswer:
      "Design tokens são variáveis nomeadas que armazenam valores de design: cores, tipografia, espaçamento, sombras, bordas. Exemplo: --color-brand-primary: #00E5A0. Resolvem: (1) Inconsistência entre design e código — tokens são a fonte única de verdade; (2) Theming — trocar tokens por tema (dark mode, brand customization) sem alterar componentes; (3) Handoff — designers usam tokens no Figma, devs no CSS/JS; (4) Escalabilidade — mudança global de um valor por alterar o token. Ferramentas: Style Dictionary transforma tokens de JSON em CSS custom properties, JS, Swift, Kotlin. Organização: primitivos (blue-500) → semânticos (color-action-primary) → específicos (button-background-color).",
    keyPoints: [
      "Fonte única de verdade design↔código",
      "Theming: trocar tokens por tema",
      "Primitivos → semânticos → específicos",
      "Style Dictionary para multi-plataforma",
    ],
    explanation: "Design tokens são fundamentais em empresas com design systems maduros.",
  },
];
