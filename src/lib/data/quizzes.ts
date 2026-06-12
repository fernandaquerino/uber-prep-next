import { PART1 } from "./quiz-part1.ts";
import { PART2 } from "./quiz-part2.ts";
import { PART3 } from "./quiz-part3.ts";
import { PART4 } from "./quiz-part4.ts";
import { PART5 } from "./quiz-part5.ts";

type LegacyQuizResource = {
  title: string;
  type: string;
};

export type LegacyQuizQuestion = {
  id: string;
  topic: string;
  group?: string;
  week?: number;
  difficulty: string;
  type: string;
  tags: string[];
  linkedFlashcardTags?: string[];
  prompt: string;
  code?: string;
  options?: string[];
  correctAnswer?: string | string[] | boolean;
  explanation?: string;
  idealAnswer?: string;
  keyPoints?: string[];
  resources?: LegacyQuizResource[];
};

export const QUIZ_REVIEW_CYCLE = [1, 3, 7, 14, 30];

export const QUIZ_TYPES = [
  { key: "multiple_choice", label: "Múltipla escolha" },
  { key: "big_o", label: "Big O" },
  { key: "pattern", label: "Pattern" },
  { key: "open", label: "Resposta aberta" },
  { key: "interview", label: "Entrevista" },
];

export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"];

export const QUIZ_GROUPS = [
  {
    key: "data_structures",
    label: "Estruturas de Dados",
    color: "#00E5A0",
    topics: [
      "Arrays",
      "Strings",
      "HashMap",
      "Map",
      "Set",
      "Stack",
      "Queue",
      "Linked List",
      "Trees",
      "Graphs",
      "Heap",
      "Trie",
    ],
  },
  {
    key: "algorithms",
    label: "Algoritmos",
    color: "#60A5FA",
    topics: [
      "Big O",
      "Binary Search",
      "Two Pointers",
      "Sliding Window",
      "BFS",
      "DFS",
      "Recursion",
      "Backtracking",
      "Dynamic Programming",
    ],
  },
  {
    key: "javascript",
    label: "JavaScript",
    color: "#FF6B9D",
    topics: [
      "Event Loop",
      "Call Stack",
      "Closures",
      "Hoisting",
      "Scope",
      "Prototype",
      "Promises",
      "Async/Await",
    ],
  },
  {
    key: "react",
    label: "React",
    color: "#7C6FF7",
    topics: [
      "Rendering",
      "Reconciliation",
      "useMemo",
      "useCallback",
      "React.memo",
      "Context",
      "SSR",
      "CSR",
      "SSG",
      "Server Components",
    ],
  },
  {
    key: "frontend_system_design",
    label: "Frontend System Design",
    color: "#FFB547",
    topics: [
      "Performance",
      "Caching",
      "Infinite Scroll",
      "Virtualization",
      "Design Systems",
      "Microfrontends",
      "BFF",
      "Observability",
    ],
  },
  {
    key: "accessibility",
    label: "Acessibilidade",
    color: "#60A5FA",
    topics: [
      "Accessibility",
      "ARIA",
      "WCAG",
      "Keyboard Navigation",
      "Screen Readers",
      "Color Contrast",
      "Focus Management",
    ],
  },
  {
    key: "behavioral",
    label: "Comportamental",
    color: "#B7F7C7",
    topics: ["STAR", "Liderança", "Conflito", "Mentoria", "Ownership"],
  },
];

