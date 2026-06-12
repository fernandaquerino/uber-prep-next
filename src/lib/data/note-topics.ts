export type StudyTopic = {
  id: string;
  label: string;
  category: string;
};

export const STUDY_TOPICS: StudyTopic[] = [
  // Algoritmos
  { id: "arrays", label: "Arrays", category: "algo" },
  { id: "set-map", label: "Set & Map", category: "algo" },
  { id: "big-o", label: "Big O Notation", category: "algo" },
  { id: "linked-list", label: "Linked List", category: "algo" },
  { id: "graphs", label: "Grafos", category: "algo" },
  { id: "queue", label: "Queue", category: "algo" },
  { id: "bfs", label: "BFS", category: "algo" },
  { id: "dfs", label: "DFS", category: "algo" },
  { id: "heap", label: "Heap / Priority Queue", category: "algo" },
  { id: "trees", label: "Árvores", category: "algo" },
  { id: "stack", label: "Stack", category: "algo" },
  { id: "dynamic-programming", label: "Dynamic Programming", category: "algo" },
  { id: "two-pointers", label: "Two Pointers", category: "algo" },
  { id: "sliding-window", label: "Sliding Window", category: "algo" },
  { id: "binary-search", label: "Binary Search", category: "algo" },
  { id: "lru-cache", label: "LRU Cache", category: "algo" },
  { id: "trie", label: "Trie", category: "algo" },
  { id: "event-emitter", label: "Event Emitter", category: "algo" },

  // System Design
  { id: "frontend-system-design", label: "Frontend System Design", category: "system" },
  { id: "caching", label: "Caching", category: "system" },
  { id: "virtualization", label: "Virtualização de Listas", category: "system" },
  { id: "microfrontends", label: "Microfrontends", category: "system" },
  { id: "infinite-scroll", label: "Infinite Scroll", category: "system" },
  { id: "observability", label: "Observabilidade", category: "system" },
  { id: "state-management", label: "State Management", category: "system" },
  { id: "file-upload", label: "File Upload", category: "system" },
  { id: "autocomplete", label: "Autocomplete / Typeahead", category: "system" },

  // JavaScript
  { id: "javascript", label: "JavaScript", category: "js" },
  { id: "debounce", label: "Debounce", category: "js" },
  { id: "throttle", label: "Throttle", category: "js" },
  { id: "closures", label: "Closures", category: "js" },
  { id: "promises", label: "Promises", category: "js" },
  { id: "async-await", label: "Async / Await", category: "js" },
  { id: "prototypes", label: "Prototypes & Herança", category: "js" },
  { id: "event-loop", label: "Event Loop", category: "js" },

  // Frontend Coding
  { id: "react", label: "React", category: "fe_coding" },
  { id: "frontend-coding", label: "Frontend Coding", category: "fe_coding" },

  // Mocks
  { id: "mock-interviews", label: "Mock Interviews", category: "mock" },

  // Behavioral
  { id: "behavioral-star", label: "Behavioral (STAR)", category: "behavioral" },
];

export function getTopicById(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((t) => t.id === id);
}

export function getTopicsByCategory(category: string): StudyTopic[] {
  return STUDY_TOPICS.filter((t) => t.category === category);
}
