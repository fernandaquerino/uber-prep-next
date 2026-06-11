export const FRONTEND_DRILLS = [
  {
    id: "drill-debounce",
    title: "Debounce",
    topic: "Debounce",
    difficulty: "medium",
    prompt:
      "Implemente debounce(fn, wait). A função retornada deve adiar a execução até wait ms após a última chamada.",
    starter: "function debounce(fn, wait) {\n  // implemente aqui\n}",
    tests: [
      {
        input:
          "(async () => {\n  const calls = [];\n  const debounced = debounce((value) => calls.push(value), 20);\n  debounced('a');\n  debounced('b');\n  await new Promise((r) => setTimeout(r, 35));\n  return calls;\n})()",
        expected: '["b"]',
      },
    ],
    rubric: [
      "Cancela timer anterior",
      "Preserva argumentos da última chamada",
      "Executa somente após o intervalo",
    ],
  },
  {
    id: "drill-throttle",
    title: "Throttle",
    topic: "Throttle",
    difficulty: "medium",
    prompt:
      "Implemente throttle(fn, wait). A função deve executar no máximo uma vez por intervalo.",
    starter: "function throttle(fn, wait) {\n  // implemente aqui\n}",
    tests: [
      {
        input:
          "(async () => {\n  const calls = [];\n  const throttled = throttle((value) => calls.push(value), 30);\n  throttled('a');\n  throttled('b');\n  await new Promise((r) => setTimeout(r, 35));\n  throttled('c');\n  return calls;\n})()",
        expected: '["a","c"]',
      },
    ],
    rubric: [
      "Bloqueia chamadas dentro da janela",
      "Não perde contexto básico",
      "Evita múltiplos timers desnecessários",
    ],
  },
  {
    id: "drill-event-emitter",
    title: "Event Emitter",
    topic: "Event Emitter",
    difficulty: "medium",
    prompt: "Implemente uma classe EventEmitter com on, off e emit.",
    starter:
      "class EventEmitter {\n  constructor() {\n    // implemente aqui\n  }\n  on(event, handler) {}\n  off(event, handler) {}\n  emit(event, ...args) {}\n}",
    tests: [
      {
        input:
          "(() => {\n  const emitter = new EventEmitter();\n  const calls = [];\n  const handler = (value) => calls.push(value);\n  emitter.on('change', handler);\n  emitter.emit('change', 1);\n  emitter.off('change', handler);\n  emitter.emit('change', 2);\n  return calls;\n})()",
        expected: "[1]",
      },
    ],
    rubric: [
      "Guarda handlers por evento",
      "Remove handler específico",
      "Propaga argumentos no emit",
    ],
  },
  {
    id: "drill-lru-cache",
    title: "LRU Cache",
    topic: "LRU Cache",
    difficulty: "hard",
    prompt:
      "Implemente LRUCache com get e put. Quando exceder a capacidade, remova o item menos recentemente usado.",
    starter:
      "class LRUCache {\n  constructor(capacity) {\n    // implemente aqui\n  }\n  get(key) {}\n  put(key, value) {}\n}",
    tests: [
      {
        input:
          "(() => {\n  const cache = new LRUCache(2);\n  cache.put('a', 1);\n  cache.put('b', 2);\n  cache.get('a');\n  cache.put('c', 3);\n  return [cache.get('a'), cache.get('b'), cache.get('c')];\n})()",
        expected: "[1,-1,3]",
      },
    ],
    rubric: [
      "Atualiza recência no get",
      "Remove menos recente ao exceder capacidade",
      "Mantém get/put eficientes",
    ],
  },
];
