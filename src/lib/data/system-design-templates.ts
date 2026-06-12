export type SystemDesignTemplateSection = {
  id: string;
  title: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  order: number;
};

export type SystemDesignTemplateData = {
  id: string;
  version: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  sections: SystemDesignTemplateSection[];
  checklist: string[];
};

const SHARED_SECTIONS: SystemDesignTemplateSection[] = [
  {
    id: "functional-requirements",
    title: "Requisitos funcionais",
    description: "O que o sistema precisa fazer? Liste as features prioritárias.",
    placeholder:
      "Ex: Usuários podem criar posts; Feed exibe posts de seguidos; Suporte a imagens.",
    required: true,
    order: 1,
  },
  {
    id: "nonfunctional-requirements",
    title: "Requisitos não funcionais",
    description: "Escala, latência, disponibilidade, consistência, segurança.",
    placeholder:
      "Ex: 100M usuários; latência p99 < 200ms; disponibilidade 99,9%; consistência eventual.",
    required: true,
    order: 2,
  },
  {
    id: "entities",
    title: "Entidades e modelo de dados",
    description: "Principais entidades, atributos-chave e relacionamentos.",
    placeholder: "Ex: User(id, name, email), Post(id, userId, content, createdAt)",
    order: 3,
  },
  {
    id: "api-design",
    title: "Design de APIs",
    description: "Endpoints principais: método, path, request/response.",
    placeholder:
      "GET /feed?cursor=&limit=20 → { items: Post[], nextCursor: string }\nPOST /posts { content, mediaUrl? } → { postId }",
    order: 4,
  },
  {
    id: "architecture",
    title: "Arquitetura e fluxo de dados",
    description: "Diagrama textual dos componentes: client, gateway, services, databases, cache.",
    placeholder: "Client → CDN → API Gateway → Feed Service → Redis (cache) → Postgres (storage)",
    required: true,
    order: 5,
  },
  {
    id: "ui-states",
    title: "Estados da UI",
    description: "Loading, empty state, error state, offline, otimismo.",
    placeholder:
      "Loading: skeleton de 3 cards; Empty: 'Siga pessoas para ver posts'; Error: banner com retry",
    order: 6,
  },
  {
    id: "pagination",
    title: "Paginação e carregamento",
    description: "Estratégia de paginação: cursor, offset, infinite scroll, virtualização.",
    placeholder:
      "Cursor-based pagination (postId como cursor); IntersectionObserver para infinite scroll; react-window para virtualização acima de 500 itens",
    order: 7,
  },
  {
    id: "cache-performance",
    title: "Cache, prefetch e performance",
    description: "Onde e como cachear. TTL, invalidação, estratégia de prefetch.",
    placeholder:
      "Redis com TTL 60s para feed; stale-while-revalidate; prefetch próxima página em background",
    order: 8,
  },
  {
    id: "edge-cases",
    title: "Race conditions, duplicatas e stale data",
    description: "Problemas de concorrência, idempotência, deduplificação.",
    placeholder:
      "Deduplicação por requestId; optimistic lock para likes; debounce de 300ms em busca",
    order: 9,
  },
  {
    id: "observability",
    title: "Observabilidade e métricas",
    description: "Logs, métricas, alertas, tracing.",
    placeholder:
      "Métrica: latência de feed por percentil; alerta: p99 > 500ms; log: userId + traceId em cada request",
    order: 10,
  },
  {
    id: "tradeoffs",
    title: "Trade-offs e alternativas",
    description: "O que foi descartado e por quê.",
    placeholder:
      "Push vs Pull model: escolhemos pull por simplicidade inicial, trade-off é latência maior para cold reads",
    order: 11,
  },
];

