// Part 3: Binary Search (9), Sliding Window (8), Two Pointers (8), BFS (7), DFS (7), Backtracking (6), DP (10)
export const PART3 = [
  // ── BINARY SEARCH ────────────────────────────────────────────────────────────

  {
    id: "q-binary-search-001",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "big_o",
    tags: ["Binary Search", "sorted-array"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Qual é a complexidade de tempo desta busca binária clássica?",
    code: "function buscar(nums, alvo) {\n  let esq = 0, dir = nums.length - 1;\n  while (esq <= dir) {\n    const meio = esq + Math.floor((dir - esq) / 2);\n    if (nums[meio] === alvo) return meio;\n    if (nums[meio] < alvo) esq = meio + 1;\n    else dir = meio - 1;\n  }\n  return -1;\n}",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(log n)",
    explanation:
      "A cada iteração o espaço de busca é reduzido pela metade. Com n elementos, no máximo log₂(n) iterações. Nota: usar esq + floor((dir-esq)/2) ao invés de (esq+dir)/2 evita overflow de inteiro em linguagens com limite de inteiro (boas práticas mesmo em JS).",
  },

  {
    id: "q-binary-search-002",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Binary Search", "precondição"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Qual é o pré-requisito fundamental para aplicar busca binária?",
    options: [
      "O espaço de busca deve ser monotônico — uma propriedade que é 'falsa' até um ponto e depois 'verdadeira'",
      "O array deve ter tamanho par",
      "O array não pode ter duplicatas",
      "O array deve ter apenas inteiros positivos",
    ],
    correctAnswer:
      "O espaço de busca deve ser monotônico — uma propriedade que é 'falsa' até um ponto e depois 'verdadeira'",
    explanation:
      "A condição formal: existe um predicado monótono P tal que P(x) é falso para x < threshold e verdadeiro para x ≥ threshold. Array ordenado é o caso mais comum, mas busca binária no espaço de respostas requer apenas monotonicidade, não array ordenado.",
  },

  {
    id: "q-binary-search-003",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "pattern",
    tags: ["Binary Search", "rotated"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Buscar um target em um array ordenado e depois rotacionado (ex: [4,5,6,7,0,1,2]).",
    options: [
      "Busca binária identificando qual metade está ordenada",
      "Busca linear O(n)",
      "Dois ponteiros partindo das extremidades",
      "DFS sobre o array",
    ],
    correctAnswer: "Busca binária identificando qual metade está ordenada",
    explanation:
      "A cada iteração, uma metade está necessariamente ordenada (comparar nums[esq] com nums[meio]). Verificar se o target está na metade ordenada; se sim, buscar lá; senão, buscar na outra. O(log n). Sem rotação, busca binária clássica.",
  },

  {
    id: "q-binary-search-004",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "big_o",
    tags: ["Binary Search", "answer-space"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Qual é a complexidade de tempo desta solução? (n = piles.length, m = max(piles))",
    code: "function velMinima(piles, h) {\n  let lo = 1, hi = Math.max(...piles);\n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    const horas = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);\n    if (horas <= h) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}",
    options: [
      "O(n log m) — busca binária no espaço de respostas [1,m] com verificação O(n)",
      "O(n × m) — testa cada velocidade para cada pilha",
      "O(n log n) — depende da ordenação",
      "O(m log n) — m candidatos com busca binária de n elementos",
    ],
    correctAnswer: "O(n log m) — busca binária no espaço de respostas [1,m] com verificação O(n)",
    explanation:
      "Busca binária sobre o intervalo de velocidades [1, max(piles)]: O(log m) iterações. Para cada velocidade candidata, verificar se é viável: O(n). Total: O(n log m). Problema: Koko Eating Bananas.",
  },

  {
    id: "q-binary-search-005",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "interview",
    tags: ["Binary Search", "reconhecer"],
    linkedFlashcardTags: ["binary-search"],
    prompt:
      "Como você reconhece que um problema pode ser resolvido com busca binária no espaço de respostas?",
    idealAnswer:
      "Sinal 1: a resposta está em um intervalo numérico [lo, hi] com um significado claro (velocidade, capacidade, dias). Sinal 2: existe uma função booleana monótona — para valores ≤ X a condição é satisfeita, para > X não é (ou vice-versa). Exemplos: 'mínima velocidade tal que...', 'menor capacidade tal que...'. Perguntas para confirmar: 'Se X funciona, X+1 também funciona?' Se sim, é monótono. Então buscar no espaço de respostas: lo = min viável, hi = max viável, testar mid com função de viabilidade.",
    keyPoints: [
      "Intervalo de respostas com significado",
      "Função booleana monótona",
      "Se X funciona, X+1 também funciona",
      "Separar a busca da verificação de viabilidade",
    ],
    explanation:
      "Busca binária no espaço de respostas é um padrão avançado que aparece frequentemente em FAANG.",
  },

  {
    id: "q-binary-search-006",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Binary Search", "lower-bound"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Qual é a diferença entre lower_bound e upper_bound em busca binária?",
    options: [
      "lower_bound: primeira posição ≥ target; upper_bound: primeira posição > target",
      "lower_bound busca o menor elemento; upper_bound busca o maior",
      "Não há diferença funcional — apenas nomes diferentes",
      "lower_bound usa ≤ no while; upper_bound usa <",
    ],
    correctAnswer: "lower_bound: primeira posição ≥ target; upper_bound: primeira posição > target",
    explanation:
      "lower_bound(arr, 5) em [1,3,5,5,7] retorna índice 2 (primeiro 5). upper_bound(arr, 5) retorna índice 4 (após o último 5). A diferença: upper_bound - lower_bound = número de ocorrências de target. Implementados com esq < dir e atualizações ligeiramente diferentes.",
  },

  {
    id: "q-binary-search-007",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "pattern",
    tags: ["Binary Search", "minimum-rotated"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Encontrar o elemento mínimo em um array ordenado e rotacionado (sem duplicatas).",
    options: [
      "Busca binária comparando meio com extremidade direita",
      "Busca linear para encontrar a quebra de ordem",
      "Dois ponteiros avançando em direções opostas",
      "DFS sobre o array",
    ],
    correctAnswer: "Busca binária comparando meio com extremidade direita",
    explanation:
      "Se nums[meio] > nums[dir]: o mínimo está à direita do meio (rotação está à direita). Se nums[meio] < nums[dir]: o mínimo está no meio ou à esquerda. O(log n). A comparação com dir (não com esq) funciona mesmo quando o array não está rotacionado.",
  },

  {
    id: "q-binary-search-008",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "open",
    tags: ["Binary Search", "float"],
    linkedFlashcardTags: ["binary-search"],
    prompt:
      "Como você aplicaria busca binária para encontrar a raiz quadrada de um número com precisão de 5 casas decimais?",
    idealAnswer:
      "Busca binária no intervalo contínuo [0, max(1, x)]. Critério de parada: hi - lo < 1e-5. A cada passo: mid = (lo + hi) / 2; se mid² > x, hi = mid; senão lo = mid. Após convergência, retornar lo. Complexidade: O(log(x / ε)) iterações onde ε = precisão. Para x=2 com ε=1e-5: cerca de log₂(2/0.00001) ≈ 17 iterações. Ponto chave: busca binária funciona em qualquer espaço com monotonicidade, incluindo espaço contínuo.",
    keyPoints: [
      "Intervalo [0, max(1, x)] para x < 1",
      "Critério de parada: hi - lo < ε",
      "Comparar mid² com x",
      "O(log(x/ε)) iterações",
    ],
    explanation: "Busca binária em domínio contínuo é uma extensão natural do caso discreto.",
  },

  {
    id: "q-binary-search-009",
    topic: "Binary Search",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["Binary Search", "infinite-loop"],
    linkedFlashcardTags: ["binary-search"],
    prompt: "Por que a seguinte atualização pode causar loop infinito em busca binária?",
    code: "// Variante para encontrar lower_bound\nwhile (esq < dir) {\n  const meio = Math.floor((esq + dir) / 2);\n  if (cond(meio)) dir = meio;\n  else esq = meio; // ← risco de loop\n}",
    options: [
      "Se esq + 1 = dir, meio = esq, a condição é falsa, esq = meio = esq — não avança",
      "Math.floor nunca convergirá quando esq é ímpar",
      "A variável dir nunca decresce quando cond(meio) é verdadeiro",
      "O while deveria usar ≤ para esse padrão",
    ],
    correctAnswer:
      "Se esq + 1 = dir, meio = esq, a condição é falsa, esq = meio = esq — não avança",
    explanation:
      "Correção: usar esq = meio + 1. Ou usar Math.ceil((esq+dir)/2) para esse template. A escolha de floor vs ceil depende das atualizações: quando esq = meio, usar ceil; quando dir = meio, usar floor.",
  },

  // ── SLIDING WINDOW ───────────────────────────────────────────────────────────

  {
    id: "q-sliding-window-001",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "big_o",
    tags: ["Sliding Window", "fixed"],
    linkedFlashcardTags: ["sliding-window"],
    prompt: "Qual é a complexidade de tempo desta solução de janela fixa?",
    code: "function maxSomaSubarray(nums, k) {\n  let soma = 0;\n  for (let i = 0; i < k; i++) soma += nums[i];\n  let melhor = soma;\n  for (let i = k; i < nums.length; i++) {\n    soma += nums[i] - nums[i - k];\n    melhor = Math.max(melhor, soma);\n  }\n  return melhor;\n}",
    options: ["O(n)", "O(n × k)", "O(k)", "O(n²)"],
    correctAnswer: "O(n)",
    explanation:
      "A janela desliza uma posição por vez: adiciona o elemento novo e remove o mais antigo em O(1). Total: O(k) para inicializar + O(n-k) para deslizar = O(n). A abordagem bruta com dois loops seria O(n × k).",
  },

  {
    id: "q-sliding-window-002",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Sliding Window", "quando usar"],
    linkedFlashcardTags: ["sliding-window"],
    prompt: "Sliding Window é a abordagem mais eficiente para qual tipo de problema?",
    options: [
      "Subarray ou substring contígua satisfazendo uma condição (comprimento máximo, soma mínima, unicidade)",
      "Encontrar o maior elemento de um array desordenado",
      "Detectar ciclos em grafos",
      "Buscar um valor específico em array não ordenado",
    ],
    correctAnswer:
      "Subarray ou substring contígua satisfazendo uma condição (comprimento máximo, soma mínima, unicidade)",
    explanation:
      "Palavras-chave no enunciado: 'subarray', 'substring', 'contígua', 'janela'. Sliding Window converte O(n²) bruto em O(n) mantendo estado incremental da janela.",
  },

  {
    id: "q-sliding-window-003",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "big_o",
    tags: ["Sliding Window", "variable"],
    linkedFlashcardTags: ["sliding-window"],
    prompt: "Qual é a complexidade de tempo desta janela variável?",
    code: "function maisSemRepetir(s) {\n  const contador = new Map();\n  let esq = 0, maxLen = 0;\n  for (let dir = 0; dir < s.length; dir++) {\n    contador.set(s[dir], (contador.get(s[dir]) || 0) + 1);\n    while (contador.size > k) {\n      const c = s[esq++];\n      contador.set(c, contador.get(c) - 1);\n      if (contador.get(c) === 0) contador.delete(c);\n    }\n    maxLen = Math.max(maxLen, dir - esq + 1);\n  }\n  return maxLen;\n}",
    options: [
      "O(n) — cada caractere é adicionado e removido no máximo uma vez",
      "O(n × k) — k elementos distintos por posição",
      "O(n²) — while aninhado no for",
      "O(n log k) — Map tem custo logarítmico",
    ],
    correctAnswer: "O(n) — cada caractere é adicionado e removido no máximo uma vez",
    explanation:
      "O ponteiro esq nunca retrocede. Total de operações do while ao longo de todo o loop: no máximo n (esq vai de 0 a n-1). Custo amortizado O(1) por iteração do for. Map.get/set/delete são O(1) amortizado.",
  },

  {
    id: "q-sliding-window-004",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Sliding Window", "negativos"],
    linkedFlashcardTags: ["sliding-window"],
    prompt:
      "Por que Sliding Window com dois ponteiros NÃO resolve diretamente 'subarray com soma exatamente K' quando o array tem números negativos?",
    options: [
      "Com negativos, encolher a janela pode aumentar a soma — a monotonicidade quebra",
      "Dois ponteiros exigem array ordenado para funcionar",
      "Negativos causam overflow no acumulador de soma",
      "A janela precisaria de três ponteiros para negativos",
    ],
    correctAnswer:
      "Com negativos, encolher a janela pode aumentar a soma — a monotonicidade quebra",
    explanation:
      "Sliding Window funciona porque com números positivos, expandir a janela aumenta a soma monotonicamente. Com negativos, adicionar um elemento pode diminuir a soma. Solução para negativos: prefix sum + HashMap, buscando prefix[j] - prefix[i] = K.",
  },

  {
    id: "q-sliding-window-005",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "pattern",
    tags: ["Sliding Window", "minimum-window"],
    linkedFlashcardTags: ["sliding-window"],
    prompt:
      "Encontrar a menor substring de S que contém todos os caracteres de T (com as frequências corretas).",
    options: [
      "Janela variável com HashMap de frequências e contador de caracteres satisfeitos",
      "BFS sobre todos os substrings",
      "Busca binária no comprimento + verificação",
      "Dois ponteiros sobre S e T simultaneamente",
    ],
    correctAnswer:
      "Janela variável com HashMap de frequências e contador de caracteres satisfeitos",
    explanation:
      "Expandir dir até conter todos os caracteres de T. Contrair esq enquanto ainda contém todos. Manter um contador 'satisfeitos' para saber quando a janela é válida em O(1). O(|S| + |T|). Problema: Minimum Window Substring.",
  },

  {
    id: "q-sliding-window-006",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "interview",
    tags: ["Sliding Window", "fixed-vs-variable"],
    linkedFlashcardTags: ["sliding-window"],
    prompt:
      "Como você diferencia um problema de janela fixa de um de janela variável? Dê um exemplo de cada.",
    idealAnswer:
      "Janela fixa: o comprimento k é dado explicitamente — 'subarray de tamanho k com maior soma'. A janela sempre tem k elementos; basta adicionar um e remover o mais antigo. Janela variável: o comprimento é determinado por uma condição — 'maior substring sem repetição', 'menor subarray com soma ≥ target'. A janela cresce expandindo dir e encolhe movendo esq. A condição define quando expandir e quando contrair. Sinal para variável: 'maior' ou 'menor' sem tamanho fixo, com uma restrição de qualidade.",
    keyPoints: [
      "Fixa: tamanho k explícito",
      "Variável: tamanho determinado por condição",
      "Fixa: remover mais antigo, adicionar novo",
      "Variável: expandir dir, contrair esq quando inválido",
    ],
    explanation:
      "Distinguir os dois tipos de sliding window é a primeira etapa para resolver o problema.",
  },

  {
    id: "q-sliding-window-007",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "big_o",
    tags: ["Sliding Window", "deque", "maximum"],
    linkedFlashcardTags: ["sliding-window"],
    prompt: "Qual é a complexidade de tempo desta solução para máximo de janela deslizante?",
    code: "function maxJanelaDeslizante(nums, k) {\n  const deque = [], res = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (deque.length && deque[0] < i - k + 1) deque.shift();\n    while (deque.length && nums[deque.at(-1)] < nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) res.push(nums[deque[0]]);\n  }\n  return res;\n}",
    options: [
      "O(n) — cada índice é adicionado e removido do deque no máximo uma vez",
      "O(n × k) — para cada posição, verifica k elementos",
      "O(n log k) — deque tem operações logarítmicas",
      "O(n²) — dois while aninhados no for",
    ],
    correctAnswer: "O(n) — cada índice é adicionado e removido do deque no máximo uma vez",
    explanation:
      "Análise amortizada: cada índice 0..n-1 entra no deque uma vez e sai uma vez (por deque.pop() ou deque.shift()). Total de operações: no máximo 2n. Os while aninhados não criam O(n²) — custo total de todos os while é O(n). Problema: Sliding Window Maximum.",
  },

  {
    id: "q-sliding-window-008",
    topic: "Sliding Window",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "pattern",
    tags: ["Sliding Window", "permutation"],
    linkedFlashcardTags: ["sliding-window"],
    prompt: "Verificar se alguma permutação de string p existe como substring de string s.",
    options: [
      "Janela fixa de tamanho |p| com HashMap de frequências",
      "Backtracking gerando todas as permutações de p",
      "BFS sobre todos os substrings de s",
      "Dois ponteiros com sort de cada substring",
    ],
    correctAnswer: "Janela fixa de tamanho |p| com HashMap de frequências",
    explanation:
      "Permutação = mesmos caracteres com mesmas frequências. Janela fixa de tamanho |p| sobre s. Manter HashMap de frequências da janela e comparar com freq de p. Atualizar em O(1) a cada deslizamento. O(|s|). Backtracking com todas as permutações seria fatorial.",
  },

  // ── TWO POINTERS ─────────────────────────────────────────────────────────────

  {
    id: "q-two-pointers-001",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "big_o",
    tags: ["Two Pointers", "two-sum-sorted"],
    linkedFlashcardTags: ["two-pointers"],
    prompt: "Qual é a complexidade de tempo e espaço da função doisSomaSorted()?",
    code: "function doisSomaSorted(nums, alvo) {\n  let esq = 0, dir = nums.length - 1;\n  while (esq < dir) {\n    const soma = nums[esq] + nums[dir];\n    if (soma === alvo) return [esq, dir];\n    if (soma < alvo) esq++;\n    else dir--;\n  }\n  return [];\n}",
    options: [
      "O(n) tempo, O(1) espaço",
      "O(n²) tempo, O(1) espaço",
      "O(n log n) tempo, O(n) espaço",
      "O(n) tempo, O(n) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço",
    explanation:
      "Cada ponteiro avança no máximo n vezes, no total no máximo n iterações: O(n). Apenas dois ponteiros escalares: O(1) espaço. Vantagem sobre HashMap: O(1) de espaço extra.",
  },

  {
    id: "q-two-pointers-002",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Two Pointers", "precondição"],
    linkedFlashcardTags: ["two-pointers"],
    prompt: "Qual é a condição que normalmente habilita o uso de dois ponteiros em um array?",
    options: [
      "O array está ordenado ou a propriedade de interesse é monótona com os índices",
      "O array tem apenas inteiros positivos",
      "O array tem tamanho par",
      "O array não contém duplicatas",
    ],
    correctAnswer: "O array está ordenado ou a propriedade de interesse é monótona com os índices",
    explanation:
      "Dois ponteiros funcionam quando há uma relação previsível: avançar o ponteiro esquerdo aumenta algo, avançar o direito diminui. Em arrays ordenados, isso é garantido. A ordenação é a pista mais comum no enunciado para aplicar este padrão.",
  },

  {
    id: "q-two-pointers-003",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "big_o",
    tags: ["Two Pointers", "3sum"],
    linkedFlashcardTags: ["two-pointers"],
    prompt: "Qual é a complexidade de tempo desta solução para 3Sum?",
    code: "function tresZero(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i-1]) continue;\n    let esq = i + 1, dir = nums.length - 1;\n    while (esq < dir) {\n      const soma = nums[i] + nums[esq] + nums[dir];\n      if (soma === 0) { res.push([nums[i], nums[esq], nums[dir]]); esq++; dir--; }\n      else if (soma < 0) esq++;\n      else dir--;\n    }\n  }\n  return res;\n}",
    options: [
      "O(n²) — sort O(n log n) dominado pelo loop O(n) × dois ponteiros O(n)",
      "O(n³) — três iterações aninhadas",
      "O(n log n) — dominado pelo sort",
      "O(n²) no melhor caso, O(n³) no pior",
    ],
    correctAnswer: "O(n²) — sort O(n log n) dominado pelo loop O(n) × dois ponteiros O(n)",
    explanation:
      "Sort: O(n log n). Loop externo: O(n). Dois ponteiros internos: O(n) por iteração do loop externo. Total: O(n²). O(n log n) do sort é absorvido pelo O(n²). Não há como reduzir abaixo de O(n²) para 3Sum.",
  },

  {
    id: "q-two-pointers-004",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "pattern",
    tags: ["Two Pointers", "container-water"],
    linkedFlashcardTags: ["two-pointers"],
    prompt:
      "Dado array de alturas, encontrar dois índices que formam o container com maior volume de água.",
    options: [
      "Dois ponteiros: esq e dir, mover o de menor altura",
      "Brute force: testar todos os pares",
      "Sliding Window de tamanho crescente",
      "Programação dinâmica com cache de máximos",
    ],
    correctAnswer: "Dois ponteiros: esq e dir, mover o de menor altura",
    explanation:
      "A água = min(h[esq], h[dir]) × (dir - esq). Mover o maior não ajuda (a largura diminui, a altura é limitada pelo menor). Mover o menor é a única chance de encontrar uma altura maior. O(n) com O(1) espaço.",
  },

  {
    id: "q-two-pointers-005",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Two Pointers", "container"],
    linkedFlashcardTags: ["two-pointers"],
    prompt:
      "Em Container With Most Water, por que mover o ponteiro da altura MENOR (e não o maior)?",
    options: [
      "A largura só diminui ao mover qualquer ponteiro; mover o menor é a única chance de compensar com maior altura",
      "Para garantir que percorremos o array da esquerda para a direita",
      "Mover o maior eliminaria soluções ótimas com certeza",
      "O ponteiro menor sempre aponta para a solução ótima",
    ],
    correctAnswer:
      "A largura só diminui ao mover qualquer ponteiro; mover o menor é a única chance de compensar com maior altura",
    explanation:
      "Volume = min(h[l], h[r]) × (r - l). Ao mover um ponteiro, a largura (r-l) sempre diminui. Se movermos o maior, o min não melhora (ainda limitado pelo menor). Se movermos o menor, existe a chance de encontrar uma altura maior que aumente o min.",
  },

  {
    id: "q-two-pointers-006",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "medium",
    type: "interview",
    tags: ["Two Pointers", "vs-hashmap"],
    linkedFlashcardTags: ["two-pointers"],
    prompt:
      "Você resolveu Two Sum com HashMap. O entrevistador pergunta: 'Há solução com O(1) de espaço?' Como você responde?",
    idealAnswer:
      "Sim, se o array puder ser ordenado: ordenar em O(n log n), depois dois ponteiros em O(n) e O(1) espaço. Se a ordenação perder os índices originais (problema pede índices originais), precisaria guardar mapeamento: volta para O(n) espaço. Se o array já vem ordenado (problema 'Two Sum II'), dois ponteiros é claramente superior: O(n) tempo, O(1) espaço vs O(n) de HashMap. A resposta depende dos requisitos: se índices originais são necessários, HashMap é a solução; se array ordenado ou índices não importam, dois ponteiros é mais eficiente em espaço.",
    keyPoints: [
      "Ordenar para habilitar dois ponteiros: perde índices originais",
      "Two Sum II (ordenado): dois ponteiros é superior",
      "Trade-off: O(1) espaço mas O(n log n) tempo se precisa ordenar",
      "Sempre perguntar: índices originais são necessários?",
    ],
    explanation: "Demonstrar conhecimento dos trade-offs mostra maturidade técnica.",
  },

  {
    id: "q-two-pointers-007",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "pattern",
    tags: ["Two Pointers", "palindrome"],
    linkedFlashcardTags: ["two-pointers"],
    prompt:
      "Verificar se um string (ignorando não-alfanuméricos e diferença de maiúsculas) é um palíndromo usando O(1) de espaço.",
    options: [
      "Dois ponteiros do início e do fim, pulando não-alfanuméricos",
      "Inverter o string e comparar: O(n) espaço",
      "Stack para empilhar metade e comparar",
      "BFS sobre os caracteres",
    ],
    correctAnswer: "Dois ponteiros do início e do fim, pulando não-alfanuméricos",
    explanation:
      "Dois ponteiros esq e dir. Avançar esq e recuar dir pulando não-alfanuméricos. Comparar s[esq].toLowerCase() com s[dir].toLowerCase(). Se alguma comparação falhar, não é palíndromo. O(n) tempo, O(1) espaço.",
  },

  {
    id: "q-two-pointers-008",
    topic: "Two Pointers",
    group: "algorithms",
    week: 2,
    difficulty: "hard",
    type: "open",
    tags: ["Two Pointers", "fast-slow"],
    linkedFlashcardTags: ["two-pointers", "linked-list"],
    prompt:
      "O que são fast e slow pointers? Descreva os três problemas clássicos de Linked List que eles resolvem.",
    idealAnswer:
      "Dois ponteiros avançando em velocidades diferentes: slow (×1 por iteração) e fast (×2). (1) Detectar ciclo: se há ciclo, fast alcança slow dentro do ciclo — O(n), O(1). (2) Encontrar meio da lista: quando fast chega ao fim (ou null), slow está no meio — útil para Palindrome Linked List. (3) Início do ciclo (Floyd's parte 2): após detectar colisão, mover um ponteiro para head e avançar ambos a 1 — se encontram, é o início do ciclo — O(n). Todos: O(n) tempo, O(1) espaço.",
    keyPoints: [
      "Slow ×1, fast ×2",
      "Ciclo: se encontram há ciclo",
      "Meio: fast ao fim, slow no meio",
      "Início do ciclo: Floyd's parte 2",
    ],
    explanation: "Fast e slow pointers é um padrão fundamental que aparece em múltiplos problemas.",
  },

  // ── BFS ──────────────────────────────────────────────────────────────────────

  {
    id: "q-bfs-001",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["BFS", "garantia"],
    linkedFlashcardTags: ["bfs"],
    prompt: "Qual é a garantia principal do BFS em grafos não ponderados?",
    options: [
      "Encontra o menor caminho em número de arestas — a primeira chegada a um nó garante o caminho mais curto",
      "Explora toda a profundidade antes de avançar ao próximo nível",
      "Funciona para grafos com pesos negativos",
      "Usa menos memória que DFS em qualquer tipo de grafo",
    ],
    correctAnswer:
      "Encontra o menor caminho em número de arestas — a primeira chegada a um nó garante o caminho mais curto",
    explanation:
      "BFS explora nível a nível. Como todos os nós do nível k são visitados antes do nível k+1, a primeira vez que BFS alcança um nó, é pelo caminho com menor número de arestas. Com pesos diferentes, usar Dijkstra.",
  },

  {
    id: "q-bfs-002",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "easy",
    type: "big_o",
    tags: ["BFS", "grafo"],
    linkedFlashcardTags: ["bfs"],
    prompt: "Qual é a complexidade de tempo desta BFS em grafo com lista de adjacência?",
    code: "function bfs(inicio, grafo) {\n  const visitados = new Set([inicio]);\n  const fila = [inicio];\n  let head = 0;\n  while (head < fila.length) {\n    const no = fila[head++];\n    for (const prox of grafo[no] || []) {\n      if (!visitados.has(prox)) { visitados.add(prox); fila.push(prox); }\n    }\n  }\n}",
    options: ["O(V + E)", "O(V²)", "O(V × E)", "O(E log V)"],
    correctAnswer: "O(V + E)",
    explanation:
      "Cada vértice é enfileirado e processado uma vez: O(V). Para cada vértice, percorremos sua lista de adjacência: total = E. Set.has/add são O(1) amortizado. Total: O(V + E).",
  },

  {
    id: "q-bfs-003",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["BFS", "memória"],
    linkedFlashcardTags: ["bfs"],
    prompt: "Em qual situação BFS usa significativamente mais memória que DFS?",
    options: [
      "Em grafos/árvores com grande largura — BFS pode manter um nível inteiro na fila",
      "BFS sempre usa mais memória que DFS",
      "Em grafos dirigidos com muitos ciclos",
      "Quando o grafo tem pesos nas arestas",
    ],
    correctAnswer:
      "Em grafos/árvores com grande largura — BFS pode manter um nível inteiro na fila",
    explanation:
      "BFS: fila tem no máximo O(w) elementos onde w é a largura máxima. DFS: call stack tem O(h) profundidade. Para árvores balanceadas: BFS O(n/2) no último nível vs DFS O(log n). Para árvores degeneradas: DFS O(n) de profundidade vs BFS O(1) por nível.",
  },

  {
    id: "q-bfs-004",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["BFS", "word-ladder"],
    linkedFlashcardTags: ["bfs"],
    prompt:
      "Transformar uma palavra em outra trocando uma letra por vez (cada intermediária deve ser válida), usando o menor número de transformações.",
    options: [
      "BFS — menor número de transformações = menor número de arestas",
      "DFS — explorar todos os caminhos e pegar o mais curto",
      "Backtracking — tentar todas as sequências",
      "Programação dinâmica sobre a distância de edição",
    ],
    correctAnswer: "BFS — menor número de transformações = menor número de arestas",
    explanation:
      "Modelar como grafo: cada palavra é um nó, aresta entre palavras que diferem por uma letra. BFS do início garante encontrar o menor caminho. DFS encontraria um caminho, não necessariamente o menor. Problema: Word Ladder.",
  },

  {
    id: "q-bfs-005",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "interview",
    tags: ["BFS", "rastrear-nivel"],
    linkedFlashcardTags: ["bfs"],
    prompt:
      "Como você rastreia o nível (distância) de cada nó durante uma BFS para computar distâncias?",
    idealAnswer:
      "Duas abordagens: (1) Processar por snapshots de tamanho: antes de cada nível, registrar o tamanho atual da fila (fila.length - head). Processar exatamente esse número de nós, depois incrementar o contador de nível. (2) Enfileirar um marcador sentinel (null ou -1) após cada nível. Quando o sentinel é desempilhado, incrementar nível e enfileirar um novo sentinel. A primeira abordagem é mais limpa em JavaScript. Alternativa: armazenar a distância junto com o nó na fila: fila.push([nó, distância]).",
    keyPoints: [
      "Snapshot do tamanho da fila por nível",
      "Ou sentinel entre níveis",
      "Ou armazenar distância junto com o nó",
      "Complexidade inalterada: O(V + E)",
    ],
    explanation:
      "Rastrear nível é necessário em problemas como Minimum Depth of Binary Tree e Word Ladder.",
  },

  {
    id: "q-bfs-006",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "hard",
    type: "open",
    tags: ["BFS", "Dijkstra"],
    linkedFlashcardTags: ["bfs"],
    prompt:
      "Por que BFS falha para menor caminho com pesos diferentes, e como Dijkstra resolve isso?",
    idealAnswer:
      "BFS assume custo uniforme de 1 por aresta. Com pesos diferentes, um caminho com mais arestas pode ter custo menor que um com menos. Dijkstra usa MinHeap para sempre expandir o nó com menor custo acumulado (distância do início). Garante: quando um nó é extraído do heap, sua distância é definitiva. Complexidade: O((V + E) log V) com heap binário. Limitação: não funciona com pesos negativos (usar Bellman-Ford: O(V×E)). Para DAGs: DP em ordem topológica funciona com pesos quaisquer.",
    keyPoints: [
      "BFS: custo uniforme 1",
      "Dijkstra: MinHeap por custo acumulado",
      "O((V+E) log V)",
      "Não funciona com pesos negativos → Bellman-Ford",
    ],
    explanation: "BFS vs Dijkstra é uma das distinções mais importantes em algoritmos de grafos.",
  },

  {
    id: "q-bfs-007",
    topic: "BFS",
    group: "algorithms",
    week: 3,
    difficulty: "hard",
    type: "big_o",
    tags: ["BFS", "multi-source"],
    linkedFlashcardTags: ["bfs"],
    prompt: "Qual é a complexidade de tempo desta BFS multi-source?",
    code: "// Todas as fontes enfileiradas simultaneamente no início\nfor (const fonte of fontes) { fila.push(fonte); visitados.add(fonte); }\nwhile (head < fila.length) {\n  const no = fila[head++];\n  for (const prox of grafo[no] || []) {\n    if (!visitados.has(prox)) { visitados.add(prox); fila.push(prox); }\n  }\n}",
    options: [
      "O(V + E) — mesmo que BFS single-source; apenas a fila inicial tem mais elementos",
      "O(fontes × (V + E)) — uma BFS por fonte",
      "O(V² + E) — custo extra pelas múltiplas fontes",
      "O(E log V) — heap necessário",
    ],
    correctAnswer:
      "O(V + E) — mesmo que BFS single-source; apenas a fila inicial tem mais elementos",
    explanation:
      "BFS multi-source é equivalente a adicionar um super-nó fictício conectado a todas as fontes. Cada vértice e aresta são visitados uma vez: O(V + E). O número de fontes não multiplica o custo — apenas popula a fila inicial com mais elementos.",
  },

  // ── DFS ──────────────────────────────────────────────────────────────────────

  {
    id: "q-dfs-001",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["DFS", "característica"],
    linkedFlashcardTags: ["dfs"],
    prompt: "Qual é a principal característica do DFS?",
    options: [
      "Explora o máximo possível em um caminho antes de retroceder (backtrack)",
      "Garante encontrar o menor caminho em grafos não ponderados",
      "Processa todos os nós de um nível antes de avançar ao próximo",
      "Requer fila (FIFO) para implementação",
    ],
    correctAnswer: "Explora o máximo possível em um caminho antes de retroceder (backtrack)",
    explanation:
      "DFS vai fundo em um ramo antes de explorar outros. Usa pilha (recursão ou explícita). Não garante menor caminho. BFS usa fila e processa por nível. DFS usa pilha e processa por profundidade.",
  },

  {
    id: "q-dfs-002",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "easy",
    type: "big_o",
    tags: ["DFS", "islands"],
    linkedFlashcardTags: ["dfs"],
    prompt: "Qual é a complexidade de tempo desta solução para contar ilhas?",
    code: "function contarIlhas(grade) {\n  let conta = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || r >= grade.length || c < 0 || c >= grade[0].length) return;\n    if (grade[r][c] !== '1') return;\n    grade[r][c] = '0';\n    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n  };\n  for (let r = 0; r < grade.length; r++)\n    for (let c = 0; c < grade[0].length; c++)\n      if (grade[r][c] === '1') { conta++; dfs(r, c); }\n  return conta;\n}",
    options: [
      "O(n × m) — cada célula é visitada no máximo uma vez",
      "O((n × m)²) — DFS dentro de loop duplo",
      "O(n² × m²) — recursão quádrupla",
      "O(n × m × log(n × m))",
    ],
    correctAnswer: "O(n × m) — cada célula é visitada no máximo uma vez",
    explanation:
      "Cada célula é alterada de '1' para '0' quando visitada, impedindo revisitas. O loop duplo e todas as chamadas DFS juntas visitam cada célula no máximo uma vez: O(n × m) total.",
  },

  {
    id: "q-dfs-003",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "pattern",
    tags: ["DFS", "cycle"],
    linkedFlashcardTags: ["dfs"],
    prompt: "Detectar ciclo em um grafo direcionado.",
    options: [
      "DFS com três estados: não visitado, em processamento, finalizado",
      "BFS e verificar se revisita algum nó",
      "Union-Find verificando se dois nós já estão conectados",
      "Ordenar nós por grau de entrada",
    ],
    correctAnswer: "DFS com três estados: não visitado, em processamento, finalizado",
    explanation:
      "Estado 'em processamento' (cinza/na call stack): se alcançamos um nó neste estado, encontramos um ciclo (back edge). Estado 'finalizado' (preto): já completamente processado, não indica ciclo. Nó não visitado (branco). Alternativa: Kahn's (BFS topological sort) — se nem todos os nós aparecem, há ciclo.",
  },

  {
    id: "q-dfs-004",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "big_o",
    tags: ["DFS", "clone-graph"],
    linkedFlashcardTags: ["dfs"],
    prompt: "Qual é a complexidade de tempo desta clonagem de grafo?",
    code: "function clonar(no, visitados = new Map()) {\n  if (!no) return null;\n  if (visitados.has(no)) return visitados.get(no);\n  const clone = new No(no.val);\n  visitados.set(no, clone);\n  for (const vizinho of no.vizinhos)\n    clone.vizinhos.push(clonar(vizinho, visitados));\n  return clone;\n}",
    options: [
      "O(V + E) — cada nó e aresta são processados uma vez",
      "O(V²) — para cada nó visita todos os vizinhos de todos",
      "O(V × E) — produto de vértices e arestas",
      "O(V log V)",
    ],
    correctAnswer: "O(V + E) — cada nó e aresta são processados uma vez",
    explanation:
      "O Map de visitados garante que cada nó é clonado uma vez: O(V). Para cada nó, percorremos seus vizinhos: total = E. Total: O(V + E).",
  },

  {
    id: "q-dfs-005",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "medium",
    type: "interview",
    tags: ["DFS", "stack-overflow"],
    linkedFlashcardTags: ["dfs"],
    prompt:
      "Como você converteria uma DFS recursiva para iterativa em JavaScript para evitar stack overflow em grafos/árvores profundas?",
    idealAnswer:
      "Usar pilha explícita (array) ao invés da call stack. Inicializar com o nó raiz. Loop: pop um nó, processá-lo, push dos filhos (em ordem reversa se precisar manter a ordem DFS original). Para DFS pós-ordem (ex: topological sort), usar duas pilhas ou pilha com flag de estado. Vantagem: heap memory é limitada pela RAM, não pelo stack size (tipicamente ~10k frames em V8). Para grafos com ciclos: manter Set de visitados como antes. Trade-off: código mais verboso que recursão.",
    keyPoints: [
      "Pilha explícita substitui call stack",
      "Push filhos em ordem reversa para manter ordem DFS",
      "Pós-ordem: pilha com estado ou duas pilhas",
      "Heap memory vs stack memory",
    ],
    explanation: "Stack overflow por recursão profunda é um problema real em entrevistas práticas.",
  },

  {
    id: "q-dfs-006",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "hard",
    type: "pattern",
    tags: ["DFS", "all-paths"],
    linkedFlashcardTags: ["dfs"],
    prompt: "Encontrar todos os caminhos da origem (0) ao destino (n-1) em um DAG.",
    options: [
      "DFS com backtracking — explorar todos os caminhos e reverter ao retornar",
      "BFS — encontrar apenas o menor caminho",
      "Programação dinâmica — contar caminhos sem listá-los",
      "Union-Find — verificar conectividade",
    ],
    correctAnswer: "DFS com backtracking — explorar todos os caminhos e reverter ao retornar",
    explanation:
      "Para gerar TODOS os caminhos, DFS com backtracking é natural: adicionar nó ao caminho atual, explorar vizinhos, remover ao retornar. BFS encontra um caminho, não todos. DP conta caminhos sem armazená-los. O(2^V × V) no pior caso — exponencial porque pode haver exponencialmente muitos caminhos.",
  },

  {
    id: "q-dfs-007",
    topic: "DFS",
    group: "algorithms",
    week: 3,
    difficulty: "hard",
    type: "open",
    tags: ["DFS", "topological-sort"],
    linkedFlashcardTags: ["dfs"],
    prompt:
      "O que é Topological Sort? Como você o implementaria com DFS e qual é sua aplicação prática?",
    idealAnswer:
      "Topological Sort: ordenação linear dos nós de um DAG tal que para toda aresta u→v, u aparece antes de v. Só possível em grafos acíclicos dirigidos. Implementação DFS: fazer DFS em todos os nós não visitados; ao finalizar um nó (pós-ordem), adicionar ao início da lista resultado. Alternativa: Kahn's algorithm com BFS e grau de entrada. Aplicações: order de tarefas com dependências (build systems, makefile), resolução de dependências de pacotes npm, course scheduling. Complexidade: O(V + E).",
    keyPoints: [
      "DAG obrigatório — grafo com ciclo não tem topological sort",
      "DFS pós-ordem → inverter ao final",
      "Kahn's: BFS com grau de entrada",
      "O(V + E)",
    ],
    explanation: "Topological sort é fundamental para problemas de dependências e scheduling.",
  },

  // ── BACKTRACKING ─────────────────────────────────────────────────────────────

  {
    id: "q-backtracking-001",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Backtracking"],
    linkedFlashcardTags: ["backtracking"],
    prompt: "O que é backtracking?",
    options: [
      "Explorar sistematicamente todas as possibilidades, desfazendo escolhas (revertendo estado) quando levam a dead-ends",
      "Algoritmo de busca que garante encontrar a solução ótima global sempre",
      "Variante de programação dinâmica que evita recomputar subproblemas",
      "Busca em grafo que sempre encontra o menor caminho",
    ],
    correctAnswer:
      "Explorar sistematicamente todas as possibilidades, desfazendo escolhas (revertendo estado) quando levam a dead-ends",
    explanation:
      "Backtracking = DFS + reversão de estado. Tenta uma escolha, explora recursivamente, reverte se não funcionar. Diferente de DP: backtracking não memoiza (gera todas as soluções). Diferente de Greedy: não é irrevogável.",
  },

  {
    id: "q-backtracking-002",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "easy",
    type: "pattern",
    tags: ["Backtracking", "subsets"],
    linkedFlashcardTags: ["backtracking"],
    prompt: "Gerar todos os subsets (subconjuntos) de um array de inteiros distintos.",
    options: [
      "Backtracking — para cada elemento, decidir incluir ou não",
      "BFS camada por camada adicionando elementos",
      "Janela deslizante de todos os tamanhos",
      "Busca binária no espaço de soluções",
    ],
    correctAnswer: "Backtracking — para cada elemento, decidir incluir ou não",
    explanation:
      "Para n elementos, há 2^n subsets. Backtracking: a cada nível, decisão binária (incluir ou não o elemento atual). Complexidade: O(2^n × n) — 2^n subsets, cada um de tamanho até n para copiar.",
  },

  {
    id: "q-backtracking-003",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "big_o",
    tags: ["Backtracking", "permutações"],
    linkedFlashcardTags: ["backtracking"],
    prompt:
      "Qual é a complexidade de tempo para gerar todas as permutações de um array de n elementos?",
    code: "function permutacoes(nums) {\n  const res = [];\n  function bt(atual, restantes) {\n    if (!restantes.length) { res.push([...atual]); return; }\n    for (let i = 0; i < restantes.length; i++) {\n      atual.push(restantes[i]);\n      bt(atual, [...restantes.slice(0,i), ...restantes.slice(i+1)]);\n      atual.pop();\n    }\n  }\n  bt([], nums);\n  return res;\n}",
    options: [
      "O(n × n!) — n! permutações, cada uma de tamanho n para copiar",
      "O(2^n) — decisão binária por elemento",
      "O(n²) — dois loops aninhados",
      "O(n log n) — similar a ordenação",
    ],
    correctAnswer: "O(n × n!) — n! permutações, cada uma de tamanho n para copiar",
    explanation:
      "Número de permutações de n elementos: n! (fatorial). Para cada permutação, copiamos o array de tamanho n: n × n!. Geração em si: O(n!). A cópia é O(n) por permutação. Total: O(n × n!).",
  },

  {
    id: "q-backtracking-004",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Backtracking", "pruning"],
    linkedFlashcardTags: ["backtracking"],
    prompt: "O que é 'pruning' (poda) em backtracking e qual seu impacto?",
    options: [
      "Detectar e abandonar ramos que certamente não levam a uma solução válida, reduzindo drasticamente o espaço de busca",
      "Ordenar os candidatos para melhorar a saída final",
      "Memoizar subproblemas para evitar recomputação",
      "Converter backtracking em programação dinâmica",
    ],
    correctAnswer:
      "Detectar e abandonar ramos que certamente não levam a uma solução válida, reduzindo drasticamente o espaço de busca",
    explanation:
      "Exemplo: em N-Queens, se colocar a rainha na coluna c viola uma restrição, não continuar naquele ramo. Pode reduzir de O(n^n) para muito menos na prática, mas o pior caso permanece exponencial.",
  },

  {
    id: "q-backtracking-005",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "hard",
    type: "pattern",
    tags: ["Backtracking", "combination-sum"],
    linkedFlashcardTags: ["backtracking"],
    prompt:
      "Encontrar todas as combinações de números de um array (sem repetições) que somam um target.",
    options: [
      "Backtracking com poda quando soma excede target e índice avança para evitar duplicatas",
      "Programação dinâmica bottom-up",
      "Dois ponteiros no array ordenado",
      "BFS com soma acumulada",
    ],
    correctAnswer:
      "Backtracking com poda quando soma excede target e índice avança para evitar duplicatas",
    explanation:
      "Backtracking: escolher um número, somar, avançar o índice (para evitar duplicatas). Poda: se soma > target, retornar imediatamente (números positivos). Ordenar o array otimiza a poda. Problema: Combination Sum II.",
  },

  {
    id: "q-backtracking-006",
    topic: "Backtracking",
    group: "algorithms",
    week: 4,
    difficulty: "hard",
    type: "interview",
    tags: ["Backtracking", "vs-dp"],
    linkedFlashcardTags: ["backtracking"],
    prompt: "Como você decide entre backtracking e programação dinâmica para resolver um problema?",
    idealAnswer:
      "Backtracking: quando precisa de TODAS as soluções ou quando a solução não tem subestrutura ótima (os subproblemas não se sobrepõem de forma reutilizável). Sinais: 'liste todas as...', 'gere todos os...', 'encontre alguma configuração'. Exemplos: permutações, N-Queens, Word Search. Programação Dinâmica: quando pede a solução ÓTIMA e há subproblemas sobrepostos. Sinais: 'mínimo de...', 'máximo de...', 'número de formas de...'. Exemplos: Coin Change, Knapsack, LCS. Pergunta chave: se eu souber a solução ótima para subproblemas, consigo construir a solução do problema maior? Se sim, DP. Se preciso enumerar, backtracking.",
    keyPoints: [
      "Backtracking: todas as soluções, sem subestrutura ótima",
      "DP: solução ótima com subproblemas sobrepostos",
      "Sinal backtracking: 'liste todas', 'gere todos'",
      "Sinal DP: 'mínimo', 'máximo', 'número de formas'",
    ],
    explanation:
      "Distinguir backtracking de DP é uma das habilidades mais valorizadas em entrevistas.",
  },

  // ── DYNAMIC PROGRAMMING ──────────────────────────────────────────────────────

  {
    id: "q-dp-001",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Dynamic Programming", "condições"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Quais são as duas propriedades necessárias para aplicar Programação Dinâmica?",
    options: [
      "Subestrutura ótima e subproblemas sobrepostos",
      "Grafo acíclico e vértices numerados",
      "Array ordenado e sem duplicatas",
      "Monotonicidade e divisibilidade dos estados",
    ],
    correctAnswer: "Subestrutura ótima e subproblemas sobrepostos",
    explanation:
      "Subestrutura ótima: a solução ótima do problema contém soluções ótimas dos subproblemas. Subproblemas sobrepostos: os mesmos subproblemas são calculados várias vezes na recursão ingênua — por isso memoização ou tabulação economiza tempo.",
  },

  {
    id: "q-dp-002",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "easy",
    type: "big_o",
    tags: ["Dynamic Programming", "fibonacci"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Qual é a complexidade de tempo e espaço desta solução de Fibonacci com tabulação?",
    code: "function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}",
    options: [
      "O(n) tempo, O(1) espaço — otimizado com dois vars",
      "O(n) tempo, O(n) espaço — array completo",
      "O(2^n) tempo, O(n) espaço — recursão sem memoização",
      "O(n log n) tempo, O(1) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço — otimizado com dois vars",
    explanation:
      "Loop de n iterações: O(n). Apenas dois escalares (a, b) ao invés do array dp[0..n]: O(1) espaço. A versão com array dp seria O(n) espaço. Otimização de espaço possível quando dp[i] depende apenas de dp[i-1] e dp[i-2].",
  },

  {
    id: "q-dp-003",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "easy",
    type: "pattern",
    tags: ["Dynamic Programming", "climbing-stairs"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "De quantas formas distintas você pode subir n degraus, podendo subir 1 ou 2 por vez?",
    options: [
      "Programação dinâmica — dp[i] = dp[i-1] + dp[i-2]",
      "Backtracking para listar todos os caminhos",
      "Busca binária no número de combinações",
      "BFS camada por camada",
    ],
    correctAnswer: "Programação dinâmica — dp[i] = dp[i-1] + dp[i-2]",
    explanation:
      "Para chegar ao degrau i, podemos vir do i-1 (com 1 passo) ou do i-2 (com 2 passos). dp[i] = dp[i-1] + dp[i-2] — é a sequência de Fibonacci. dp[1]=1, dp[2]=2. O(n) tempo, O(1) espaço com dois vars.",
  },

  {
    id: "q-dp-004",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "big_o",
    tags: ["Dynamic Programming", "coin-change"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Qual é a complexidade de tempo desta solução para Coin Change?",
    code: "function trocos(moedas, quantia) {\n  const dp = new Array(quantia + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= quantia; i++)\n    for (const moeda of moedas)\n      if (moeda <= i) dp[i] = Math.min(dp[i], dp[i - moeda] + 1);\n  return dp[quantia] === Infinity ? -1 : dp[quantia];\n}",
    options: [
      "O(quantia × moedas.length)",
      "O(quantia²)",
      "O(moedas.length)",
      "O(quantia × log(moedas.length))",
    ],
    correctAnswer: "O(quantia × moedas.length)",
    explanation:
      "Dois loops aninhados: outer de 1 a quantia, inner sobre todas as moedas. Total: quantia × moedas.length. Espaço: O(quantia) para o array dp.",
  },

  {
    id: "q-dp-005",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Dynamic Programming", "memoização-vs-tabulação"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Qual é a principal vantagem de memoização (top-down) sobre tabulação (bottom-up)?",
    options: [
      "Calcula apenas os subproblemas necessários — útil quando o espaço de estados é grande mas poucos são visitados",
      "Sempre usa menos memória que a tabulação",
      "Elimina a necessidade de definir ordem de cálculo",
      "É sempre mais rápido por evitar o overhead de recursão",
    ],
    correctAnswer:
      "Calcula apenas os subproblemas necessários — útil quando o espaço de estados é grande mas poucos são visitados",
    explanation:
      "Tabulação preenche todos os dp[i][j], mesmo os não acessíveis. Memoização calcula apenas on-demand. Exemplo: Edit Distance entre strings curtas em espaço n×m — memoização só visita os estados realmente usados. Trade-off: memoização tem overhead de recursão e risco de stack overflow.",
  },

  {
    id: "q-dp-006",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "big_o",
    tags: ["Dynamic Programming", "LCS"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt:
      "Qual é a complexidade de tempo e espaço desta solução para Longest Common Subsequence?",
    code: "function lcs(a, b) {\n  const dp = Array.from({length: a.length+1}, () => new Array(b.length+1).fill(0));\n  for (let i = 1; i <= a.length; i++)\n    for (let j = 1; j <= b.length; j++)\n      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);\n  return dp[a.length][b.length];\n}",
    options: [
      "O(n × m) tempo, O(n × m) espaço",
      "O(n + m) tempo, O(n + m) espaço",
      "O(n² × m²) tempo, O(n × m) espaço",
      "O(n × m) tempo, O(n) espaço",
    ],
    correctAnswer: "O(n × m) tempo, O(n × m) espaço",
    explanation:
      "Preencher matriz (n+1) × (m+1): O(n×m). Espaço: O(n×m) para a matriz. Otimização de espaço possível: dp[i][j] depende apenas da linha i-1, então podemos usar O(m) com dois arrays ou O(m) com one-row update.",
  },

  {
    id: "q-dp-007",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "medium",
    type: "interview",
    tags: ["Dynamic Programming", "estado"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Como você define o estado em um problema de Programação Dinâmica? Qual é o processo?",
    idealAnswer:
      "Passo 1: Identificar quais variáveis mudam de um subproblema para outro. Passo 2: O estado encapsula TODA informação necessária para resolver o subproblema de forma independente — sem precisar de contexto externo. Passo 3: Definir o caso base. Passo 4: Escrever a transição: como dp[i] (ou dp[i][j]) se relaciona com estados menores. Exemplos: Knapsack — estado (índice, capacidade_restante); Edit Distance — estado (i-ésimo char de s, j-ésimo de t); House Robber — estado (índice). Definição clara do estado é metade da solução.",
    keyPoints: [
      "Variáveis que mudam = dimensões do estado",
      "Estado encapsula toda informação necessária",
      "Caso base: menor subproblema trivial",
      "Transição: relação com subproblemas menores",
    ],
    explanation: "Saber definir estados é a habilidade fundamental de DP em entrevistas.",
  },

  {
    id: "q-dp-008",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "hard",
    type: "big_o",
    tags: ["Dynamic Programming", "edit-distance"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt: "Qual é a complexidade de tempo desta solução para Edit Distance?",
    code: "function editDistance(w1, w2) {\n  const m = w1.length, n = w2.length;\n  const dp = Array.from({length: m+1}, (_, i) =>\n    Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));\n  for (let i = 1; i <= m; i++)\n    for (let j = 1; j <= n; j++)\n      dp[i][j] = w1[i-1]===w2[j-1] ? dp[i-1][j-1]\n        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  return dp[m][n];\n}",
    options: [
      "O(m × n) tempo, O(m × n) espaço",
      "O(m + n) tempo, O(m + n) espaço",
      "O(m × n) tempo, O(n) espaço com otimização",
      "O((m × n)²) tempo",
    ],
    correctAnswer: "O(m × n) tempo, O(m × n) espaço",
    explanation:
      "Preencher matriz (m+1) × (n+1): O(m×n). Cada célula: O(1). Espaço: O(m×n). Como dp[i][j] depende de dp[i-1][j], dp[i][j-1], dp[i-1][j-1], é possível otimizar para O(n) espaço com uma linha e variável diagonal.",
  },

  {
    id: "q-dp-009",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "hard",
    type: "pattern",
    tags: ["Dynamic Programming", "knapsack"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt:
      "Dado n itens com peso e valor, e uma mochila de capacidade W, maximizar o valor sem exceder o peso (0/1 Knapsack).",
    options: [
      "Programação dinâmica 2D: dp[i][c] = maior valor com i itens e capacidade c",
      "Greedy: pegar itens com maior valor/peso — não ótimo para 0/1 Knapsack",
      "Backtracking sem poda: testar todos os 2^n subsets",
      "BFS sobre os itens e capacidades",
    ],
    correctAnswer: "Programação dinâmica 2D: dp[i][c] = maior valor com i itens e capacidade c",
    explanation:
      "Greedy por densidade (valor/peso) é ótimo para Knapsack fracionário, não 0/1. Para 0/1, backtracking é correto mas O(2^n). DP: dp[i][c] = max(dp[i-1][c], valor[i] + dp[i-1][c-peso[i]]). O(n×W) tempo e espaço (reduzível a O(W) com uma linha).",
  },

  {
    id: "q-dp-010",
    topic: "Dynamic Programming",
    group: "algorithms",
    week: 4,
    difficulty: "hard",
    type: "open",
    tags: ["Dynamic Programming", "espaço"],
    linkedFlashcardTags: ["dynamic-programming"],
    prompt:
      "Como você reduziria o espaço de O(n×m) para O(min(n,m)) em DP de duas sequências como LCS ou Edit Distance?",
    idealAnswer:
      "Observar que dp[i][j] depende apenas de dp[i-1][j], dp[i][j-1] e dp[i-1][j-1] — apenas a linha anterior. Usar dois arrays 1D: prev (linha i-1) e curr (linha i). Para cada nova linha, calcular curr a partir de prev, depois trocar. Para a diagonal dp[i-1][j-1]: salvar antes de atualizar curr[j] em uma variável 'diag'. Usar a menor dimensão como j (inner loop) para minimizar o espaço. Exemplo: LCS entre string de 1000 e 10 chars — usar O(10) de espaço.",
    keyPoints: [
      "dp[i][j] depende apenas da linha anterior",
      "Dois arrays: prev e curr",
      "Salvar diagonal antes de atualizar",
      "Usar menor dimensão como inner loop",
    ],
    explanation:
      "Otimização de espaço em DP é uma questão de follow-up frequente em entrevistas senior.",
  },
];
