/** Keyword → suggested tags mapping (pure function, no AI) */
const KEYWORD_TAG_MAP: Array<{ keywords: RegExp; tags: string[] }> = [
  { keywords: /\bhashmap|hashset|hash.table\b/i, tags: ["hashmap", "hashing"] },
  { keywords: /\bbig.?o|complexidade|o\(n\)|o\(1\)|o\(log/i, tags: ["big-o", "complexidade"] },
  { keywords: /\breact\b/i, tags: ["react"] },
  { keywords: /\bjavascript\b|\bjs\b/i, tags: ["javascript"] },
  { keywords: /\bsystem.design|sistema.distribuído\b/i, tags: ["system-design"] },
  { keywords: /\bbehavioral|star.method|comportamental/i, tags: ["behavioral", "star"] },
  { keywords: /\btwo.pointer\b/i, tags: ["two-pointers"] },
  { keywords: /\bsliding.window\b/i, tags: ["sliding-window"] },
  { keywords: /\bbinary.search|busca.binária\b/i, tags: ["binary-search"] },
  { keywords: /\bdynamic.programm|programa.?ção.dinâmica\b/i, tags: ["dp"] },
  { keywords: /\bgraph|bfs|dfs|grafo\b/i, tags: ["grafos", "bfs-dfs"] },
  { keywords: /\brecursi\b/i, tags: ["recursão"] },
  { keywords: /\barray\b/i, tags: ["array"] },
  { keywords: /\blinked.list\b/i, tags: ["linked-list"] },
  { keywords: /\bstack|pilha\b/i, tags: ["stack"] },
  { keywords: /\bqueue|fila\b/i, tags: ["queue"] },
  { keywords: /\btree|árvore\b/i, tags: ["tree"] },
  { keywords: /\bheap\b/i, tags: ["heap"] },
  { keywords: /\btrie\b/i, tags: ["trie"] },
  { keywords: /\bclosure\b/i, tags: ["closure"] },
  { keywords: /\bevent.loop\b/i, tags: ["event-loop"] },
  { keywords: /\bpromise|async.await|assíncrono\b/i, tags: ["async"] },
  { keywords: /\bhoisting\b/i, tags: ["hoisting"] },
  { keywords: /\bprotochain|prototype\b/i, tags: ["prototype"] },
  { keywords: /\bssr|server.side\b/i, tags: ["ssr"] },
  { keywords: /\bcsr|client.side\b/i, tags: ["csr"] },
  { keywords: /\blru.cache\b/i, tags: ["lru"] },
  { keywords: /\bsort|ordenar\b/i, tags: ["sorting"] },
  { keywords: /\bsingle.source|dijkstra\b/i, tags: ["shortest-path"] },
];

/**
 * Suggest tags from the combined text of front + back.
 * Returns unique, normalized suggestions. Not applied automatically.
 */
export function suggestTags(front: string, back: string): string[] {
  const text = `${front} ${back}`;
  const suggestions = new Set<string>();

  for (const { keywords, tags } of KEYWORD_TAG_MAP) {
    if (keywords.test(text)) {
      for (const tag of tags) suggestions.add(tag);
    }
  }

  return Array.from(suggestions);
}