export const SYSTEM_DESIGN_TEMPLATES: SystemDesignTemplateData[] = [
  {
    id: "sdt-infinite-feed",
    version: 1,
    title: "Feed Infinito",
    description:
      "Sistema de feed estilo Twitter/Instagram com scroll infinito, seguindo/seguidores e ranking cronológico.",
    difficulty: "medium",
    tags: ["feed", "pagination", "scroll", "social"],
    sections: [
      ...SHARED_SECTIONS,
      {
        id: "fanout-strategy",
        title: "Estratégia de fanout",
        description: "Push vs Pull vs Híbrido para distribuição de posts.",
        placeholder:
          "Pull para usuários com muitos seguidores (celebridades); Push para contas comuns",
        order: 12,
      },
    ],
    checklist: [
      "Clarificou requisitos e escala antes de desenhar",
      "Estimou volume de leitura vs escrita",
      "Definiu modelo de dados antes de APIs",
      "Discutiu fanout strategy",
      "Tratou estados da UI (loading, error, empty)",
      "Considerou paginação cursor-based",
      "Discutiu cache e invalidação",
      "Mencionou observabilidade",
      "Explicou trade-offs principais",
    ],
  },
  {
    id: "sdt-autocomplete",
    version: 1,
    title: "Autocomplete / Type-ahead",
    description:
      "Widget de sugestões em tempo real enquanto o usuário digita. Foco em latência, relevância e UX.",
    difficulty: "easy",
    tags: ["search", "autocomplete", "typeahead", "frontend"],
    sections: [
      {
        id: "functional-requirements",
        title: "Requisitos funcionais",
        description: "O que o autocomplete precisa fazer?",
        placeholder:
          "Sugestões enquanto o usuário digita; máximo de 5-10 resultados; clique seleciona e fecha",
        required: true,
        order: 1,
      },
      {
        id: "nonfunctional-requirements",
        title: "Requisitos não funcionais",
        description: "Latência, volume, acessibilidade, mobile.",
        placeholder: "Resposta < 100ms; suporte a teclado; funcionar em mobile; A11y ARIA",
        required: true,
        order: 2,
      },
      {
        id: "architecture",
        title: "Arquitetura",
        description: "Client-side vs server-side. Onde vive o índice?",
        placeholder:
          "Client: Trie em memória para datasets pequenos; Server: Elasticsearch ou Redis Sorted Set para grande volume",
        required: true,
        order: 3,
      },
      {
        id: "api-design",
        title: "API de busca",
        description: "Contrato da API de sugestões.",
        placeholder:
          "GET /autocomplete?q=reac&limit=5 → { suggestions: [{id, label, metadata}] }",
        order: 4,
      },
      {
        id: "debounce-cancellation",
        title: "Debounce e cancelamento",
        description: "Como evitar requisições em excesso e race conditions.",
        placeholder:
          "Debounce de 200ms; AbortController para cancelar requisição anterior; resultado de request antiga ignorado",
        required: true,
        order: 5,
      },
      {
        id: "ui-states",
        title: "Estados da UI",
        description: "Loading, empty, erro, seleção por teclado.",
        placeholder:
          "Loading: spinner inline; Empty: 'Sem resultados para X'; Erro: não mostrar dropdown; Teclado: ↑↓ navega, Enter seleciona, Esc fecha",
        order: 6,
      },
      {
        id: "cache-performance",
        title: "Cache e performance",
        description: "Cache de queries recentes, virtual list para muitos resultados.",
        placeholder:
          "Map<query, results> com LRU; evict após 5min; virtual list apenas se > 20 resultados",
        order: 7,
      },
      {
        id: "accessibility",
        title: "Acessibilidade",
        description: "ARIA, teclado, screen reader.",
        placeholder:
          "role=combobox, aria-autocomplete=list, aria-expanded, aria-activedescendant; role=option em cada item",
        required: true,
        order: 8,
      },
      {
        id: "tradeoffs",
        title: "Trade-offs",
        description: "Prefix match vs fuzzy. Client vs server index.",
        placeholder:
          "Prefix match: simples, rápido, não tolera typos; Fuzzy: mais complexo, melhor UX; Client: zero latência mas dataset limitado",
        order: 9,
      },
    ],
    checklist: [
      "Clarificou tamanho do dataset e volume de queries",
      "Definiu estratégia client vs server",
      "Implementou debounce e cancelamento",
      "Tratou estados de loading, empty e erro",
      "Adicionou navegação por teclado",
      "Aplicou ARIA corretamente",
      "Discutiu cache de queries recentes",
      "Mencionou fuzzy match vs prefix match",
    ],
  },
  {
    id: "sdt-analytics-dashboard",
    version: 1,
    title: "Analytics Dashboard",
    description:
      "Dashboard de métricas em tempo real com gráficos, filtros, exportação e múltiplos usuários simultâneos.",
    difficulty: "hard",
    tags: ["analytics", "charts", "realtime", "dashboard"],
    sections: [
      ...SHARED_SECTIONS,
      {
        id: "data-aggregation",
        title: "Agregação de dados",
        description: "OLAP vs OLTP. Pre-aggregate vs query-time.",
        placeholder:
          "ClickHouse para queries OLAP; pre-aggregate métricas de D-1; time-series em InfluxDB para real-time",
        order: 12,
      },
      {
        id: "realtime-updates",
        title: "Atualizações em tempo real",
        description: "WebSocket vs SSE vs polling.",
        placeholder:
          "SSE para push de métricas a cada 30s; WebSocket se < 100 clientes simultâneos; polling como fallback",
        order: 13,
      },
    ],
    checklist: [
      "Clarificou dimensões e granularidade das métricas",
      "Separou real-time de histórico",
      "Discutiu pre-aggregation vs query-time",
      "Tratou múltiplos usuários simultâneos",
      "Definiu estratégia de cache por time range",
      "Considerou exportação (CSV, PDF)",
      "Tratou estados da UI (loading, empty, erro)",
      "Mencionou permissionamento por tenant",
      "Discutiu escalabilidade do pipeline de ingestão",
    ],
  },
  {
    id: "sdt-realtime-chat",
    version: 1,
    title: "Chat em Tempo Real",
    description:
      "Sistema de mensagens 1:1 e grupos com entrega garantida, indicadores de leitura e histórico.",
    difficulty: "hard",
    tags: ["chat", "websocket", "realtime", "messaging"],
    sections: [
      {
        id: "functional-requirements",
        title: "Requisitos funcionais",
        description: "Features do chat.",
        placeholder:
          "Envio de texto; grupos; indicadores de entrega e leitura; histórico; notificações push",
        required: true,
        order: 1,
      },
      {
        id: "nonfunctional-requirements",
        title: "Requisitos não funcionais",
        description: "Latência, escala, garantia de entrega.",
        placeholder:
          "Entrega garantida (at-least-once); latência < 100ms; 1B mensagens/dia; offline queue",
        required: true,
        order: 2,
      },
      {
        id: "architecture",
        title: "Arquitetura",
        description: "WebSocket servers, message broker, storage.",
        placeholder:
          "Client ↔ WebSocket Server (stateful) ↔ Kafka ↔ Message Storage (Cassandra) + notification service",
        required: true,
        order: 3,
      },
      {
        id: "entities",
        title: "Modelo de dados",
        description: "Entidades e schema.",
        placeholder:
          "Message(id, roomId, senderId, content, status, timestamp)\nRoom(id, type, participants[])\nReadReceipt(userId, roomId, lastReadMessageId)",
        order: 4,
      },
      {
        id: "message-ordering",
        title: "Ordenação e idempotência",
        description: "Como garantir ordem e evitar duplicatas.",
        placeholder:
          "Vector clocks ou Lamport timestamps; clientMessageId para idempotência; sequenceNumber por room",
        required: true,
        order: 5,
      },
      {
        id: "offline-sync",
        title: "Offline e sincronização",
        description: "Fila offline, reconexão e sync de estado.",
        placeholder:
          "Queue local (IndexedDB); reconnect exponential backoff; sync de messages pendentes ao reconectar",
        order: 6,
      },
      {
        id: "ui-states",
        title: "Estados da UI",
        description: "Loading, connecting, offline, erro, entregue, lido.",
        placeholder:
          "Connecting: spinner com retry manual; Offline: banner amarelo + queue local; status de mensagem: sending→sent→delivered→read",
        order: 7,
      },
      {
        id: "notifications",
        title: "Notificações push",
        description: "Quando enviar, payload, deep link.",
        placeholder:
          "Web Push API para desktop; Firebase FCM para mobile; payload: remetente + preview truncado + roomId",
        order: 8,
      },
      {
        id: "tradeoffs",
        title: "Trade-offs",
        description: "Consistency vs availability. At-least-once vs exactly-once.",
        placeholder:
          "Escolhemos at-least-once (mais simples) com dedup no client; trade-off é lógica de dedup no frontend",
        order: 9,
      },
    ],
    checklist: [
      "Clarificou escala e tipos de entrega garantida",
      "Definiu modelo de dados com ordenação",
      "Discutiu WebSocket vs SSE vs polling",
      "Tratou offline e reconexão",
      "Implementou idempotência de mensagens",
      "Definiu estratégia de notificações push",
      "Tratou estados da UI (connecting, offline, lido)",
      "Discutiu sharding por roomId",
      "Mencionou observabilidade de entrega",
    ],
  },
];

export function getSystemDesignTemplate(id: string): SystemDesignTemplateData | undefined {
  return SYSTEM_DESIGN_TEMPLATES.find((t) => t.id === id);
}
