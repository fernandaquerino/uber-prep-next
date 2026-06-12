// Part 2: Queue (7), Linked List (9), Trees (10), Graphs (9), Heap (8), Trie (6)
export const PART2 = [
  // ── QUEUE ────────────────────────────────────────────────────────────────────

  {
    id: "q-queue-001",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Queue", "FIFO"],
    linkedFlashcardTags: ["queue"],
    prompt: "Uma fila (Queue) segue qual política de acesso?",
    options: [
      "FIFO — First In, First Out",
      "LIFO — Last In, First Out",
      "Prioridade — menor valor sai primeiro",
      "FILO — First In, Last Out",
    ],
    correctAnswer: "FIFO — First In, First Out",
    explanation:
      "O primeiro elemento inserido (enqueue) é o primeiro a ser removido (dequeue). Pense em uma fila de supermercado. LIFO é a política de Pilhas (Stack).",
  },

  {
    id: "q-queue-002",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Queue", "array-shift"],
    linkedFlashcardTags: ["queue"],
    prompt:
      "Por que usar índice `head` em vez de Array.shift() para simular dequeue em JavaScript?",
    options: [
      "Array.shift() é O(n) pois desloca todos os elementos; um índice head é O(1)",
      "shift() não existe em arrays JavaScript — apenas em listas ligadas",
      "Não há diferença de performance — ambos são O(1)",
      "shift() causa erro quando o array está vazio",
    ],
    correctAnswer: "Array.shift() é O(n) pois desloca todos os elementos; um índice head é O(1)",
    explanation:
      "shift() remove o primeiro elemento e desloca todos os outros: O(n). Usando um índice head que avança, o custo é O(1). O array cresce no final, mas para grafos de entrevista o trade-off é aceitável. Para produção: usar deque ou lista duplamente ligada.",
  },

  {
    id: "q-queue-003",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Queue", "two-stacks"],
    linkedFlashcardTags: ["queue", "stack"],
    prompt: "Qual é a complexidade amortizada de dequeue() nesta implementação com duas pilhas?",
    code: "class FilaComPilhas {\n  constructor() { this.entrada = []; this.saida = []; }\n  enqueue(val) { this.entrada.push(val); }\n  dequeue() {\n    if (!this.saida.length)\n      while (this.entrada.length) this.saida.push(this.entrada.pop());\n    return this.saida.pop();\n  }\n}",
    options: [
      "O(1) amortizado — cada elemento migra entre pilhas no máximo uma vez",
      "O(n) por operação — no pior caso transfere tudo",
      "O(log n) — usa estrutura de heap internamente",
      "O(n²) — duas pilhas multiplicam o custo",
    ],
    correctAnswer: "O(1) amortizado — cada elemento migra entre pilhas no máximo uma vez",
    explanation:
      "Cada elemento faz exatamente um push na `entrada` e um push + pop na `saida`. Total: 3 operações por elemento de vida. Amortizando por todas as operações, O(1) por dequeue. O(n) é o pior caso de uma única operação, não o custo médio.",
  },

  {
    id: "q-queue-004",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "pattern",
    tags: ["Queue", "BFS", "grade"],
    linkedFlashcardTags: ["queue", "bfs"],
    prompt:
      "Em uma grade 2D com obstáculos, encontrar o menor número de passos de (0,0) até (n-1,m-1). Qual estrutura de dados é fundamental para a solução?",
    options: [
      "Fila — BFS garante que a primeira chegada é pelo menor caminho",
      "Pilha — DFS explora todos os caminhos",
      "MinHeap — para ponderar os passos",
      "Recursão — backtracking para tentar todos os caminhos",
    ],
    correctAnswer: "Fila — BFS garante que a primeira chegada é pelo menor caminho",
    explanation:
      "BFS explora por camadas (distâncias iguais). A primeira vez que o destino é encontrado, o caminho é garantidamente o mais curto em número de passos. Pilha (DFS) não garante menor caminho. MinHeap só é necessário quando as arestas têm pesos diferentes.",
  },

  {
    id: "q-queue-005",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "pattern",
    tags: ["Queue", "BFS", "rotten-oranges"],
    linkedFlashcardTags: ["queue", "bfs"],
    prompt:
      "Em uma grade, laranjas podres infectam vizinhos a cada minuto. Encontrar o tempo mínimo até todas apodrecerem (ou -1 se impossível). Qual abordagem usar?",
    options: [
      "BFS multi-source — enfileirar todas as podres no início",
      "DFS de cada laranja podre separadamente",
      "Programação dinâmica sobre a grade",
      "Dois ponteiros sobre linhas e colunas",
    ],
    correctAnswer: "BFS multi-source — enfileirar todas as podres no início",
    explanation:
      "Iniciar BFS com todas as laranjas podres simultaneamente na fila. Cada nível do BFS representa um minuto. O nível mais alto onde ainda houve infecções é a resposta. DFS separado seria O(n×m×podres) e incorreto para tempo simultâneo.",
  },

  {
    id: "q-queue-006",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "interview",
    tags: ["Queue", "BFS"],
    linkedFlashcardTags: ["queue", "bfs"],
    prompt: "Por que BFS usa fila e não pilha para encontrar menor caminho?",
    idealAnswer:
      "BFS deve explorar nós por ordem de distância crescente — nível 1, depois nível 2, etc. Fila (FIFO) garante isso: nós mais próximos foram enfileirados antes e saem primeiro. Com pilha (LIFO), o último nó enfileirado sairia primeiro, o que resultaria em DFS — explorando profundamente um ramo antes de outros. DFS não garante menor caminho porque pode chegar ao destino por um caminho mais longo antes do mais curto. A garantia do BFS: quando um nó é desempilhado pela primeira vez, sua distância está correta.",
    keyPoints: [
      "FIFO garante processamento por camadas",
      "Pilha resultaria em DFS",
      "DFS não garante menor caminho",
      "Primeiro dequeue = distância correta",
    ],
    explanation: "Entender por que a estrutura de dados importa para a correção do algoritmo.",
  },

  {
    id: "q-queue-007",
    topic: "Queue",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "open",
    tags: ["Queue", "priority-queue"],
    linkedFlashcardTags: ["queue", "heap"],
    prompt:
      "Explique a diferença entre fila simples (FIFO) e fila de prioridade (Heap). Quando cada uma é a escolha certa?",
    idealAnswer:
      "Fila simples (FIFO): processa na ordem de chegada. O(1) para enqueue/dequeue. Use para BFS, processamento justo por chegada, eventos em ordem cronológica. Fila de prioridade (implementada com Heap): processa pelo elemento de maior/menor prioridade. O(log n) para inserção e remoção. Use quando sempre precisa do mínimo ou máximo: Dijkstra (menor distância), Top-K, Merge K sorted lists, encontrar mediana em stream. JavaScript não tem implementação nativa de MinHeap — é preciso implementar ou usar biblioteca. Em entrevistas, descrever a API: push O(log n), pop O(log n), peek O(1).",
    keyPoints: [
      "Fila FIFO: O(1)",
      "Fila de prioridade: O(log n) por operação",
      "Fila de prioridade: quando precisa sempre do min/max",
      "JS sem MinHeap nativo",
    ],
    explanation:
      "Conhecer quando usar cada variante de fila é fundamental para problemas de grafos e ordenação parcial.",
  },

  // ── LINKED LIST ──────────────────────────────────────────────────────────────

  {
    id: "q-linked-list-001",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Linked List", "operações"],
    linkedFlashcardTags: ["linked-list"],
    prompt: "Qual operação é O(1) em Linked List mas O(n) em Array?",
    options: [
      "Inserção no início dado o nó anterior",
      "Acesso ao k-ésimo elemento",
      "Busca por valor",
      "Ordenação",
    ],
    correctAnswer: "Inserção no início dado o nó anterior",
    explanation:
      "Com ponteiro para o nó, inserir antes ou depois é O(1): apenas ajustar ponteiros. Em Array, inserir no início desloca todos os elementos: O(n). Trade-off: Linked List sacrifica acesso por índice O(1) em troca de inserção/remoção O(1) com ponteiro.",
  },

  {
    id: "q-linked-list-002",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "easy",
    type: "big_o",
    tags: ["Linked List", "reverter"],
    linkedFlashcardTags: ["linked-list"],
    prompt: "Qual é a complexidade de tempo e espaço da função reverter()?",
    code: "function reverter(cabeca) {\n  let prev = null, atual = cabeca;\n  while (atual) {\n    const prox = atual.next;\n    atual.next = prev;\n    prev = atual;\n    atual = prox;\n  }\n  return prev;\n}",
    options: [
      "O(n) tempo, O(1) espaço",
      "O(n) tempo, O(n) espaço",
      "O(n²) tempo, O(1) espaço",
      "O(log n) tempo, O(log n) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço",
    explanation:
      "Cada nó é visitado uma vez: O(n). Apenas 3 ponteiros (prev, atual, prox) — sem estrutura auxiliar: O(1) espaço. A solução recursiva também é O(n) mas usa O(n) de espaço pela call stack.",
  },

  {
    id: "q-linked-list-003",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["Linked List", "cycle-detection"],
    linkedFlashcardTags: ["linked-list"],
    prompt: "Detectar se uma lista ligada tem ciclo usando O(1) de espaço.",
    options: [
      "Floyd's Cycle Detection — ponteiros lento (×1) e rápido (×2)",
      "Guardar todos os nós em um Set",
      "Contar os nós e comparar com comprimento esperado",
      "DFS marcando nós visitados",
    ],
    correctAnswer: "Floyd's Cycle Detection — ponteiros lento (×1) e rápido (×2)",
    explanation:
      "Slow avança 1 nó por vez, fast avança 2. Se há ciclo, fast eventualmente alcança slow dentro do ciclo. Se não há ciclo, fast chega ao null. O(n) tempo, O(1) espaço — nenhuma estrutura auxiliar.",
  },

  {
    id: "q-linked-list-004",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "big_o",
    tags: ["Linked List", "cycle"],
    linkedFlashcardTags: ["linked-list"],
    prompt: "Qual é a complexidade de tempo desta detecção de ciclo?",
    code: "function temCiclo(cabeca) {\n  let lento = cabeca, rapido = cabeca;\n  while (rapido && rapido.next) {\n    lento = lento.next;\n    rapido = rapido.next.next;\n    if (lento === rapido) return true;\n  }\n  return false;\n}",
    options: [
      "O(n)",
      "O(n²) — dois ponteiros em velocidades diferentes",
      "O(log n) — o rápido divide o espaço",
      "O(1)",
    ],
    correctAnswer: "O(n)",
    explanation:
      "Se há ciclo: fast percorre o ciclo no máximo duas vezes antes de encontrar slow. Se não há ciclo: fast chega ao fim em n/2 iterações. Em ambos os casos O(n). Não é O(n²) porque os ponteiros avançam juntos, não há loop aninhado.",
  },

  {
    id: "q-linked-list-005",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["Linked List", "middle"],
    linkedFlashcardTags: ["linked-list"],
    prompt:
      "Encontrar o nó do meio de uma lista ligada em uma única passagem, sem conhecer o comprimento.",
    options: [
      "Dois ponteiros: slow (×1) e fast (×2) — quando fast chega ao fim, slow está no meio",
      "Percorrer duas vezes: primeiro para contar, depois para ir ao meio",
      "Usar recursão para chegar ao fim e retornar na metade",
      "Converter para array e acessar pelo índice",
    ],
    correctAnswer:
      "Dois ponteiros: slow (×1) e fast (×2) — quando fast chega ao fim, slow está no meio",
    explanation:
      "Fast avança duas posições para cada uma de slow. Quando fast chega ao null (ou ao último nó), slow está exatamente no meio. O(n) tempo, O(1) espaço, uma passada. A conversão para array é O(n) espaço.",
  },

  {
    id: "q-linked-list-006",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "interview",
    tags: ["Linked List", "LRU"],
    linkedFlashcardTags: ["linked-list", "hashmap"],
    prompt: "Como você implementaria um LRU Cache de tamanho k com get e put em O(1)?",
    idealAnswer:
      "HashMap para lookup O(1) por chave + Doubly Linked List para manter ordem de uso. Nó mais recente na cabeça, menos recente na cauda. get(key): encontrar nó pelo HashMap, mover para a cabeça, retornar valor — O(1). put(key, val): se chave existe, atualizar e mover para cabeça; se não existe, criar nó novo na cabeça; se size > k, remover nó da cauda e deletar do HashMap — O(1). A lista duplamente ligada permite remoção O(1) de qualquer posição. Nós sentinela (dummy head e tail) simplificam os edge cases.",
    keyPoints: [
      "HashMap: lookup O(1)",
      "DLL: remoção/inserção O(1) com ponteiro",
      "Nó mais recente = cabeça",
      "Nós sentinela evitam condicionais",
    ],
    explanation: "LRU Cache é o problema mais pedido de Linked List em entrevistas FAANG.",
  },

  {
    id: "q-linked-list-007",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["Linked List", "merge-k"],
    linkedFlashcardTags: ["linked-list", "heap"],
    prompt:
      "Qual é a complexidade de mesclar k listas ligadas ordenadas com n nós no total usando MinHeap?",
    options: [
      "O(n log k) — cada um dos n nós faz operação O(log k) no heap de tamanho k",
      "O(n × k) — percorre cada lista para cada nó",
      "O(n log n) — como ordenar todos os nós juntos",
      "O(k log k) — apenas os cabeças das listas importam",
    ],
    correctAnswer: "O(n log k) — cada um dos n nós faz operação O(log k) no heap de tamanho k",
    explanation:
      "O heap mantém o menor cabeça das k listas. Para cada um dos n nós, uma extração O(log k) e possivelmente uma inserção O(log k). Total: O(n log k). Muito melhor que merge sequencial O(n×k).",
  },

  {
    id: "q-linked-list-008",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "open",
    tags: ["Linked List", "dummy-node"],
    linkedFlashcardTags: ["linked-list"],
    prompt:
      "O que é o padrão 'dummy node' em problemas de linked list e por que ele simplifica a implementação?",
    idealAnswer:
      "Um nó sentinela criado antes do head real, com valor arbitrário. Elimina condicionais especiais para: (1) remover o primeiro nó real, (2) inserir antes da cabeça, (3) listas que ficam vazias durante operações. Sem dummy node, cada operação precisa verificar 'se prev é null, atualizar head'. Com dummy node, sempre há um prev.next para modificar — o dummy nunca é removido. Exemplos clássicos: Remove Nth from End, Merge Two Sorted Lists, Add Two Numbers. Custo: um nó extra de memória O(1), zero custo de tempo.",
    keyPoints: [
      "Elimina condicionais especiais",
      "prev.next sempre existe",
      "Usado em: remoção, merge, inserção",
      "O(1) espaço extra",
    ],
    explanation: "Dummy node é a diferença entre código com 5 condicionais e código limpo.",
  },

  {
    id: "q-linked-list-009",
    topic: "Linked List",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["Linked List", "nth-from-end"],
    linkedFlashcardTags: ["linked-list"],
    prompt: "Remover o k-ésimo nó a partir do final de uma lista ligada em uma única passagem.",
    options: [
      "Dois ponteiros com gap de k nós entre eles",
      "Percorrer duas vezes: contar tamanho, depois ir até n-k",
      "Converter para array, remover, reconstruir",
      "Recursão profunda e remover na volta",
    ],
    correctAnswer: "Dois ponteiros com gap de k nós entre eles",
    explanation:
      "Avançar o ponteiro rápido k posições. Depois mover ambos até rápido chegar ao fim — o lento estará no nó anterior ao que deve ser removido. Uma passagem: O(n). O(1) espaço. Com dummy node para lidar com remoção do primeiro nó.",
  },

  // ── TREES ────────────────────────────────────────────────────────────────────

  {
    id: "q-trees-001",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Trees", "in-order"],
    linkedFlashcardTags: ["trees", "bst"],
    prompt: "Em qual ordem o in-order traversal percorre uma BST?",
    options: [
      "Esquerda → Raiz → Direita (produz valores em ordem crescente)",
      "Raiz → Esquerda → Direita (pre-order)",
      "Esquerda → Direita → Raiz (post-order)",
      "Nível por nível (level-order)",
    ],
    correctAnswer: "Esquerda → Raiz → Direita (produz valores em ordem crescente)",
    explanation:
      "In-order em BST produz valores em ordem crescente — propriedade fundamental. Pre-order (Raiz → E → D) é útil para serialização. Post-order (E → D → Raiz) para deleção. Level-order usa fila.",
  },

  {
    id: "q-trees-002",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "easy",
    type: "big_o",
    tags: ["Trees", "altura"],
    linkedFlashcardTags: ["trees"],
    prompt: "Qual é a complexidade de tempo e espaço desta função?",
    code: "function altura(no) {\n  if (!no) return 0;\n  return 1 + Math.max(altura(no.left), altura(no.right));\n}",
    options: [
      "O(n) tempo, O(h) espaço onde h é a altura",
      "O(n) tempo, O(n) espaço",
      "O(log n) tempo, O(log n) espaço",
      "O(n²) tempo, O(h) espaço",
    ],
    correctAnswer: "O(n) tempo, O(h) espaço onde h é a altura",
    explanation:
      "Cada nó é visitado uma vez: O(n). A call stack tem profundidade h (altura). Em árvore balanceada: h = O(log n). Em degenerada (lista): h = O(n). Espaço O(h) é mais preciso que O(n).",
  },

  {
    id: "q-trees-003",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Trees", "BST", "complexidade"],
    linkedFlashcardTags: ["trees", "bst"],
    prompt: "Qual é a complexidade de busca em uma BST balanceada versus degenerada?",
    options: [
      "Balanceada: O(log n) — divide pela metade; Degenerada: O(n) — vira lista ligada",
      "Ambas O(log n) — BST sempre é eficiente",
      "Balanceada: O(n); Degenerada: O(n²)",
      "Balanceada: O(1); Degenerada: O(log n)",
    ],
    correctAnswer:
      "Balanceada: O(log n) — divide pela metade; Degenerada: O(n) — vira lista ligada",
    explanation:
      "BST balanceada: cada comparação descarta metade dos nós. BST degenerada: inserções em ordem crescente/decrescente criam uma lista. Soluções: AVL Tree ou Red-Black Tree garantem O(log n) com rebalanceamento automático.",
  },

  {
    id: "q-trees-004",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "big_o",
    tags: ["Trees", "level-order"],
    linkedFlashcardTags: ["trees"],
    prompt: "Qual é a complexidade de tempo desta solução de level-order?",
    code: "function levelOrder(raiz) {\n  if (!raiz) return [];\n  const res = [], fila = [raiz];\n  let head = 0;\n  while (head < fila.length) {\n    const nivel = [];\n    const tam = fila.length - head;\n    for (let i = 0; i < tam; i++) {\n      const no = fila[head++];\n      nivel.push(no.val);\n      if (no.left) fila.push(no.left);\n      if (no.right) fila.push(no.right);\n    }\n    res.push(nivel);\n  }\n  return res;\n}",
    options: [
      "O(n) — cada nó é enfileirado e processado exatamente uma vez",
      "O(n log n) — BFS tem log n níveis cada com n/2 nós",
      "O(n²) — loop duplo sobre nível e nós",
      "O(h × w) onde h é altura e w é largura máxima",
    ],
    correctAnswer: "O(n) — cada nó é enfileirado e processado exatamente uma vez",
    explanation:
      "O loop externo processa níveis, o interno processa nós do nível. Total de iterações do loop interno = n (número de nós). Cada nó é enfileirado e removido uma vez. O(n) tempo, O(w) espaço onde w é a largura máxima.",
  },

  {
    id: "q-trees-005",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["Trees", "validate-BST"],
    linkedFlashcardTags: ["trees", "bst"],
    prompt: "Verificar se uma árvore binária é uma BST válida. Qual é a abordagem correta?",
    options: [
      "DFS com limites min/max que se propagam pelos filhos",
      "Comparar apenas cada nó com seus dois filhos imediatos",
      "In-order traversal e verificar se o resultado está ordenado",
      "BFS nível por nível verificando propriedade BST",
    ],
    correctAnswer: "DFS com limites min/max que se propagam pelos filhos",
    explanation:
      "Comparar apenas filho imediato é insuficiente: um nó pode satisfazer localmente mas violar a restrição global. Passar min/max para cada sub-chamada: filho direito deve ser maior que o nó pai E maior que todos os ancestrais à esquerda. In-order também funciona (O(n) espaço), mas min/max é mais elegante.",
  },

  {
    id: "q-trees-006",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "interview",
    tags: ["Trees", "DFS-vs-BFS"],
    linkedFlashcardTags: ["trees"],
    prompt: "Quando você escolheria BFS ao invés de DFS em uma árvore binária?",
    idealAnswer:
      "BFS é preferível quando: (1) precisa encontrar o nó mais próximo da raiz com uma condição — BFS garante que o primeiro encontrado é o de menor nível; (2) processamento por nível: right side view, zig-zag traversal, largura máxima; (3) árvore tem grande profundidade mas largura pequena — DFS usaria O(h) de call stack. DFS é preferível para: caminhos raiz-folha, calcular altura, serialização, subproblemas recursivos naturais. Regra prática: se a resposta depende de 'qual nível', use BFS.",
    keyPoints: [
      "BFS: menor nível, processamento por camadas",
      "DFS: caminhos, altura, recursão natural",
      "Memória: BFS O(w), DFS O(h)",
      "Árvore larga: BFS pode usar mais memória",
    ],
    explanation: "A escolha entre DFS e BFS é uma pergunta frequente de entrevista.",
  },

  {
    id: "q-trees-007",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "big_o",
    tags: ["Trees", "diameter"],
    linkedFlashcardTags: ["trees"],
    prompt: "Qual é a complexidade de tempo desta solução para diâmetro da árvore?",
    code: "function diametro(raiz) {\n  let max = 0;\n  function profundidade(no) {\n    if (!no) return 0;\n    const esq = profundidade(no.left);\n    const dir = profundidade(no.right);\n    max = Math.max(max, esq + dir);\n    return 1 + Math.max(esq, dir);\n  }\n  profundidade(raiz);\n  return max;\n}",
    options: [
      "O(n) — cada nó é visitado uma vez na DFS",
      "O(n²) — para cada nó calcula altura das duas sub-árvores",
      "O(n log n) — para árvores balanceadas",
      "O(h²) onde h é a altura",
    ],
    correctAnswer: "O(n) — cada nó é visitado uma vez na DFS",
    explanation:
      "A função `profundidade` retorna a altura e atualiza o diâmetro máximo em uma única DFS. Cada nó é visitado exatamente uma vez — O(n). Seria O(n²) se chamasse uma função separada de altura para cada nó.",
  },

  {
    id: "q-trees-008",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "pattern",
    tags: ["Trees", "LCA"],
    linkedFlashcardTags: ["trees", "bst"],
    prompt: "Encontrar o Lowest Common Ancestor (LCA) de dois nós em uma BST.",
    options: [
      "DFS aproveitando a propriedade BST: se ambos menores que raiz, vai para esquerda; se maiores, para direita; senão, é o LCA",
      "BFS para encontrar ambos os nós e rastrear pais",
      "Armazenar o caminho completo de cada nó e encontrar divergência",
      "Dois ponteiros partindo de cada nó em direção à raiz",
    ],
    correctAnswer:
      "DFS aproveitando a propriedade BST: se ambos menores que raiz, vai para esquerda; se maiores, para direita; senão, é o LCA",
    explanation:
      "Em BST, o LCA é o nó onde os dois targets divergem. Se p < raiz e q < raiz: LCA está à esquerda. Se p > raiz e q > raiz: à direita. Caso contrário (um de cada lado, ou um é a raiz): a raiz é o LCA. O(h) tempo, O(1) espaço iterativo.",
  },

  {
    id: "q-trees-009",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "hard",
    type: "open",
    tags: ["Trees", "serialização"],
    linkedFlashcardTags: ["trees"],
    prompt:
      "Como você serializaria e deserializaria uma árvore binária em uma string? Qual é a complexidade?",
    idealAnswer:
      "Pre-order DFS com marcador para null (ex: '#'). Serializar: para cada nó, escrever valor + separador; para null escrever '#'. Recursão: serialize(raiz) = raiz.val + ',' + serialize(esq) + ',' + serialize(dir). Deserializar: dividir string, usar índice ou fila para consumir tokens, reconstruir recursivamente — quando token é '#', retornar null. Complexidade: O(n) tempo e O(n) espaço para ambas. Alternativa: JSON.stringify não funciona para referências circulares ou estruturas especiais.",
    keyPoints: [
      "Pre-order com marcador null",
      "Separador entre valores",
      "Deserializar com fila de tokens",
      "O(n) tempo e espaço",
    ],
    explanation: "Serialização é um problema clássico que testa domínio de DFS e recursão.",
  },

  {
    id: "q-trees-010",
    topic: "Trees",
    group: "data_structures",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["Trees", "path-sum"],
    linkedFlashcardTags: ["trees"],
    prompt:
      "Verificar se existe um caminho da raiz até alguma folha em uma árvore binária cuja soma dos valores seja igual a um target.",
    options: [
      "DFS recursivo subtraindo o valor atual do target",
      "BFS nível por nível acumulando soma",
      "Programação dinâmica sobre os nós",
      "Dois ponteiros sobre a árvore serializada",
    ],
    correctAnswer: "DFS recursivo subtraindo o valor atual do target",
    explanation:
      "DFS é natural para caminhos raiz-folha. Passar target - no.val para os filhos. Na folha, verificar se restante === 0. BFS também funciona mas precisaria armazenar a soma acumulada junto com cada nó na fila.",
  },

  // ── GRAPHS ───────────────────────────────────────────────────────────────────

  {
    id: "q-graphs-001",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Graphs", "representação"],
    linkedFlashcardTags: ["graph"],
    prompt: "Qual representação de grafo é mais eficiente em memória para grafos esparsos?",
    options: [
      "Lista de adjacência — O(V + E)",
      "Matriz de adjacência — O(V²)",
      "Lista de arestas — O(E)",
      "Ambas são equivalentes",
    ],
    correctAnswer: "Lista de adjacência — O(V + E)",
    explanation:
      "Grafo esparso: E << V². Matriz de adjacência desperdiça O(V²) espaço independente das arestas. Lista de adjacência armazena apenas arestas existentes: O(V + E). Para grafos densos (E ≈ V²), a diferença é insignificante.",
  },

  {
    id: "q-graphs-002",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "big_o",
    tags: ["Graphs", "DFS"],
    linkedFlashcardTags: ["graph", "dfs"],
    prompt: "Qual é a complexidade de tempo desta DFS em grafo com lista de adjacência?",
    code: "function dfs(grafo, inicio) {\n  const visitados = new Set();\n  function explorar(no) {\n    if (visitados.has(no)) return;\n    visitados.add(no);\n    for (const prox of grafo[no] || []) explorar(prox);\n  }\n  explorar(inicio);\n}",
    options: [
      "O(V + E) — cada vértice e aresta são processados uma vez",
      "O(V²) — para cada vértice visita todos os outros",
      "O(V × E) — multiplicação de vértices e arestas",
      "O(E log V) — por causa do Set de visitados",
    ],
    correctAnswer: "O(V + E) — cada vértice e aresta são processados uma vez",
    explanation:
      "Cada vértice é marcado como visitado e processado uma vez: O(V). Para cada vértice, percorremos sua lista de adjacência: total de percorrimentos = E. Total: O(V + E).",
  },

  {
    id: "q-graphs-003",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "pattern",
    tags: ["Graphs", "islands"],
    linkedFlashcardTags: ["graph", "dfs"],
    prompt:
      "Contar o número de ilhas em uma grade 2D (1=terra, 0=água). Cada ilha é um grupo de 1s conectados horizontalmente/verticalmente.",
    options: [
      "DFS ou BFS a partir de cada '1' não visitado, marcando toda a ilha",
      "Dois ponteiros percorrendo linhas e colunas",
      "Ordenar células e agrupar",
      "Programação dinâmica sobre subgrade",
    ],
    correctAnswer: "DFS ou BFS a partir de cada '1' não visitado, marcando toda a ilha",
    explanation:
      "Para cada célula '1' não visitada: incrementar contador, lançar DFS/BFS para marcar toda a ilha como visitada. Custo: O(n×m) — cada célula é visitada no máximo uma vez (modificar a grade evita Set extra).",
  },

  {
    id: "q-graphs-004",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Graphs", "Dijkstra"],
    linkedFlashcardTags: ["graph", "bfs"],
    prompt:
      "BFS encontra menor caminho em grafos não ponderados. Qual algoritmo usar para menor caminho com pesos nas arestas?",
    options: [
      "Dijkstra com MinHeap — para pesos positivos: O((V+E) log V)",
      "BFS ainda funciona — ignorar os pesos",
      "DFS com backtracking — tentar todos os caminhos",
      "Topological Sort — para qualquer tipo de grafo",
    ],
    correctAnswer: "Dijkstra com MinHeap — para pesos positivos: O((V+E) log V)",
    explanation:
      "BFS assume custo 1 por aresta. Com pesos diferentes, menos arestas != menor custo. Dijkstra usa MinHeap para sempre expandir o nó com menor custo acumulado. Não funciona com pesos negativos (usar Bellman-Ford). Para DAGs com qualquer peso: DP em ordem topológica.",
  },

  {
    id: "q-graphs-005",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "big_o",
    tags: ["Graphs", "topological-sort"],
    linkedFlashcardTags: ["graph"],
    prompt: "Qual é a complexidade deste topological sort por DFS?",
    code: "function topoSort(grafo, n) {\n  const visitados = new Set(), ordem = [];\n  function dfs(no) {\n    if (visitados.has(no)) return;\n    visitados.add(no);\n    for (const prox of grafo[no] || []) dfs(prox);\n    ordem.push(no);\n  }\n  for (let i = 0; i < n; i++) dfs(i);\n  return ordem.reverse();\n}",
    options: ["O(V + E)", "O(V log V)", "O(V²)", "O(E log E)"],
    correctAnswer: "O(V + E)",
    explanation:
      "DFS visita cada vértice uma vez e percorre cada aresta uma vez. Operações de Set.has/add são O(1) amortizado. push e reverse são O(V). Total: O(V + E).",
  },

  {
    id: "q-graphs-006",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "pattern",
    tags: ["Graphs", "cycle", "course-schedule"],
    linkedFlashcardTags: ["graph"],
    prompt:
      "Dado pré-requisitos de cursos [a, b] (para fazer a, precisa de b), verificar se é possível completar todos os cursos.",
    options: [
      "Detectar ciclo em grafo direcionado via DFS com 3 estados (branco/cinza/preto)",
      "BFS e verificar se há nós inalcançáveis",
      "Union-Find para componentes conectados",
      "Dois ponteiros sobre a lista de pré-requisitos",
    ],
    correctAnswer: "Detectar ciclo em grafo direcionado via DFS com 3 estados (branco/cinza/preto)",
    explanation:
      "Pré-requisitos formam grafo direcionado. Ciclo = impossível completar todos. DFS com estados: branco (não visitado), cinza (na call stack atual), preto (finalizado). Se atingimos um cinza, há ciclo. Alternativa: Kahn's algorithm (BFS topological sort) — se nem todos nós aparecem na ordem, há ciclo.",
  },

  {
    id: "q-graphs-007",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "interview",
    tags: ["Graphs", "Union-Find"],
    linkedFlashcardTags: ["graph"],
    prompt:
      "Quando você usaria Union-Find ao invés de DFS/BFS para problemas de componentes conectados?",
    idealAnswer:
      "Union-Find é superior quando o grafo é dinâmico — arestas são adicionadas incrementalmente e você precisa verificar conectividade online entre adições. Exemplo: Accounts Merge, conectar pontos enquanto chegam. DFS/BFS é mais simples para grafos estáticos ou quando precisa de informações de percurso (caminhos, distâncias). Union-Find com path compression e union by rank: O(α(n)) amortizado por operação, quase O(1). α é a inversa de Ackermann — na prática ≤ 4 para qualquer n realista.",
    keyPoints: [
      "Union-Find: grafo dinâmico, online queries",
      "DFS/BFS: grafo estático, percurso completo",
      "Union-Find com path compression: O(α(n))",
      "DFS: O(V + E) para análise completa",
    ],
    explanation: "Saber quando cada estrutura é superior demonstra profundidade técnica.",
  },

  {
    id: "q-graphs-008",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "pattern",
    tags: ["Graphs", "bipartite"],
    linkedFlashcardTags: ["graph"],
    prompt:
      "Verificar se um grafo é bipartido (pode ser colorido com 2 cores sem dois nós adjacentes da mesma cor).",
    options: [
      "BFS/DFS com 2-coloração — se algum vizinho tem a mesma cor, não é bipartido",
      "Verificar se o número de componentes é par",
      "Topological sort — grafos bipartidos têm ordenação única",
      "Union-Find — verificar se os dois endpoints de cada aresta estão no mesmo componente",
    ],
    correctAnswer: "BFS/DFS com 2-coloração — se algum vizinho tem a mesma cor, não é bipartido",
    explanation:
      "Tentar colorir com 2 cores: alternar a cada nível do BFS. Se em algum momento dois nós adjacentes teriam a mesma cor, o grafo não é bipartido. Grafo bipartido ↔ sem ciclos de comprimento ímpar. O(V + E).",
  },

  {
    id: "q-graphs-009",
    topic: "Graphs",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "open",
    tags: ["Graphs", "system-design"],
    linkedFlashcardTags: ["graph"],
    prompt:
      "Em qual tipo de problema de sistema você modelaria as entidades como um grafo? Que perguntas você faria para escolher o algoritmo certo?",
    idealAnswer:
      "Modele como grafo quando há entidades (nós) e relações entre elas (arestas). Exemplos: rede social (amizades), mapa de rotas (distâncias), dependências de módulos, schedulamento com restrições. Perguntas-chave: (1) O grafo é direcionado ou não? (2) Tem pesos? (3) Pode ter ciclos? (4) É esparso ou denso? (5) Você quer todos os caminhos ou apenas o melhor? Cada resposta muda o algoritmo: não ponderado + menor caminho → BFS; ponderado positivo → Dijkstra; ciclos em dirigido → DFS com 3 estados; componentes → Union-Find ou DFS.",
    keyPoints: [
      "Identificar nós e arestas do problema",
      "Perguntar: dirigido? ponderado? ciclos?",
      "Mapear para algoritmo correto",
      "Exemplos concretos de modelagem",
    ],
    explanation:
      "Saber modelar problemas como grafos é tão importante quanto conhecer os algoritmos.",
  },

  // ── HEAP ─────────────────────────────────────────────────────────────────────

  {
    id: "q-heap-001",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Heap", "min-heap"],
    linkedFlashcardTags: ["heap"],
    prompt: "Qual propriedade define um Min-Heap?",
    options: [
      "Cada nó pai é menor ou igual a todos seus descendentes",
      "Cada nó pai é maior ou igual a todos seus descendentes",
      "Os elementos estão em ordem crescente da esquerda para direita",
      "O heap é sempre uma BST balanceada",
    ],
    correctAnswer: "Cada nó pai é menor ou igual a todos seus descendentes",
    explanation:
      "Min-Heap: raiz é o menor elemento. Cada pai ≤ filhos. Max-Heap: raiz é o maior. Importante: não há ordem garantida entre irmãos. Heap não é BST — não há relação esquerda/direita baseada em valor.",
  },

  {
    id: "q-heap-002",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "big_o",
    tags: ["Heap", "top-k"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Qual é a complexidade de encontrar os top-K elementos de um array de n itens usando MinHeap?",
    code: "for (const num of nums) {\n  minHeap.push(num);\n  if (minHeap.size() > k) minHeap.pop();\n}",
    options: [
      "O(n log k) — n inserções/remoções em heap de tamanho k",
      "O(n log n) — como ordenar todo o array",
      "O(n + k log k) — percorrer + extrair k elementos",
      "O(k log n) — apenas os k maiores importam",
    ],
    correctAnswer: "O(n log k) — n inserções/remoções em heap de tamanho k",
    explanation:
      "Para cada um dos n elementos: push e possivelmente pop no heap de tamanho k — cada operação O(log k). Total: O(n log k). Se k << n, muito mais eficiente que sort O(n log n). Se k ≈ n, a diferença é pequena.",
  },

  {
    id: "q-heap-003",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Heap", "sort-vs-heap"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Para encontrar os 5 maiores elementos de um array de 10⁶ números, qual abordagem é mais eficiente?",
    options: [
      "MinHeap de tamanho 5: O(n log 5) ≈ O(n)",
      "Ordenar todo o array e pegar os últimos 5: O(n log n)",
      "QuickSelect repetido 5 vezes: O(5n) ≈ O(n) mas pior caso O(n²)",
      "DFS sobre o array: O(n²)",
    ],
    correctAnswer: "MinHeap de tamanho 5: O(n log 5) ≈ O(n)",
    explanation:
      "log 5 ≈ 2.3 — constante. O heap mantém os 5 maiores vistos até agora. Quando um novo elemento é maior que o mínimo do heap, substituir. Total: O(n). Sort ordena elementos desnecessários. QuickSelect tem pior caso O(n²) para k repetições.",
  },

  {
    id: "q-heap-004",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "big_o",
    tags: ["Heap", "merge-k"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Qual é a complexidade de mesclar k listas ordenadas com n nós no total usando MinHeap?",
    code: "// Heap contém [valor, índice_da_lista]\nwhile (heap.size()) {\n  const [val, listaIdx] = heap.pop();\n  result.push(val);\n  const prox = listas[listaIdx].proxNo();\n  if (prox) heap.push([prox.val, listaIdx]);\n}",
    options: ["O(n log k)", "O(n × k)", "O(n log n)", "O(k log k)"],
    correctAnswer: "O(n log k)",
    explanation:
      "Para cada um dos n nós: uma extração O(log k) e possivelmente uma inserção O(log k) no heap de tamanho k. Total: O(n log k). Merge sequencial de k listas seria O(n × k). Muito melhor para k grande.",
  },

  {
    id: "q-heap-005",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "pattern",
    tags: ["Heap", "k-closest"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Dado um array de pontos (x, y) e um inteiro k, encontrar os k pontos mais próximos da origem.",
    options: [
      "MaxHeap de tamanho k ordenado por distância²",
      "Ordenar todos os pontos por distância: O(n log n)",
      "QuickSelect para o k-ésimo menor: O(n) médio",
      "BFS a partir da origem: O(n²)",
    ],
    correctAnswer: "MaxHeap de tamanho k ordenado por distância²",
    explanation:
      "MaxHeap mantém os k menores vistos. Se a distância do novo ponto é menor que o máximo do heap, substituir. No final, o heap contém os k mais próximos. O(n log k). Usar distância² evita sqrt desnecessário. QuickSelect é O(n) mas mais complexo de implementar.",
  },

  {
    id: "q-heap-006",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "interview",
    tags: ["Heap", "median-stream"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Como encontrar a mediana de um stream de números em O(log n) por inserção e O(1) por consulta?",
    idealAnswer:
      "Duas heaps: MaxHeap para a metade inferior dos números, MinHeap para a metade superior. Invariante: tamanhos diferem em no máximo 1, e max(MaxHeap) ≤ min(MinHeap). Insert: decidir em qual heap vai (se novo valor ≤ topo do MaxHeap, vai para MaxHeap; senão para MinHeap). Depois balancear se |tamanhos| > 1: mover topo do maior para o menor. getMedian(): se tamanhos iguais, média dos dois topos; se um é maior, seu topo é a mediana. Complexidade: O(log n) por inserção, O(1) por consulta.",
    keyPoints: [
      "MaxHeap: metade inferior",
      "MinHeap: metade superior",
      "Balancear após cada inserção",
      "Mediana: média dos topos ou topo do maior",
    ],
    explanation: "Mediana de stream é um dos problemas clássicos de Heap em entrevistas.",
  },

  {
    id: "q-heap-007",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "open",
    tags: ["Heap", "implementação"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Como você implementaria um MinHeap do zero em JavaScript? Descreva a estrutura e as operações principais.",
    idealAnswer:
      "Array-based: filho esquerdo do índice i em 2i+1, direito em 2i+2, pai em floor((i-1)/2). push(val): inserir no final, siftUp — trocar com pai enquanto menor que pai. pop(): trocar raiz com último elemento, remover último, siftDown — trocar com o menor filho enquanto maior que algum filho. peek(): retornar heap[0]. Complexidades: push O(log n), pop O(log n), peek O(1). Build heap de array: O(n) usando Floyd's algorithm — siftDown de baixo para cima (mais eficiente que n pushes que seria O(n log n)).",
    keyPoints: [
      "Array: filho em 2i+1, 2i+2; pai em (i-1)/2",
      "push: siftUp até propriedade restaurada",
      "pop: trocar raiz com último, siftDown",
      "Build heap: O(n) com Floyd's",
    ],
    explanation: "Implementar MinHeap do zero é uma pergunta frequente de nível médio/senior.",
  },

  {
    id: "q-heap-008",
    topic: "Heap",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "pattern",
    tags: ["Heap", "reorganize-string"],
    linkedFlashcardTags: ["heap"],
    prompt:
      "Reorganizar os caracteres de uma string para que nenhum caractere igual apareça em posições adjacentes (retornar '' se impossível).",
    options: [
      "MaxHeap por frequência — sempre usar o caractere mais frequente que não viola adjacência",
      "Ordenar por frequência e intercalar",
      "DFS com backtracking tentando todas as posições",
      "Dois ponteiros com janela deslizante",
    ],
    correctAnswer:
      "MaxHeap por frequência — sempre usar o caractere mais frequente que não viola adjacência",
    explanation:
      "A estratégia greedy ótima: sempre colocar o caractere mais frequente disponível que não seja igual ao anterior. MaxHeap permite extrair o mais frequente em O(log k). Guardar o caractere anterior para não repeti-lo. Impossível quando alguma frequência > (n+1)/2.",
  },

  // ── TRIE ─────────────────────────────────────────────────────────────────────

  {
    id: "q-trie-001",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Trie", "uso"],
    linkedFlashcardTags: ["trie"],
    prompt: "Para qual problema Trie (Árvore de Prefixos) é a estrutura mais adequada?",
    options: [
      "Autocomplete e busca eficiente por prefixo",
      "Encontrar menor caminho entre dois pontos",
      "Detectar ciclos em grafos dirigidos",
      "Ordenar strings por frequência de aparição",
    ],
    correctAnswer: "Autocomplete e busca eficiente por prefixo",
    explanation:
      "Trie organiza strings por seus prefixos compartilhados. Busca de prefixo em O(L) onde L é o comprimento, independente do número de strings armazenadas. HashMap não consegue busca por prefixo sem verificar todas as chaves.",
  },

  {
    id: "q-trie-002",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "easy",
    type: "big_o",
    tags: ["Trie", "search"],
    linkedFlashcardTags: ["trie"],
    prompt: "Qual é a complexidade de buscar um prefixo em uma Trie já construída?",
    code: "function comecaCom(prefixo) {\n  let no = this.raiz;\n  for (const ch of prefixo) {\n    if (!no.filhos[ch]) return false;\n    no = no.filhos[ch];\n  }\n  return true;\n}",
    options: [
      "O(L) onde L é o comprimento do prefixo",
      "O(n) onde n é o número de palavras inseridas",
      "O(n × L) — verifica todas as palavras",
      "O(log n) — Trie é uma BST de strings",
    ],
    correctAnswer: "O(L) onde L é o comprimento do prefixo",
    explanation:
      "A busca percorre um nó por caractere do prefixo. O número total de palavras armazenadas não afeta o custo da busca — apenas o comprimento do prefixo importa.",
  },

  {
    id: "q-trie-003",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "interview",
    tags: ["Trie", "trie-vs-hashmap"],
    linkedFlashcardTags: ["trie", "hashmap"],
    prompt: "Em que situações Trie é superior a HashMap para armazenar strings?",
    idealAnswer:
      "Trie supera HashMap quando: (1) Busca por prefixo — HashMap requer verificar todas as chaves O(n); Trie navega diretamente ao prefixo O(L); (2) Autocomplete — listar todas as palavras com dado prefixo; (3) Verificar se alguma palavra é prefixo de outra; (4) Operações lexicográficas como ordenação por prefixo. HashMap é superior para: lookup exato de string em O(L) com hash, memória quando não há padrões de prefixo comuns (Trie pode ter muitos nós esparsos). Regra: se a palavra 'prefixo' aparece no enunciado, pensar em Trie.",
    keyPoints: [
      "Prefixo: Trie O(L), HashMap O(n)",
      "Autocomplete natural em Trie",
      "HashMap melhor para lookup exato",
      "Sinal no enunciado: 'prefixo' → Trie",
    ],
    explanation: "Reconhecer quando usar Trie é importante em entrevistas de nível senior.",
  },

  {
    id: "q-trie-004",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Trie", "memória"],
    linkedFlashcardTags: ["trie"],
    prompt:
      "Qual é o custo de memória de uma Trie com n palavras de comprimento médio L sobre um alfabeto de tamanho A?",
    options: [
      "O(n × L × A) no pior caso — cada nó tem até A ponteiros para filhos",
      "O(n × L) — um nó por caractere",
      "O(A^L) — exponencial no comprimento",
      "O(n + L) — linear no total",
    ],
    correctAnswer: "O(n × L × A) no pior caso — cada nó tem até A ponteiros para filhos",
    explanation:
      "No pior caso (sem prefixos compartilhados): n palavras × L nós por palavra × A ponteiros por nó. Para inglês (A=26): fator 26 por nó. Otimizações: usar Map de filhos (economiza espaço para nós esparsos), ou Radix Tree/Compressed Trie.",
  },

  {
    id: "q-trie-005",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "pattern",
    tags: ["Trie", "word-search"],
    linkedFlashcardTags: ["trie"],
    prompt:
      "Dado uma grade de letras e uma lista de palavras, encontrar quais palavras existem na grade (Word Search II).",
    options: [
      "Trie + DFS na grade — a Trie poda caminhos impossíveis cedo",
      "BFS separado para cada palavra",
      "HashMap de palavras + DFS na grade",
      "Backtracking puro para todas as combinações",
    ],
    correctAnswer: "Trie + DFS na grade — a Trie poda caminhos impossíveis cedo",
    explanation:
      "Inserir todas as palavras na Trie. DFS na grade navegando a Trie simultaneamente. Se o próximo nó não existe na Trie, parar esse caminho. Isso poda O(palavras × grade) para O(grade × L). Sem Trie, cada DFS é independente: O(palavras × n × m × 4^L).",
  },

  {
    id: "q-trie-006",
    topic: "Trie",
    group: "data_structures",
    week: 4,
    difficulty: "hard",
    type: "open",
    tags: ["Trie", "autocomplete"],
    linkedFlashcardTags: ["trie"],
    prompt:
      "Como você projetaria um sistema de autocomplete para uma barra de busca com milhões de consultas? Quais estruturas de dados e otimizações usaria?",
    idealAnswer:
      "Estrutura base: Trie onde cada nó armazena os top-K resultados por frequência (evita DFS completo — O(L + K) vs O(L + total de sugestões)). Atualizar frequências: propagar para os nós ancestrais ao inserir query. Para escala: (1) Cache de resultados para prefixos populares (Redis); (2) Trie distribuída por prefixo (sharding); (3) Compressão: Radix Tree/DAWG para strings com muitos prefixos comuns; (4) CDN para top prefixos; (5) Pre-computar sugestões para os 1k prefixos mais buscados. Latência alvo: <100ms, com cache <10ms.",
    keyPoints: [
      "Trie com top-K em cada nó",
      "Cache de resultados populares",
      "Distribuição por prefixo para escala",
      "Radix Tree para compressão",
    ],
    explanation:
      "Autocomplete é um problema clássico de system design que testa Trie + escalabilidade.",
  },
];