const RESOURCES: Record<string, LegacyQuizResource[]> = {
  "Big O": [
    { title: "NeetCode - Big O Notation", type: "vídeo" },
    { title: "Grokking Algorithms - Capítulo 1", type: "livro" },
  ],
  Arrays: [
    { title: "NeetCode - Arrays e Tabela Hash", type: "vídeo" },
    { title: "LeetCode Explore - Array 101", type: "artigo" },
  ],
  HashMap: [
    { title: "NeetCode - Hash Maps", type: "vídeo" },
    { title: "MDN - Map", type: "documentação" },
  ],
  Set: [
    { title: "MDN - Set", type: "documentação" },
    { title: "NeetCode - Contains Duplicate", type: "vídeo" },
  ],
  Stack: [
    { title: "NeetCode - Stack", type: "vídeo" },
    { title: "LeetCode - Valid Parentheses", type: "problema" },
  ],
  Queue: [
    { title: "LeetCode - Implement Queue using Stacks", type: "problema" },
    { title: "Grokking Algorithms - Busca em largura", type: "livro" },
  ],
  "Linked List": [
    { title: "NeetCode - Linked List", type: "vídeo" },
    { title: "LeetCode - Reverse Linked List", type: "problema" },
  ],
  Trees: [
    { title: "NeetCode - Trees", type: "vídeo" },
    { title: "LeetCode - Binary Tree Level Order Traversal", type: "problema" },
  ],
  Graphs: [
    { title: "NeetCode - Graphs", type: "vídeo" },
    { title: "Grokking Algorithms - Grafos", type: "livro" },
  ],
  Heap: [
    { title: "NeetCode - Heap e Fila de Prioridade", type: "vídeo" },
    { title: "LeetCode - Top K Frequent Elements", type: "problema" },
  ],
  Trie: [
    { title: "NeetCode - Trie", type: "vídeo" },
    { title: "LeetCode - Implement Trie", type: "problema" },
  ],
  "Binary Search": [
    { title: "NeetCode - Binary Search", type: "vídeo" },
    { title: "Grokking Algorithms - Busca binária", type: "livro" },
  ],
  "Sliding Window": [
    { title: "NeetCode - Sliding Window", type: "vídeo" },
    {
      title: "LeetCode - Longest Substring Without Repeating Characters",
      type: "problema",
    },
  ],
  "Two Pointers": [
    { title: "NeetCode - Two Pointers", type: "vídeo" },
    { title: "LeetCode - Container With Most Water", type: "problema" },
  ],
  BFS: [
    { title: "NeetCode - BFS", type: "vídeo" },
    { title: "LeetCode - Rotting Oranges", type: "problema" },
  ],
  DFS: [
    { title: "NeetCode - DFS", type: "vídeo" },
    { title: "LeetCode - Number of Islands", type: "problema" },
  ],
  Backtracking: [
    { title: "NeetCode - Backtracking", type: "vídeo" },
    { title: "LeetCode - Combination Sum", type: "problema" },
  ],
  "Dynamic Programming": [
    { title: "NeetCode - Dynamic Programming", type: "vídeo" },
    { title: "LeetCode - Climbing Stairs", type: "problema" },
  ],
  JavaScript: [
    { title: "MDN - JavaScript Guide", type: "documentação" },
    { title: "You Don't Know JS Yet", type: "livro" },
  ],
  React: [
    { title: "React Docs - Thinking in React", type: "documentação" },
    { title: "React Docs - Rendering", type: "documentação" },
  ],
  "Frontend System Design": [
    { title: "Frontend System Design - GreatFrontend", type: "artigo" },
    { title: "web.dev - Core Web Vitals", type: "artigo" },
  ],
  Comportamental: [
    { title: "Amazon Leadership Principles", type: "artigo" },
    { title: "STAR Interview Method", type: "artigo" },
  ],
};

const WEEK_BY_TOPIC: Record<string, number> = {
  "Big O": 1,
  Arrays: 1,
  HashMap: 1,
  Set: 1,
  Stack: 1,
  Queue: 1,
  "Two Pointers": 2,
  "Sliding Window": 2,
  "Binary Search": 2,
  "Linked List": 3,
  Trees: 3,
  BFS: 3,
  DFS: 3,
  Graphs: 4,
  Heap: 4,
  Trie: 4,
  "Dynamic Programming": 4,
  Backtracking: 4,
  JavaScript: 5,
  React: 5,
  "Frontend System Design": 5,
  Comportamental: 6,
};

const GROUP_BY_TOPIC: Record<string, string> = {
  "Big O": "algorithms",
  Arrays: "data_structures",
  HashMap: "data_structures",
  Set: "data_structures",
  Stack: "data_structures",
  Queue: "data_structures",
  "Linked List": "data_structures",
  Trees: "data_structures",
  Graphs: "data_structures",
  Heap: "data_structures",
  Trie: "data_structures",
  "Binary Search": "algorithms",
  "Sliding Window": "algorithms",
  "Two Pointers": "algorithms",
  BFS: "algorithms",
  DFS: "algorithms",
  Backtracking: "algorithms",
  "Dynamic Programming": "algorithms",
  JavaScript: "javascript",
  React: "react",
  "Frontend System Design": "frontend_system_design",
  Comportamental: "behavioral",
};

const ALL_QUESTIONS: LegacyQuizQuestion[] = [...PART1, ...PART2, ...PART3, ...PART4, ...PART5];

export const INITIAL_QUIZ_QUESTIONS = ALL_QUESTIONS.map((q) => ({
  ...q,
  resources: q.resources?.length ? q.resources : (RESOURCES[q.topic] ?? []),
  week: q.week ?? WEEK_BY_TOPIC[q.topic] ?? 1,
  group: q.group ?? GROUP_BY_TOPIC[q.topic] ?? "algorithms",
}));

export function getQuizContentAudit(questions = INITIAL_QUIZ_QUESTIONS) {
  const prompts = new Map();
  const duplicates: [string, string][] = [];
  questions.forEach((question) => {
    const key = question.prompt.trim().toLowerCase();
    if (prompts.has(key)) duplicates.push([prompts.get(key), question.id]);
    prompts.set(key, question.id);
  });

  const missingResources = questions
    .filter((question) => !question.resources || question.resources.length === 0)
    .map((question) => question.id);

  const mixedLanguageHints = questions
    .filter((question) =>
      [question.prompt, question.explanation, question.idealAnswer, ...(question.options || [])]
        .filter(Boolean)
        .some((text) =>
          /\b(Membership lookup|Priority Queue|Prefix Tree|Requirements first|Render only what changed|Open Answer|Pattern Recognition)\b/.test(
            text as string,
          ),
        ),
    )
    .map((question) => question.id);

  return {
    totalQuestions: questions.length,
    duplicatePrompts: duplicates,
    missingResources,
    mixedLanguageHints,
  };
}
