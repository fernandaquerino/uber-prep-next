// Part 1: Big O (12), Arrays (10), HashMap (9), Set (7), Stack (9)
export const PART1 = [
  // ── BIG O ────────────────────────────────────────────────────────────────────

  {
    id: "q-big-o-001",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["Big O", "loops", "complexidade"],
    linkedFlashcardTags: ["big-o"],
    prompt: "Qual é a complexidade de tempo da função soma()?",
    code: "function soma(usuarios, viagens) {\n  let total = 0;\n  for (const u of usuarios) total += u.score;\n  for (const v of viagens) total += v.distancia;\n  return total;\n}",
    options: ["O(n + m)", "O(n × m)", "O(n²)", "O(2n)"],
    correctAnswer: "O(n + m)",
    explanation:
      "Dois loops sequenciais sobre arrays independentes somam os custos. n = usuarios.length, m = viagens.length. Não simplifique para O(n) quando os tamanhos são distintos.",
  },

  {
    id: "q-big-o-002",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["Big O", "nested loops"],
    linkedFlashcardTags: ["big-o"],
    prompt: "Qual é a complexidade de tempo da função temPar()?",
    code: "function temPar(nums) {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = i + 1; j < nums.length; j++)\n      if (nums[i] + nums[j] === 0) return true;\n  return false;\n}",
    options: ["O(n²)", "O(n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(n²)",
    explanation:
      "Loop aninhado onde para cada i percorremos todos os j > i. Número de pares = n*(n-1)/2, que é O(n²).",
  },

  {
    id: "q-big-o-003",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["Big O", "binary search"],
    linkedFlashcardTags: ["big-o"],
    prompt: "Qual é a complexidade de tempo da função buscar()?",
    code: "function buscar(nums, alvo) {\n  let esq = 0, dir = nums.length - 1;\n  while (esq <= dir) {\n    const meio = Math.floor((esq + dir) / 2);\n    if (nums[meio] === alvo) return meio;\n    if (nums[meio] < alvo) esq = meio + 1;\n    else dir = meio - 1;\n  }\n  return -1;\n}",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(log n)",
    explanation:
      "A cada iteração o espaço de busca é dividido pela metade. Com n elementos, são necessárias no máximo log₂(n) iterações.",
  },

  {
    id: "q-big-o-004",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Big O", "HashMap", "two-sum"],
    linkedFlashcardTags: ["big-o", "hashmap"],
    prompt: "Qual é a complexidade de tempo desta solução?",
    code: "function doisSoma(nums, alvo) {\n  const vistos = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complemento = alvo - nums[i];\n    if (vistos.has(complemento)) return [vistos.get(complemento), i];\n    vistos.set(nums[i], i);\n  }\n}",
    options: ["O(n)", "O(n²)", "O(n log n)", "O(1)"],
    correctAnswer: "O(n)",
    explanation:
      "Loop único de n iterações. Cada Map.has() e Map.get() é O(1) amortizado. A solução de força bruta com dois loops seria O(n²).",
  },

  {
    id: "q-big-o-005",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Big O", "sort", "anagramas"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "Qual é a complexidade de tempo desta função? (n = número de palavras, k = tamanho médio de cada palavra)",
    code: "function agruparAnagramas(palavras) {\n  const grupos = new Map();\n  for (const p of palavras) {\n    const chave = p.split('').sort().join('');\n    if (!grupos.has(chave)) grupos.set(chave, []);\n    grupos.get(chave).push(p);\n  }\n  return [...grupos.values()];\n}",
    options: ["O(n × k log k)", "O(n log n)", "O(n × k)", "O(k log k)"],
    correctAnswer: "O(n × k log k)",
    explanation:
      "Para cada uma das n palavras, ordenamos k caracteres em O(k log k). O custo total é n × k log k. Não simplifica para O(n log n) porque k é independente de n.",
  },

  {
    id: "q-big-o-006",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Big O", "recursion", "memoization"],
    linkedFlashcardTags: ["big-o"],
    prompt: "Qual é a complexidade de tempo desta implementação com memoização?",
    code: "const memo = {};\nfunction fib(n) {\n  if (n <= 1) return n;\n  if (memo[n] !== undefined) return memo[n];\n  return memo[n] = fib(n - 1) + fib(n - 2);\n}",
    options: ["O(n)", "O(2ⁿ)", "O(n²)", "O(n log n)"],
    correctAnswer: "O(n)",
    explanation:
      "Sem memoização seria O(2ⁿ). Com memo, cada fib(k) é calculado exatamente uma vez. Total de chamadas únicas: n, então O(n).",
  },

  {
    id: "q-big-o-007",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Big O", "amortized"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "Por que o método push() de arrays em JavaScript tem complexidade O(1) amortizado e não O(1) garantido?",
    options: [
      "Arrays dinâmicos ocasionalmente precisam realocar e copiar todos os elementos, mas esse custo é diluído ao longo de muitas inserções",
      "O JavaScript precisa verificar se há memória disponível antes de cada push",
      "push() é O(n) porque atualiza o índice de todos os elementos",
      "A complexidade depende do tipo dos elementos armazenados",
    ],
    correctAnswer:
      "Arrays dinâmicos ocasionalmente precisam realocar e copiar todos os elementos, mas esse custo é diluído ao longo de muitas inserções",
    explanation:
      "Quando a capacidade interna esgota, o array dobra de tamanho e copia todos os elementos (O(n)). Porém isso acontece raramente — apenas em potências de 2. O custo médio por operação é O(1).",
  },

  {
    id: "q-big-o-008",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Big O", "space complexity"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "Qual é a complexidade de ESPAÇO de uma DFS recursiva em uma árvore binária com altura h?",
    options: [
      "O(h) — cada chamada na call stack usa espaço proporcional à profundidade",
      "O(n) — armazena todos os nós",
      "O(1) — DFS não usa estruturas auxiliares",
      "O(n²) — por causa da recursão dupla",
    ],
    correctAnswer: "O(h) — cada chamada na call stack usa espaço proporcional à profundidade",
    explanation:
      "A call stack mantém h frames ativos simultaneamente. Em árvore balanceada h = O(log n). Em degenerada h = O(n). A complexidade de espaço da DFS é O(h), não O(n) em geral.",
  },

  {
    id: "q-big-o-009",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "hard",
    type: "big_o",
    tags: ["Big O", "heap", "top-k"],
    linkedFlashcardTags: ["big-o", "heap"],
    prompt: "Qual é a complexidade de tempo desta solução com MinHeap de tamanho k?",
    code: "function topKFrequentes(nums, k) {\n  const freq = new Map();\n  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n  // MinHeap de tamanho k\n  const heap = new MinHeap();\n  for (const [val, count] of freq) {\n    heap.push([count, val]);\n    if (heap.size() > k) heap.pop();\n  }\n  return heap.toArray().map(([, v]) => v);\n}",
    options: ["O(n log k)", "O(n log n)", "O(n + k)", "O(k log n)"],
    correctAnswer: "O(n log k)",
    explanation:
      "Contar frequências: O(n). Para cada um dos n elementos únicos, push e possivelmente pop no heap de tamanho k: O(log k) por operação. Total: O(n log k). Mais eficiente que sort O(n log n) quando k << n.",
  },

  {
    id: "q-big-o-010",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "hard",
    type: "pattern",
    tags: ["Big O", "pattern recognition"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "Você precisa encontrar o k-ésimo maior elemento em um array de n inteiros. O entrevistador quer solução melhor que O(n log n). Qual abordagem investigar primeiro?",
    options: [
      "Fila de prioridade (MinHeap de tamanho k)",
      "Dois ponteiros",
      "Programação dinâmica",
      "BFS",
    ],
    correctAnswer: "Fila de prioridade (MinHeap de tamanho k)",
    explanation:
      "MinHeap de tamanho k: percorrer array uma vez, manter apenas os k maiores. Custo: O(n log k). Alternativa: QuickSelect tem O(n) médio mas O(n²) pior caso. Heap é mais previsível.",
  },

  {
    id: "q-big-o-011",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "hard",
    type: "interview",
    tags: ["Big O", "entrevista"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "Durante uma entrevista, você propõe ordenar o array para simplificar a solução. O entrevistador pergunta: 'Isso afeta a complexidade geral?' Como você responde?",
    idealAnswer:
      "Sim. sort() em JavaScript usa Timsort: O(n log n) de tempo e O(log n) de espaço. Se o resto da solução for O(n), o sort vira o gargalo e a solução total é O(n log n). Se o problema tiver restrição de O(n), preciso considerar outra abordagem — por exemplo HashMap. Se O(n log n) for aceitável, o sort é uma troca válida por simplicidade de código.",
    keyPoints: [
      "Identificar o gargalo",
      "Mencionar O(n log n) do sort",
      "Comparar com alternativa HashMap O(n)",
      "Verificar a restrição do problema",
    ],
    explanation:
      "Boa resposta mostra consciência das implicações de performance de operações comuns.",
  },

  {
    id: "q-big-o-012",
    topic: "Big O",
    group: "algorithms",
    week: 1,
    difficulty: "hard",
    type: "open",
    tags: ["Big O", "trade-offs"],
    linkedFlashcardTags: ["big-o"],
    prompt:
      "O que significa dizer que uma solução tem complexidade O(n) de tempo e O(n) de espaço? Como você apresentaria esse trade-off em uma entrevista?",
    idealAnswer:
      "O(n) de tempo significa que o número de operações cresce linearmente com o tamanho do input. O(n) de espaço significa que a memória extra usada também cresce linearmente (exemplo: criar um HashMap auxiliar). O trade-off: gastamos memória para ganhar velocidade — a solução bruta sem espaço extra costuma ser O(n²). Em entrevista, sempre mencionar ambas as complexidades e perguntar se há restrição de memória antes de assumir que espaço extra é aceitável.",
    keyPoints: [
      "Definir ambas as complexidades",
      "Conectar com o trade-off real",
      "Mencionar a alternativa mais lenta sem espaço extra",
      "Perguntar sobre restrições do problema",
    ],
    explanation:
      "Demonstrar que complexidade de espaço importa tanto quanto de tempo é sinal de maturidade técnica.",
  },

  // ── ARRAYS ──────────────────────────────────────────────────────────────────

  {
    id: "q-arrays-001",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["Arrays", "prefix-sum"],
    linkedFlashcardTags: ["array", "big-o"],
    prompt: "Qual a complexidade de tempo e espaço desta solução?",
    code: "function produtoExcetoProprio(nums) {\n  const res = new Array(nums.length).fill(1);\n  let prefixo = 1;\n  for (let i = 0; i < nums.length; i++) {\n    res[i] = prefixo;\n    prefixo *= nums[i];\n  }\n  let sufixo = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    res[i] *= sufixo;\n    sufixo *= nums[i];\n  }\n  return res;\n}",
    options: [
      "O(n) tempo, O(1) espaço extra (sem contar o output)",
      "O(n²) tempo, O(n) espaço",
      "O(n) tempo, O(n) espaço",
      "O(n log n) tempo, O(1) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço extra (sem contar o output)",
    explanation:
      "Dois passes lineares = O(n). O array `res` é o output exigido, não conta como espaço auxiliar. Prefixo e sufixo são variáveis escalares: O(1) extra.",
  },

  {
    id: "q-arrays-002",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Arrays", "operações"],
    linkedFlashcardTags: ["array"],
    prompt: "Qual operação em um array JavaScript tem o maior custo de tempo no pior caso?",
    options: [
      "unshift() — inserir no início",
      "push() — inserir no final",
      "nums[i] — acesso por índice",
      "nums.length — ler o tamanho",
    ],
    correctAnswer: "unshift() — inserir no início",
    explanation:
      "unshift() precisa deslocar todos os n elementos uma posição para abrir espaço: O(n). push() é O(1) amortizado. Acesso por índice e leitura de .length são O(1).",
  },

  {
    id: "q-arrays-003",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "pattern",
    tags: ["Arrays", "contains-duplicate"],
    linkedFlashcardTags: ["array", "set"],
    prompt:
      "Dado um array de inteiros, determine se contém algum valor duplicado. O array pode ter até 10⁵ elementos. Qual é a solução mais eficiente?",
    options: [
      "Set — verificação de presença em O(1) por elemento",
      "Dois loops aninhados — compara todos os pares",
      "Ordenar + comparar vizinhos adjacentes",
      "Busca binária para cada elemento",
    ],
    correctAnswer: "Set — verificação de presença em O(1) por elemento",
    explanation:
      "Set.has() é O(1) amortizado. Uma passada inserindo e verificando presença: O(n) total. Ordenar + verificar adjacentes funciona mas é O(n log n). Dois loops: O(n²).",
  },

  {
    id: "q-arrays-004",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Arrays", "kadane"],
    linkedFlashcardTags: ["array", "big-o"],
    prompt: "Qual é a complexidade de tempo e espaço da função maxSubarray()?",
    code: "function maxSubarray(nums) {\n  let melhor = nums[0], atual = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    atual = Math.max(nums[i], atual + nums[i]);\n    melhor = Math.max(melhor, atual);\n  }\n  return melhor;\n}",
    options: [
      "O(n) tempo, O(1) espaço",
      "O(n²) tempo, O(1) espaço",
      "O(n) tempo, O(n) espaço",
      "O(n log n) tempo, O(log n) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço",
    explanation:
      "Algoritmo de Kadane: uma única passada linear. Duas variáveis escalares — sem estrutura auxiliar de tamanho variável. Solução ótima para Maximum Subarray.",
  },

  {
    id: "q-arrays-005",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Arrays", "prefix-sum"],
    linkedFlashcardTags: ["array"],
    prompt:
      "Por que pré-computar um array de prefix sums é útil para consultas de soma de subarray?",
    options: [
      "Reduz cada consulta de O(n) para O(1) após O(n) de pré-processamento",
      "Elimina a necessidade de percorrer o array mesmo na construção",
      "Funciona apenas em arrays ordenados",
      "Melhora a complexidade de espaço de O(n) para O(1)",
    ],
    correctAnswer: "Reduz cada consulta de O(n) para O(1) após O(n) de pré-processamento",
    explanation:
      "Com prefix[i] = soma de nums[0..i-1], a soma de nums[l..r] = prefix[r+1] - prefix[l]. Uma consulta que custava O(n) passa a custar O(1). Custo único de O(n) na construção.",
  },

  {
    id: "q-arrays-006",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "pattern",
    tags: ["Arrays", "subarray", "negativos"],
    linkedFlashcardTags: ["array"],
    prompt:
      "Dado um array que pode conter números negativos, encontre a subarray contígua com a maior soma.",
    options: [
      "Programação dinâmica (Kadane's algorithm)",
      "Janela deslizante com dois ponteiros",
      "Dividir e conquistar O(n log n)",
      "Ordenar e pegar os maiores elementos",
    ],
    correctAnswer: "Programação dinâmica (Kadane's algorithm)",
    explanation:
      "Janela deslizante não funciona com negativos: encolher a janela pode aumentar a soma. Kadane mantém a melhor soma terminando na posição i, usando a relação: dp[i] = max(nums[i], dp[i-1] + nums[i]).",
  },

  {
    id: "q-arrays-007",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "interview",
    tags: ["Arrays", "in-place"],
    linkedFlashcardTags: ["array"],
    prompt:
      "Como você removeria duplicatas de um array ordenado in-place, sem criar um novo array, retornando o número de elementos únicos?",
    idealAnswer:
      "Usar dois ponteiros: `write` (onde escrever o próximo único) e `read` (percorre todo o array). Comparar nums[read] com nums[write - 1]: se diferente, escrever nums[write++] = nums[read]. No final, write é a quantidade de elementos únicos. O(n) tempo, O(1) espaço.",
    keyPoints: [
      "Dois ponteiros write e read",
      "Comparar com o último único escrito",
      "Modificar in-place",
      "O(n) tempo, O(1) espaço",
    ],
    explanation: "Padrão clássico de dois ponteiros para manipulação in-place em arrays ordenados.",
  },

  {
    id: "q-arrays-008",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "big_o",
    tags: ["Arrays", "two-pointers", "trapping-rain"],
    linkedFlashcardTags: ["array", "two-pointers"],
    prompt: "Qual é a complexidade de tempo e espaço da função aguaCaptada()?",
    code: "function aguaCaptada(altura) {\n  let esq = 0, dir = altura.length - 1;\n  let maxE = 0, maxD = 0, agua = 0;\n  while (esq < dir) {\n    if (altura[esq] < altura[dir]) {\n      altura[esq] >= maxE ? (maxE = altura[esq]) : (agua += maxE - altura[esq]);\n      esq++;\n    } else {\n      altura[dir] >= maxD ? (maxD = altura[dir]) : (agua += maxD - altura[dir]);\n      dir--;\n    }\n  }\n  return agua;\n}",
    options: [
      "O(n) tempo, O(1) espaço",
      "O(n) tempo, O(n) espaço",
      "O(n²) tempo, O(1) espaço",
      "O(n log n) tempo, O(n) espaço",
    ],
    correctAnswer: "O(n) tempo, O(1) espaço",
    explanation:
      "Dois ponteiros que se encontram no meio: cada elemento é visitado no máximo uma vez. Apenas 4 variáveis escalares — sem arrays auxiliares. Solução ótima para Trapping Rain Water.",
  },

  {
    id: "q-arrays-009",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "pattern",
    tags: ["Arrays", "merge-intervals"],
    linkedFlashcardTags: ["array"],
    prompt:
      "Dado uma lista de intervalos [início, fim], mescle todos os que se sobrepõem. Qual é a abordagem correta?",
    options: [
      "Ordenar por início + varredura linear para mesclar sobreposições",
      "Janela deslizante sobre os intervalos",
      "BFS tratando cada intervalo como nó",
      "Backtracking para testar todas as combinações",
    ],
    correctAnswer: "Ordenar por início + varredura linear para mesclar sobreposições",
    explanation:
      "Ordenar: O(n log n). Depois, um passe linear: se o atual começa antes do fim do último mesclado, estender; senão, adicionar novo intervalo. Total O(n log n). Janela deslizante não resolve porque os intervalos não têm propriedade de monotonicidade.",
  },

  {
    id: "q-arrays-010",
    topic: "Arrays",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "open",
    tags: ["Arrays", "monotonic-stack"],
    linkedFlashcardTags: ["array"],
    prompt: "O que é uma monotonic stack e quando ela é aplicável em problemas de array?",
    idealAnswer:
      "Uma pilha onde os elementos mantêm ordem monotônica (crescente ou decrescente). Útil para encontrar o próximo maior/menor elemento para cada posição em O(n). Cada elemento é empilhado e desempilhado no máximo uma vez, por isso o custo total é O(n), mesmo com o while interno. Exemplos: Daily Temperatures, Largest Rectangle in Histogram, Next Greater Element. A intuição: quando encontramos um elemento que quebra a monotonicidade, resolvemos todos os elementos que esperavam esse 'gatilho'.",
    keyPoints: [
      "Definição de monotônica",
      "Cada elemento entra e sai uma vez: O(n) amortizado",
      "Exemplos: próximo maior, histograma",
      "Lógica do while interno não torna O(n²)",
    ],
    explanation:
      "Monotonic stack é um padrão avançado que aparece em problemas de FAANG de nível médio/difícil.",
  },

  // ── HASHMAP ──────────────────────────────────────────────────────────────────

  {
    id: "q-hashmap-001",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["HashMap", "frequency"],
    linkedFlashcardTags: ["hashmap"],
    prompt: "Qual é a complexidade de tempo da função maisFrequente()?",
    code: "function maisFrequente(nums) {\n  const freq = new Map();\n  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n  let melhor = null, conta = 0;\n  for (const [val, c] of freq) {\n    if (c > conta) { melhor = val; conta = c; }\n  }\n  return melhor;\n}",
    options: ["O(n)", "O(n²)", "O(n log n)", "O(1)"],
    correctAnswer: "O(n)",
    explanation:
      "Dois passes lineares: um para contar frequências, um para encontrar o máximo. Cada Map.set/get é O(1) amortizado. Total: O(n).",
  },

  {
    id: "q-hashmap-002",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["HashMap", "map-vs-object"],
    linkedFlashcardTags: ["hashmap"],
    prompt: "Qual é a principal vantagem de usar Map sobre um objeto ({}) em JavaScript?",
    options: [
      "Map aceita qualquer tipo como chave (objetos, números, funções) e mantém ordem de inserção garantida",
      "Map é sempre mais rápido que objeto para qualquer operação",
      "Map tem sintaxe mais simples para criação e acesso",
      "Map consome menos memória que objetos para grandes volumes de dados",
    ],
    correctAnswer:
      "Map aceita qualquer tipo como chave (objetos, números, funções) e mantém ordem de inserção garantida",
    explanation:
      "Objetos convertem todas as chaves para string. Map preserva o tipo: números, objetos, Symbols são chaves válidas. Map também tem size, iteração built-in e melhor performance para inserções/remoções frequentes.",
  },

  {
    id: "q-hashmap-003",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["HashMap", "colisão"],
    linkedFlashcardTags: ["hashmap"],
    prompt:
      "Por que a complexidade de busca em HashMap é descrita como O(1) amortizado e não O(1) garantido?",
    options: [
      "Colisões fazem múltiplos elementos compartilharem a mesma bucket; no pior caso todas as chaves colidem, tornando busca O(n)",
      "JavaScript não implementa hash tables nativas — usa BST internamente",
      "A hash function sempre tem custo O(n) proporcional ao tamanho da chave",
      "HashMap tem limite de tamanho fixo e precisa de rehashing O(n²)",
    ],
    correctAnswer:
      "Colisões fazem múltiplos elementos compartilharem a mesma bucket; no pior caso todas as chaves colidem, tornando busca O(n)",
    explanation:
      "Com boa função hash, colisões são raras e a busca é O(1) em média. No pior caso patológico (todas as chaves na mesma bucket), vira O(n). Por isso dizemos amortizado. JavaScript usa hash tables reais internamente.",
  },

  {
    id: "q-hashmap-004",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "pattern",
    tags: ["HashMap", "LRU"],
    linkedFlashcardTags: ["hashmap", "linked-list"],
    prompt:
      "Você precisa implementar um LRU Cache com operações get e put em O(1). Qual combinação de estruturas de dados usar?",
    options: [
      "HashMap + Lista duplamente ligada",
      "HashMap + Array ordenado",
      "Árvore BST + HashMap",
      "MinHeap + HashMap",
    ],
    correctAnswer: "HashMap + Lista duplamente ligada",
    explanation:
      "HashMap provê lookup O(1) pela chave. Lista duplamente ligada mantém ordem de uso com remoção e inserção O(1) em qualquer posição (com ponteiro). Arrays ordenados têm remoção O(n). Heap não garante O(1) para acesso arbitrário.",
  },

  {
    id: "q-hashmap-005",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "interview",
    tags: ["HashMap", "two-sum"],
    linkedFlashcardTags: ["hashmap"],
    prompt:
      "Você resolveu Two Sum com HashMap em O(n). O entrevistador pergunta: 'E se o array estivesse ordenado — o que mudaria?' Como você responde?",
    idealAnswer:
      "Com array ordenado, posso usar dois ponteiros: O(n) de tempo e O(1) de espaço, melhor que o HashMap que usa O(n) de espaço extra. A ordenação permite que eu avance o ponteiro esquerdo quando a soma é menor que o alvo e o direito quando é maior. A escolha depende do contexto: se o espaço extra é permitido e o array não está ordenado, HashMap é mais simples. Se espaço é crítico ou o array já está ordenado, dois ponteiros é superior.",
    keyPoints: [
      "Dois ponteiros para array ordenado: O(1) espaço",
      "HashMap: O(n) espaço extra",
      "Saber quando cada abordagem é melhor",
      "Perguntar sobre restrições antes de escolher",
    ],
    explanation: "Conhecer múltiplas soluções e seus trade-offs é essencial em entrevistas FAANG.",
  },

  {
    id: "q-hashmap-006",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["HashMap", "group-by"],
    linkedFlashcardTags: ["hashmap"],
    prompt: "Qual é a complexidade de tempo da função agruparPorLetra()?",
    code: "function agruparPorLetra(palavras) {\n  const grupos = {};\n  for (const p of palavras) {\n    const chave = p[0].toLowerCase();\n    (grupos[chave] = grupos[chave] || []).push(p);\n  }\n  return grupos;\n}",
    options: ["O(n)", "O(26n) — simplifica para O(n)", "O(n²)", "O(n log n)"],
    correctAnswer: "O(n)",
    explanation:
      "Um loop sobre n palavras. Cada acesso ao objeto é O(1) amortizado. O(26n) simplifica para O(n) porque 26 é constante. Uma passada linear é O(n).",
  },

  {
    id: "q-hashmap-007",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "pattern",
    tags: ["HashMap", "anagrama"],
    linkedFlashcardTags: ["hashmap"],
    prompt:
      "Verificar se dois strings são anagramas um do outro sem usar sort(). Qual abordagem tem melhor complexidade de tempo?",
    options: [
      "HashMap de frequência de caracteres: O(n)",
      "Ordenar ambos e comparar: O(n log n)",
      "Dois loops aninhados comparando: O(n²)",
      "Janela deslizante sobre os dois strings",
    ],
    correctAnswer: "HashMap de frequência de caracteres: O(n)",
    explanation:
      "Contar frequência de cada caractere em s, depois decrementar para t. Se todos os contadores chegam a zero, são anagramas. O(n) tempo, O(1) espaço (no máximo 26 letras). Sort é O(n log n) — correto, mas não ótimo.",
  },

  {
    id: "q-hashmap-008",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "multiple_choice",
    tags: ["HashMap", "WeakMap"],
    linkedFlashcardTags: ["hashmap"],
    prompt: "Qual caso de uso justifica o uso de WeakMap ao invés de Map em JavaScript?",
    options: [
      "Metadados privados associados a objetos DOM sem impedir garbage collection quando o elemento é removido",
      "Cache de resultados de funções puras para qualquer tipo de chave",
      "Mapear índices numéricos para valores de forma performática",
      "Armazenar configurações de usuário que precisam de persistência",
    ],
    correctAnswer:
      "Metadados privados associados a objetos DOM sem impedir garbage collection quando o elemento é removido",
    explanation:
      "WeakMap mantém referências fracas às chaves — o GC pode coletar o objeto sem que o WeakMap impeça. Ideal para metadados de DOM: quando o elemento é removido, os dados somem automaticamente. Não iterável, sem size. Map mantém referências fortes, causando leaks se o objeto não for removido manualmente.",
  },

  {
    id: "q-hashmap-009",
    topic: "HashMap",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "open",
    tags: ["HashMap", "cache", "TTL"],
    linkedFlashcardTags: ["hashmap"],
    prompt:
      "Como você projetaria um cache simples com suporte a TTL (tempo de expiração) usando Map em JavaScript?",
    idealAnswer:
      "Armazenar no Map: chave → { valor, expiresAt: Date.now() + ttl }. No get(): verificar se expiresAt > Date.now(); se expirado, deletar e retornar null (lazy expiration). No set(): sobrescrever com novo expiresAt. Para limpeza proativa, usar setInterval para varrer e deletar entradas expiradas, ou um MinHeap de expiresAt para identificar as próximas a expirar. Complexidade: get/set O(1). Trade-off: lazy expiration pode acumular entradas expiradas se não houver limpeza periódica.",
    keyPoints: [
      "Guardar expiresAt junto com valor",
      "Verificar expiração no get()",
      "Estratégia de limpeza",
      "Lazy vs proactive expiration",
    ],
    explanation:
      "Problema clássico que combina HashMap com considerações de sistema — aparece em entrevistas de senior.",
  },

  // ── SET ──────────────────────────────────────────────────────────────────────

  {
    id: "q-set-001",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Set", "complexidade"],
    linkedFlashcardTags: ["set"],
    prompt: "Qual é a complexidade de Set.has() em JavaScript?",
    options: [
      "O(1) amortizado — implementação interna de hash table",
      "O(n) — percorre todos os elementos",
      "O(log n) — usa árvore binária internamente",
      "O(√n) — busca hash com probing",
    ],
    correctAnswer: "O(1) amortizado — implementação interna de hash table",
    explanation:
      "Set em JavaScript é implementado como hash table, assim como Map. has(), add() e delete() são O(1) amortizado. No pior caso teórico com muitas colisões: O(n), mas isso é raro na prática.",
  },

  {
    id: "q-set-002",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "pattern",
    tags: ["Set", "deduplicação"],
    linkedFlashcardTags: ["set"],
    prompt:
      "Você tem um array de IDs com duplicatas e precisa retornar apenas os únicos mantendo a primeira ocorrência. Qual é a abordagem mais eficiente?",
    options: [
      "Set para rastrear vistos + filter em passada única: O(n)",
      "Ordenar + remover adjacentes: O(n log n)",
      "Dois loops aninhados comparando cada par: O(n²)",
      "Recursão com splice para remover duplicatas: O(n²)",
    ],
    correctAnswer: "Set para rastrear vistos + filter em passada única: O(n)",
    explanation:
      "const seen = new Set(); return arr.filter(x => !seen.has(x) && seen.add(x)). Uma passada O(n), mantém ordem de primeira ocorrência. Sort + adjacentes não mantém a ordem original.",
  },

  {
    id: "q-set-003",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "multiple_choice",
    tags: ["Set", "interseção"],
    linkedFlashcardTags: ["set"],
    prompt: "Qual é o custo de encontrar a interseção de dois arrays de tamanhos n e m (n ≤ m)?",
    options: [
      "O(n + m) — converter um em Set, filtrar o outro",
      "O(n × m) — comparar todos os pares",
      "O(n log n) — ordenar o menor e busca binária",
      "O(n²) — depende das duplicatas",
    ],
    correctAnswer: "O(n + m) — converter um em Set, filtrar o outro",
    explanation:
      "const setA = new Set(a); return b.filter(x => setA.has(x)). Criar Set: O(n). Filtrar b: O(m), cada has() O(1). Total: O(n + m). Mais eficiente que sort + merge O((n+m) log(n+m)).",
  },

  {
    id: "q-set-004",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "interview",
    tags: ["Set", "set-vs-map"],
    linkedFlashcardTags: ["set", "hashmap"],
    prompt: "Quando você usaria Set ao invés de Map em JavaScript?",
    idealAnswer:
      "Set quando você só precisa verificar presença ou ausência — sem associar um valor à chave. Exemplos: rastrear elementos já visitados, deduplicar, calcular interseção/diferença de conjuntos. Map quando precisa armazenar dados adicionais (chave → valor), como frequência, índice ou metadados. Em termos de performance são equivalentes. A escolha comunica intenção: Set diz 'me importa se existe'; Map diz 'me importa o valor associado'.",
    keyPoints: [
      "Set: apenas presença",
      "Map: chave → valor",
      "Performance equivalente",
      "Semântica comunica intenção",
    ],
    explanation: "Escolher a estrutura correta é sinal de clareza de raciocínio em entrevistas.",
  },

  {
    id: "q-set-005",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Set", "sliding-window"],
    linkedFlashcardTags: ["set", "sliding-window"],
    prompt: "Qual é a complexidade de tempo desta solução para maior substring sem repetição?",
    code: "function semRepeticao(s) {\n  const vistos = new Set();\n  let esq = 0, max = 0;\n  for (let dir = 0; dir < s.length; dir++) {\n    while (vistos.has(s[dir])) { vistos.delete(s[esq]); esq++; }\n    vistos.add(s[dir]);\n    max = Math.max(max, dir - esq + 1);\n  }\n  return max;\n}",
    options: [
      "O(n) — cada caractere é adicionado e removido no máximo uma vez",
      "O(n²) — por causa do while interno",
      "O(n × 26) — simplifica para O(n)",
      "O(n log n)",
    ],
    correctAnswer: "O(n) — cada caractere é adicionado e removido no máximo uma vez",
    explanation:
      "O ponteiro `esq` nunca retrocede. Cada caractere entra no Set uma vez e sai uma vez: no total 2n operações. O while interno não cria O(n²) porque o custo é amortizado entre todas as iterações.",
  },

  {
    id: "q-set-006",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "pattern",
    tags: ["Set", "consecutive-sequence"],
    linkedFlashcardTags: ["set"],
    prompt:
      "Dado um array não ordenado de inteiros, encontre o comprimento da maior sequência consecutiva (ex: [100,4,200,1,3,2] → 4 por [1,2,3,4]). Restrição: O(n).",
    options: [
      "Set + iniciar sequência apenas quando não há predecessor: O(n)",
      "Ordenar + contar adjacentes: O(n log n)",
      "Dois ponteiros no array ordenado: O(n log n)",
      "BFS tratando números como nós: O(n²)",
    ],
    correctAnswer: "Set + iniciar sequência apenas quando não há predecessor: O(n)",
    explanation:
      "Inserir tudo em Set: O(n). Para cada n, verificar se n-1 não está no Set (é início de sequência). Contar n+1, n+2... enquanto estiver no Set. A chave: só começar contagem em inícios de sequência evita O(n²). Cada número é visitado no máximo duas vezes.",
  },

  {
    id: "q-set-007",
    topic: "Set",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "interview",
    tags: ["Set", "cycle-detection"],
    linkedFlashcardTags: ["set", "linked-list"],
    prompt:
      "Como usar um Set para detectar ciclo em uma lista ligada? Qual o trade-off em relação ao algoritmo de Floyd (tartaruga e lebre)?",
    idealAnswer:
      "Com Set: inserir cada nó visitado. Se next já está no Set, há ciclo. O(n) tempo, O(n) espaço. Floyd's (tartaruga e lebre): slow avança 1, fast avança 2. Se há ciclo, se encontram. O(n) tempo, O(1) espaço. Para entrevistas: Set é mais fácil de explicar e implementar. Floyd é preferido quando memória O(1) é requisito. Floyd também pode encontrar o nó de início do ciclo com passo adicional. A pergunta do entrevistador 'você consegue resolver com O(1) de espaço?' é o sinal para usar Floyd.",
    keyPoints: [
      "Set: O(n) espaço, mais simples",
      "Floyd: O(1) espaço, mais complexo",
      "Quando o entrevistador perguntar sobre espaço, mudar para Floyd",
      "Floyd pode encontrar o nó inicial do ciclo",
    ],
    explanation:
      "Conhecer ambas as abordagens e seus trade-offs é esperado em entrevistas de nível senior.",
  },

  // ── STACK ────────────────────────────────────────────────────────────────────

  {
    id: "q-stack-001",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "big_o",
    tags: ["Stack", "parentheses"],
    linkedFlashcardTags: ["stack"],
    prompt: "Qual é a complexidade de tempo e espaço da função ehValido()?",
    code: "function ehValido(s) {\n  const pilha = [];\n  const pares = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of s) {\n    if ('([{'.includes(ch)) pilha.push(ch);\n    else if (pilha.pop() !== pares[ch]) return false;\n  }\n  return pilha.length === 0;\n}",
    options: [
      "O(n) tempo, O(n) espaço",
      "O(1) tempo, O(1) espaço",
      "O(n²) tempo, O(n) espaço",
      "O(n) tempo, O(1) espaço",
    ],
    correctAnswer: "O(n) tempo, O(n) espaço",
    explanation:
      "Uma passada sobre n caracteres: O(n). A pilha pode crescer até n/2 elementos no pior caso (ex: '((((('): O(n) espaço.",
  },

  {
    id: "q-stack-002",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "multiple_choice",
    tags: ["Stack", "LIFO"],
    linkedFlashcardTags: ["stack"],
    prompt: "Uma pilha (Stack) segue qual política de acesso?",
    options: [
      "LIFO — Last In, First Out",
      "FIFO — First In, First Out",
      "Prioridade — maior valor sai primeiro",
      "Aleatória — sem ordem definida",
    ],
    correctAnswer: "LIFO — Last In, First Out",
    explanation:
      "O último elemento inserido (push) é o primeiro a ser removido (pop). Pense em uma pilha de pratos: você só pode remover o de cima. FIFO é a política de Filas (Queue).",
  },

  {
    id: "q-stack-003",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "easy",
    type: "pattern",
    tags: ["Stack", "parentheses"],
    linkedFlashcardTags: ["stack"],
    prompt:
      "Verificar se uma expressão contendo '(', ')', '[', ']', '{', '}' está balanceada. Qual estrutura é mais adequada?",
    options: [
      "Pilha — empilha abre, verifica ao fechar",
      "Fila — processa na ordem de chegada",
      "HashMap — mapeia cada abre para fecha",
      "Dois ponteiros — um em cada extremidade",
    ],
    correctAnswer: "Pilha — empilha abre, verifica ao fechar",
    explanation:
      "A pilha mantém os delimitadores abertos ainda aguardando fechamento. Ao encontrar um fechador, o topo da pilha deve ser o abridor correspondente. Sem pilha, seria impossível lidar com aninhamento arbitrário.",
  },

  {
    id: "q-stack-004",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Stack", "monotonic-stack"],
    linkedFlashcardTags: ["stack"],
    prompt: "Por que a complexidade de tempo desta solução é O(n) e não O(n²)?",
    code: "function temperaturaEspera(temps) {\n  const res = new Array(temps.length).fill(0);\n  const pilha = []; // índices\n  for (let i = 0; i < temps.length; i++) {\n    while (pilha.length && temps[i] > temps[pilha.at(-1)]) {\n      const j = pilha.pop();\n      res[j] = i - j;\n    }\n    pilha.push(i);\n  }\n  return res;\n}",
    options: [
      "O(n) — cada índice é empilhado e desempilhado no máximo uma vez",
      "O(n²) — o while interno pode executar n vezes para cada i",
      "O(n log n) — pilha tem operações logarítmicas",
      "O(n²) no pior caso quando o array está em ordem crescente",
    ],
    correctAnswer: "O(n) — cada índice é empilhado e desempilhado no máximo uma vez",
    explanation:
      "Análise amortizada: cada índice de 0 a n-1 faz exatamente um push e no máximo um pop. Total de operações: no máximo 2n. O while parece O(n) por iteração, mas o custo total de todos os while juntos é O(n), não O(n²).",
  },

  {
    id: "q-stack-005",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "big_o",
    tags: ["Stack", "min-stack"],
    linkedFlashcardTags: ["stack"],
    prompt: "Qual é a complexidade de getMin() nesta implementação?",
    code: "class MinStack {\n  constructor() { this.pilha = []; this.minPilha = []; }\n  push(val) {\n    this.pilha.push(val);\n    const min = this.minPilha.length ? Math.min(val, this.minPilha.at(-1)) : val;\n    this.minPilha.push(min);\n  }\n  pop() { this.pilha.pop(); this.minPilha.pop(); }\n  getMin() { return this.minPilha.at(-1); }\n}",
    options: [
      "O(1) — o mínimo atual está sempre no topo da minPilha",
      "O(n) — precisa percorrer a pilha para encontrar o mínimo",
      "O(log n) — busca binária na pilha auxiliar",
      "O(n) no pop(), O(1) no push()",
    ],
    correctAnswer: "O(1) — o mínimo atual está sempre no topo da minPilha",
    explanation:
      "A minPilha mantém, em cada posição i, o mínimo dos elementos da pilha[0..i]. getMin() retorna o topo em O(1). Trade-off: dobra o espaço para O(n).",
  },

  {
    id: "q-stack-006",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "pattern",
    tags: ["Stack", "next-greater"],
    linkedFlashcardTags: ["stack"],
    prompt:
      "Para cada elemento de um array, encontrar o próximo elemento maior à direita. O(n) de tempo.",
    options: [
      "Pilha monotônica decrescente",
      "Dois ponteiros (esq e dir)",
      "BFS sobre o array",
      "Programação dinâmica de trás para frente",
    ],
    correctAnswer: "Pilha monotônica decrescente",
    explanation:
      "Pilha mantém índices de elementos sem 'próximo maior' ainda. Quando encontramos nums[i] > nums[topo], o próximo maior do topo é nums[i]. Cada elemento é processado O(1) amortizado. Monotônica decrescente: elementos na pilha estão em ordem decrescente de valor.",
  },

  {
    id: "q-stack-007",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "medium",
    type: "interview",
    tags: ["Stack", "recursão"],
    linkedFlashcardTags: ["stack"],
    prompt: "Quando você converteria uma solução recursiva para usar pilha explícita?",
    idealAnswer:
      "Quando a profundidade de recursão pode causar stack overflow. Em JavaScript, o limite típico da call stack é ~10.000 frames (varia por engine e ambiente). Em árvores ou grafos degenerados (lista ligada como árvore), a recursão chega a O(n) de profundidade. Com pilha explícita no heap, o limite prático é a memória disponível. Também vale converter quando você precisa de controle mais fino sobre a ordem de processamento, ou quando iterativo é significativamente mais legível. Custo: mais código para manter o estado explicitamente.",
    keyPoints: [
      "Limite da call stack em JS: ~10k",
      "Pilha explícita usa heap memory",
      "Casos: árvores degeneradas, grafos com n grande",
      "Trade-off: mais código vs segurança",
    ],
    explanation: "Questão clássica de entrevista sobre limitações de recursão em JavaScript.",
  },

  {
    id: "q-stack-008",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "pattern",
    tags: ["Stack", "histograma"],
    linkedFlashcardTags: ["stack"],
    prompt:
      "Encontrar a maior área de retângulo que cabe em um histograma representado por array de alturas.",
    options: [
      "Pilha monotônica crescente de índices",
      "Dois ponteiros com mínimo local",
      "Programação dinâmica 2D",
      "Divisão e conquista com max e min",
    ],
    correctAnswer: "Pilha monotônica crescente de índices",
    explanation:
      "Manter pilha de índices com alturas crescentes. Quando encontramos uma barra menor, calculamos a área para cada barra na pilha usando a largura até o índice atual. O(n) amortizado. Problema clássico: Largest Rectangle in Histogram (LeetCode 84).",
  },

  {
    id: "q-stack-009",
    topic: "Stack",
    group: "data_structures",
    week: 1,
    difficulty: "hard",
    type: "open",
    tags: ["Stack", "browser-history"],
    linkedFlashcardTags: ["stack"],
    prompt:
      "Como você implementaria histórico de navegação de um browser (voltar/avançar) usando pilhas?",
    idealAnswer:
      "Duas pilhas: `anterior` e `proxima`. Ao navegar para nova página: push na `anterior`, esvaziar `proxima` (novo branch do histórico). Ao voltar (back): pop de `anterior`, push na `proxima`. Ao avançar (forward): pop de `proxima`, push na `anterior`. Página atual: topo de `anterior`. Todas as operações são O(1). Memória: O(n) onde n é o número de páginas no histórico. Esse mesmo padrão se aplica a undo/redo em editores de texto.",
    keyPoints: [
      "Duas pilhas: anterior e proxima",
      "Navegar nova página: limpar proxima",
      "Voltar: transferir entre pilhas",
      "Todas as operações O(1)",
    ],
    explanation:
      "Exemplo real e concreto de aplicação de pilha que aparece em entrevistas de design.",
  },
];
