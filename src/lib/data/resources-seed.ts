import type { ResourceRecord } from "@/types/database";
import { RESOURCES, WEEKS } from "./plan";

const BASE_DATE = "2024-01-01T00:00:00.000Z";

function makeResource(
  id: string,
  title: string,
  type: ResourceRecord["type"],
  category: string,
  topicIds: string[],
  tags: string[],
  opts: {
    url?: string;
    description?: string;
    difficulty?: ResourceRecord["difficulty"];
    estimatedMinutes?: number;
  } = {},
): ResourceRecord {
  return {
    id,
    title,
    type,
    category,
    topicIds,
    tags,
    url: opts.url,
    description: opts.description,
    difficulty: opts.difficulty,
    estimatedMinutes: opts.estimatedMinutes,
    isFavorite: false,
    sourceType: "seed",
    lifecycleStatus: "active",
    linkedPlanBlockIds: [],
    linkedNoteIds: [],
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
  };
}

const CURATED_RESOURCES: ResourceRecord[] = [
  // ── Algoritmos ────────────────────────────────────────────────────────────
  makeResource(
    "res:algo:neetcode-150",
    "NeetCode 150",
    "exercise",
    "algo",
    [
      "arrays",
      "two-pointers",
      "sliding-window",
      "binary-search",
      "dynamic-programming",
      "graphs",
      "trees",
    ],
    ["leetcode", "patterns", "must-do"],
    {
      url: "https://neetcode.io/practice",
      description: "Lista curada de 150 problemas LeetCode com vídeos explicativos.",
      difficulty: "intermediate",
      estimatedMinutes: 2400,
    },
  ),
  makeResource(
    "res:algo:grind-75",
    "Grind 75",
    "exercise",
    "algo",
    ["arrays", "graphs", "trees", "dynamic-programming"],
    ["leetcode", "structured"],
    {
      url: "https://www.techinterviewhandbook.org/grind75",
      description: "Seleção de 75 problemas essenciais para preparação de entrevistas.",
      difficulty: "intermediate",
      estimatedMinutes: 1500,
    },
  ),
  makeResource(
    "res:algo:cs-dojo",
    "CS Dojo — Data Structures & Algorithms",
    "video",
    "algo",
    ["arrays", "linked-list", "trees", "graphs", "big-o"],
    ["youtube", "beginner-friendly"],
    {
      url: "https://www.youtube.com/@CSDojo",
      description: "Canal do YouTube com explicações claras de estruturas de dados.",
      difficulty: "beginner",
      estimatedMinutes: 300,
    },
  ),
  makeResource(
    "res:algo:algo-expert",
    "AlgoExpert",
    "course",
    "algo",
    ["arrays", "two-pointers", "dynamic-programming", "graphs", "trees", "heap"],
    ["paid", "video-explanations"],
    {
      url: "https://www.algoexpert.io",
      description: "Plataforma paga com 160+ problemas e vídeos detalhados.",
      difficulty: "intermediate",
      estimatedMinutes: 3000,
    },
  ),
  makeResource(
    "res:algo:visualgo",
    "VisuAlgo",
    "documentation",
    "algo",
    ["arrays", "linked-list", "trees", "graphs", "heap", "binary-search"],
    ["visual", "interactive", "free"],
    {
      url: "https://visualgo.net",
      description: "Visualizações animadas de algoritmos e estruturas de dados.",
      difficulty: "beginner",
      estimatedMinutes: 120,
    },
  ),
  makeResource(
    "res:algo:patterns-book",
    "Grokking the Coding Interview (Patterns)",
    "course",
    "algo",
    ["two-pointers", "sliding-window", "binary-search", "dynamic-programming"],
    ["patterns", "educative", "paid"],
    {
      url: "https://www.educative.io/courses/grokking-coding-interview",
      description: "Curso focado em padrões de resolução de problemas.",
      difficulty: "intermediate",
      estimatedMinutes: 1200,
    },
  ),
  makeResource(
    "res:algo:big-o-cheatsheet",
    "Big-O Cheat Sheet",
    "cheatsheet",
    "algo",
    ["big-o"],
    ["reference", "free"],
    {
      url: "https://www.bigocheatsheet.com",
      description: "Referência rápida de complexidades de algoritmos e estruturas.",
      difficulty: "beginner",
      estimatedMinutes: 15,
    },
  ),
  makeResource(
    "res:algo:backtracking-guide",
    "Backtracking Pattern Guide (LeetCode)",
    "article",
    "algo",
    ["dynamic-programming", "graphs"],
    ["patterns", "free"],
    {
      url: "https://leetcode.com/explore/learn/card/recursion-ii/",
      description: "Guia oficial de recursão e backtracking do LeetCode.",
      difficulty: "intermediate",
      estimatedMinutes: 90,
    },
  ),

  // ── System Design ─────────────────────────────────────────────────────────
  makeResource(
    "res:system:frontend-system-design-primer",
    "Frontend System Design Primer",
    "article",
    "system",
    ["frontend-system-design", "state-management", "caching"],
    ["must-read", "free"],
    {
      url: "https://www.greatfrontend.com/system-design",
      description: "Framework completo para responder perguntas de system design frontend.",
      difficulty: "intermediate",
      estimatedMinutes: 180,
    },
  ),
  makeResource(
    "res:system:greatfrontend",
    "GreatFrontEnd — System Design",
    "course",
    "system",
    ["frontend-system-design", "autocomplete", "infinite-scroll", "file-upload"],
    ["paid", "structured"],
    {
      url: "https://www.greatfrontend.com",
      description: "Plataforma dedicada a preparação de entrevistas frontend com system design.",
      difficulty: "intermediate",
      estimatedMinutes: 900,
    },
  ),
  makeResource(
    "res:system:alex-xu-vol1",
    "System Design Interview — Alex Xu Vol. 1",
    "book",
    "system",
    ["frontend-system-design", "caching", "observability"],
    ["book", "paid", "classic"],
    {
      description: "Livro referência de system design com exemplos de escala.",
      difficulty: "intermediate",
      estimatedMinutes: 480,
    },
  ),
  makeResource(
    "res:system:frontend-masters-sd",
    "Frontend Masters — Complete Intro to System Design",
    "course",
    "system",
    ["frontend-system-design", "state-management"],
    ["paid", "video"],
    {
      url: "https://frontendmasters.com",
      description: "Curso de system design com foco em aplicações frontend.",
      difficulty: "advanced",
      estimatedMinutes: 360,
    },
  ),
  makeResource(
    "res:system:web-vitals",
    "Web Vitals — Google",
    "documentation",
    "system",
    ["observability", "frontend-system-design"],
    ["free", "official"],
    {
      url: "https://web.dev/vitals",
      description: "Documentação oficial do Google sobre métricas de performance web.",
      difficulty: "beginner",
      estimatedMinutes: 60,
    },
  ),

  // ── JavaScript ────────────────────────────────────────────────────────────
  makeResource(
    "res:js:you-dont-know-js",
    "You Don't Know JS (série)",
    "book",
    "js",
    ["javascript", "closures", "prototypes", "event-loop", "promises"],
    ["free", "deep-dive", "classic"],
    {
      url: "https://github.com/getify/You-Dont-Know-JS",
      description: "Série gratuita de livros sobre JavaScript profundo.",
      difficulty: "intermediate",
      estimatedMinutes: 1200,
    },
  ),
  makeResource(
    "res:js:javascript-info",
    "javascript.info",
    "documentation",
    "js",
    ["javascript", "closures", "prototypes", "promises", "async-await", "event-loop"],
    ["free", "reference", "must-read"],
    {
      url: "https://javascript.info",
      description: "Tutorial completo e moderno de JavaScript, bem estruturado.",
      difficulty: "intermediate",
      estimatedMinutes: 600,
    },
  ),
  makeResource(
    "res:js:event-loop-video",
    "What the heck is the event loop? — Philip Roberts",
    "video",
    "js",
    ["event-loop"],
    ["youtube", "classic", "free"],
    {
      url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
      description: "Explicação visual clássica do event loop do JavaScript.",
      difficulty: "beginner",
      estimatedMinutes: 27,
    },
  ),
  makeResource(
    "res:js:promises-guide",
    "JavaScript Promises: an Introduction",
    "article",
    "js",
    ["promises", "async-await"],
    ["google-devs", "free"],
    {
      url: "https://web.dev/promises/",
      description: "Guia completo de Promises do Google Developers.",
      difficulty: "intermediate",
      estimatedMinutes: 45,
    },
  ),
  makeResource(
    "res:js:debounce-throttle",
    "Debounce vs Throttle — CSS Tricks",
    "article",
    "js",
    ["debounce", "throttle"],
    ["free", "practical"],
    {
      url: "https://css-tricks.com/debouncing-throttling-explained-examples/",
      description: "Explicação prática com exemplos interativos de debounce e throttle.",
      difficulty: "intermediate",
      estimatedMinutes: 20,
    },
  ),
  makeResource(
    "res:js:lydia-hallie",
    "JavaScript Visualized — Lydia Hallie",
    "article",
    "js",
    ["event-loop", "closures", "promises", "prototypes"],
    ["dev-to", "visual", "free"],
    {
      url: "https://dev.to/lydiahallie",
      description: "Série de artigos com visualizações únicas de conceitos JS.",
      difficulty: "intermediate",
      estimatedMinutes: 120,
    },
  ),

  // ── Frontend Coding ───────────────────────────────────────────────────────
  makeResource(
    "res:fe:react-docs",
    "Documentação Oficial do React",
    "documentation",
    "fe_coding",
    ["react", "frontend-coding"],
    ["official", "free", "must-read"],
    {
      url: "https://react.dev",
      description: "Documentação oficial e moderna do React com exemplos interativos.",
      difficulty: "intermediate",
      estimatedMinutes: 300,
    },
  ),
  makeResource(
    "res:fe:greatfrontend-coding",
    "GreatFrontEnd — Coding Questions",
    "exercise",
    "fe_coding",
    ["react", "javascript", "frontend-coding"],
    ["paid", "practical"],
    {
      url: "https://www.greatfrontend.com/questions/coding",
      description: "Exercícios práticos de frontend coding com feedback imediato.",
      difficulty: "intermediate",
      estimatedMinutes: 600,
    },
  ),
  makeResource(
    "res:fe:frontend-mentor",
    "Frontend Mentor",
    "exercise",
    "fe_coding",
    ["react", "frontend-coding"],
    ["free", "practical", "portfolio"],
    {
      url: "https://www.frontendmentor.io",
      description: "Desafios de frontend com designs reais para praticar.",
      difficulty: "beginner",
      estimatedMinutes: 480,
    },
  ),

  // ── Behavioral ────────────────────────────────────────────────────────────
  makeResource(
    "res:behavioral:amazon-lp",
    "Amazon Leadership Principles",
    "documentation",
    "behavioral",
    ["behavioral-star"],
    ["free", "official", "must-read"],
    {
      url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
      description: "Os 16 princípios de liderança da Amazon — base para perguntas comportamentais.",
      difficulty: "beginner",
      estimatedMinutes: 30,
    },
  ),
  makeResource(
    "res:behavioral:star-guide",
    "STAR Method Interview Guide",
    "article",
    "behavioral",
    ["behavioral-star"],
    ["free", "practical"],
    {
      url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique",
      description: "Guia prático do método STAR com exemplos.",
      difficulty: "beginner",
      estimatedMinutes: 15,
    },
  ),
  makeResource(
    "res:behavioral:crack-the-coding",
    "Cracking the Coding Interview — Behavioral Chapter",
    "book",
    "behavioral",
    ["behavioral-star"],
    ["paid", "classic"],
    {
      description: "Capítulo de behavioral do livro clássico de preparação para entrevistas.",
      difficulty: "beginner",
      estimatedMinutes: 60,
    },
  ),

  // ── Inglês Técnico ────────────────────────────────────────────────────────
  makeResource(
    "res:english:tech-vocab",
    "Technical English for Software Engineers",
    "article",
    "behavioral",
    [],
    ["english", "vocabulary", "free"],
    {
      url: "https://www.techinterviewhandbook.org/behavioral-interview/",
      description: "Vocabulário técnico e frases comuns em entrevistas de software.",
      difficulty: "beginner",
      estimatedMinutes: 60,
    },
  ),
];

