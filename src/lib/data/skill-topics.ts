export type SkillAreaId =
  | "algo"
  | "js"
  | "fe_coding"
  | "system"
  | "behavioral"
  | "mock"
  | "english";

export type SkillTopicDefinition = {
  id: string;
  area: SkillAreaId;
  label: string;
  aliases: string[];
  important: boolean;
};

export const SKILL_AREAS: Array<{ id: SkillAreaId; label: string }> = [
  { id: "algo", label: "Algoritmos & ED" },
  { id: "js", label: "JavaScript" },
  { id: "fe_coding", label: "Frontend Coding" },
  { id: "system", label: "Frontend System Design" },
  { id: "behavioral", label: "Behavioral" },
  { id: "mock", label: "Mock Interviews" },
  { id: "english", label: "Inglês Técnico" },
];

export const SKILL_TOPICS: SkillTopicDefinition[] = [
  {
    id: "big-o",
    area: "algo",
    label: "Big O",
    aliases: ["big o", "complexidade"],
    important: true,
  },
  {
    id: "arrays-hashing",
    area: "algo",
    label: "Arrays & Hashing",
    aliases: ["array", "hashmap", "map", "set", "hash"],
    important: true,
  },
  {
    id: "two-pointers",
    area: "algo",
    label: "Two Pointers",
    aliases: ["two pointers", "dois ponteiros"],
    important: true,
  },
  {
    id: "sliding-window",
    area: "algo",
    label: "Sliding Window",
    aliases: ["sliding window", "janela"],
    important: true,
  },
  {
    id: "binary-search",
    area: "algo",
    label: "Binary Search",
    aliases: ["binary search", "busca binaria"],
    important: true,
  },
  {
    id: "linked-lists",
    area: "algo",
    label: "Linked Lists",
    aliases: ["linked list", "lista ligada"],
    important: false,
  },
  {
    id: "trees-graphs",
    area: "algo",
    label: "Trees & Graphs",
    aliases: ["tree", "trees", "graph", "graphs", "bfs", "dfs", "grafos"],
    important: true,
  },
  {
    id: "heap-trie",
    area: "algo",
    label: "Heap & Trie",
    aliases: ["heap", "priority queue", "trie"],
    important: false,
  },
  {
    id: "dynamic-programming",
    area: "algo",
    label: "Dynamic Programming",
    aliases: ["dynamic programming", "dp", "memoization"],
    important: true,
  },
  {
    id: "backtracking",
    area: "algo",
    label: "Backtracking",
    aliases: ["backtracking", "recursion", "recursao"],
    important: false,
  },
  {
    id: "event-loop",
    area: "js",
    label: "Event Loop & Async",
    aliases: ["event loop", "promise", "async", "await", "microtask"],
    important: true,
  },
  {
    id: "closures-scope",
    area: "js",
    label: "Closures & Scope",
    aliases: ["closure", "scope", "escopo", "hoisting", "tdz"],
    important: true,
  },
  {
    id: "objects-prototypes",
    area: "js",
    label: "Objects & Prototypes",
    aliases: ["prototype", "this", "object", "heranca"],
    important: true,
  },
  {
    id: "js-implementation",
    area: "fe_coding",
    label: "Implementações JavaScript",
    aliases: [
      "debounce",
      "throttle",
      "promise.all",
      "deep clone",
      "curry",
      "memoize",
      "event emitter",
      "lru",
    ],
    important: true,
  },
  {
    id: "react-rendering",
    area: "fe_coding",
    label: "React & Rendering",
    aliases: [
      "react",
      "rendering",
      "reconciliation",
      "usememo",
      "usecallback",
      "server components",
    ],
    important: true,
  },
  {
    id: "ui-components",
    area: "fe_coding",
    label: "Componentes de UI",
    aliases: ["tabs", "modal", "autocomplete", "data table", "infinite scroll", "virtualized"],
    important: true,
  },
  {
    id: "accessibility",
    area: "fe_coding",
    label: "Acessibilidade",
    aliases: ["accessibility", "aria", "wcag", "keyboard", "focus", "screen reader"],
    important: true,
  },
  {
    id: "system-design-framework",
    area: "system",
    label: "Framework de System Design",
    aliases: ["radio", "requirements", "system design", "architecture"],
    important: true,
  },
  {
    id: "performance-caching",
    area: "system",
    label: "Performance & Caching",
    aliases: ["performance", "caching", "cache", "web vitals", "observability", "bff"],
    important: true,
  },
  {
    id: "behavioral-star",
    area: "behavioral",
    label: "Método STAR",
    aliases: ["star", "behavioral", "lideranca", "conflito", "ownership", "mentoria"],
    important: true,
  },
  {
    id: "mock-coding",
    area: "mock",
    label: "Coding Mock",
    aliases: ["coding mock", "mock coding"],
    important: true,
  },
  {
    id: "mock-system-design",
    area: "mock",
    label: "System Design Mock",
    aliases: ["system design mock", "mock system"],
    important: true,
  },
  {
    id: "mock-behavioral",
    area: "mock",
    label: "Behavioral Mock",
    aliases: ["behavioral mock", "mock behavioral"],
    important: true,
  },
  {
    id: "english-clarifying",
    area: "english",
    label: "Clarifying Questions",
    aliases: ["clarifying", "requirements", "questions"],
    important: true,
  },
  {
    id: "english-coding",
    area: "english",
    label: "Coding Communication",
    aliases: ["coding interview", "think out loud", "complexity"],
    important: true,
  },
  {
    id: "english-system-design",
    area: "english",
    label: "System Design Communication",
    aliases: ["trade-offs", "tradeoffs", "scale", "functional requirements"],
    important: true,
  },
  {
    id: "english-behavioral",
    area: "english",
    label: "Behavioral Communication",
    aliases: ["behavioral english", "english star", "stakeholder"],
    important: true,
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getSkillTopic(id: string): SkillTopicDefinition | undefined {
  return SKILL_TOPICS.find((topic) => topic.id === id);
}

export function inferSkillTopicIds(values: Array<string | undefined>): string[] {
  const haystack = normalize(values.filter(Boolean).join(" "));
  if (!haystack) return [];
  return SKILL_TOPICS.filter((topic) =>
    [topic.id, topic.label, ...topic.aliases].some((alias) => haystack.includes(normalize(alias))),
  ).map((topic) => topic.id);
}

export function normalizeSkillArea(category?: string): SkillAreaId | null {
  const value = normalize(category ?? "");
  if (["algo", "algorithm", "data_structures"].some((key) => value.includes(key))) return "algo";
  if (value === "js" || value.includes("javascript")) return "js";
  if (value.includes("fe_coding") || value.includes("frontend coding") || value === "react")
    return "fe_coding";
  if (value === "system" || value.includes("system_design") || value.includes("system design"))
    return "system";
  if (value.includes("behavioral")) return "behavioral";
  if (value.includes("mock")) return "mock";
  if (value.includes("english") || value.includes("ingles")) return "english";
  return null;
}