type LegacyCatalogResource = {
  type: string;
  title: string;
  author?: string;
  why?: string;
  url?: string;
  priority?: string;
};

type LegacyPlanBlock = {
  duration: number;
  type: string;
  category: string | null;
  label: string;
  resource?: string;
  leetcode?: string;
  difficulty?: string;
};

const RESOURCE_TYPE_MAP: Record<string, ResourceRecord["type"]> = {
  article: "article",
  book: "book",
  course: "course",
  documentation: "documentation",
  exercise: "exercise",
  platform: "course",
  repo: "repo",
  video: "video",
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function normalizeUrl(url?: string): string | undefined {
  return url?.replace(/\/+$/, "").toLowerCase();
}

function buildResourcesFromPlan(): ResourceRecord[] {
  const catalogResources = Object.entries(RESOURCES).flatMap(([category, entries]) =>
    (entries as LegacyCatalogResource[]).map((entry) =>
      makeResource(
        `res:catalog:${category}:${slugify(entry.title)}`,
        entry.title,
        RESOURCE_TYPE_MAP[entry.type] ?? "other",
        category,
        [],
        [entry.priority, entry.author].filter((value): value is string => Boolean(value)),
        {
          url: entry.url,
          description: entry.why,
        },
      ),
    ),
  );

  const blockResources: ResourceRecord[] = [];
  for (const week of WEEKS) {
    for (const day of week.days) {
      let studyBlockIndex = 0;
      for (const rawBlock of day.blocks as LegacyPlanBlock[]) {
        if (rawBlock.category === null || rawBlock.type === "pausa") continue;

        const blockId = `block-${day.day}-${studyBlockIndex++}`;
        const url = rawBlock.leetcode ?? rawBlock.resource;
        if (!url) continue;

        blockResources.push({
          ...makeResource(
            `res:plan:${blockId}`,
            rawBlock.label,
            rawBlock.leetcode ? "exercise" : (RESOURCE_TYPE_MAP[rawBlock.type] ?? "other"),
            rawBlock.category,
            [],
            [
              "plano",
              rawBlock.type,
              rawBlock.difficulty ? `difficulty:${rawBlock.difficulty}` : undefined,
            ].filter((value): value is string => Boolean(value)),
            {
              url,
              description: `Recurso vinculado ao dia ${day.day} do plano de estudos.`,
              estimatedMinutes: rawBlock.duration,
            },
          ),
          linkedPlanBlockIds: [blockId],
        });
      }
    }
  }

  return [...catalogResources, ...blockResources];
}

function mergeResources(...groups: ResourceRecord[][]): ResourceRecord[] {
  const merged: ResourceRecord[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  for (const resource of groups.flat()) {
    const url = normalizeUrl(resource.url);
    const titleKey = `${resource.category}:${resource.title.trim().toLowerCase()}`;
    if ((url && seenUrls.has(url)) || seenTitles.has(titleKey)) continue;

    merged.push(resource);
    if (url) seenUrls.add(url);
    seenTitles.add(titleKey);
  }

  return merged;
}

export const INITIAL_RESOURCES: ResourceRecord[] = mergeResources(
  CURATED_RESOURCES,
  buildResourcesFromPlan(),
);
