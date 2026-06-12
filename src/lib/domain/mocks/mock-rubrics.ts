import type { RubricRating } from "@/types/database";
import type { CanonicalMockType } from "./mock.types";

export type RubricCriterionDefinition = {
  id: string;
  label: string;
  description: string;
  weight?: number;
};

export type RubricDefinition = {
  id: string;
  version: number;
  mockType: CanonicalMockType;
  criteria: RubricCriterionDefinition[];
};

export const RUBRIC_DEFINITIONS: Record<CanonicalMockType, RubricDefinition> = {
  coding: {
    id: "rubric-coding",
    version: 1,
    mockType: "coding",
    criteria: [
      {
        id: "clarified-requirements",
        label: "Clarificou requisitos",
        description: "Fez perguntas antes de codificar e confirmou o escopo.",
      },
      {
        id: "identified-pattern",
        label: "Identificou padrão",
        description: "Reconheceu two pointers, sliding window, DP, etc. antes de implementar.",
      },
      {
        id: "correct-implementation",
        label: "Implementação correta",
        description: "Solução funciona para os casos de teste apresentados.",
      },
      {
        id: "correct-complexity",
        label: "Complexidade correta",
        description: "Discutiu e atingiu a complexidade de tempo/espaço esperada.",
      },
      {
        id: "edge-cases",
        label: "Testou edge cases",
        description: "Cobriu casos como array vazio, duplicatas, números negativos, null.",
      },
      {
        id: "thinking-aloud",
        label: "Pensou em voz alta",
        description: "Comunicou abordagem e raciocínio durante toda a solução.",
      },
    ],
  },
  frontend_coding: {
    id: "rubric-frontend-coding",
    version: 1,
    mockType: "frontend_coding",
    criteria: [
      {
        id: "clarified-requirements",
        label: "Clarificou requisitos",
        description: "Perguntou sobre breakpoints, estado, acessibilidade antes de começar.",
      },
      {
        id: "component-decomposition",
        label: "Decomposição de componentes",
        description: "Identificou componentes reutilizáveis e suas responsabilidades.",
      },
      {
        id: "state-modeling",
        label: "Modelagem de estado",
        description: "Escolheu estrutura de estado adequada (local, context, server state).",
      },
      {
        id: "ui-states",
        label: "Estados da UI",
        description: "Tratou loading, empty state, error state e offline.",
      },
      {
        id: "accessibility",
        label: "Acessibilidade",
        description: "Aplicou ARIA, foco, contraste e navegação por teclado.",
      },
      {
        id: "implementation-quality",
        label: "Qualidade da implementação",
        description: "Código legível, sem prop drilling excessivo, sem anti-patterns.",
      },
      {
        id: "edge-cases",
        label: "Testes e edge cases",
        description: "Tratou inputs inválidos, estados extremos e erros.",
      },
      {
        id: "communication",
        label: "Comunicação",
        description: "Explicou decisões e trade-offs durante o desenvolvimento.",
      },
    ],
  },
  system_design: {
    id: "rubric-system-design",
    version: 1,
    mockType: "system_design",
    criteria: [
      {
        id: "functional-requirements",
        label: "Requisitos funcionais",
        description: "Clarificou e priorizou o que o sistema precisa fazer.",
      },
      {
        id: "nonfunctional-requirements",
        label: "Requisitos não funcionais",
        description: "Discutiu escala, latência, disponibilidade e consistência.",
      },
      {
        id: "architecture",
        label: "Arquitetura",
        description: "Diagrama claro com componentes, responsabilidades e fluxo de dados.",
      },
      {
        id: "data-flow",
        label: "Fluxo de dados",
        description: "Explicou como os dados fluem de ponta a ponta.",
      },
      {
        id: "api-design",
        label: "APIs",
        description: "Definiu endpoints principais com métodos, request e response.",
      },
      {
        id: "cache",
        label: "Cache",
        description: "Discutiu estratégia de cache, TTL e invalidação.",
      },
      {
        id: "pagination",
        label: "Paginação",
        description: "Escolheu cursor ou offset-based e justificou.",
      },
      {
        id: "performance",
        label: "Performance",
        description: "Identificou gargalos e soluções (CDN, denormalização, índices).",
      },
      {
        id: "ui-states",
        label: "UI States",
        description: "Tratou loading, empty, error e offline no frontend.",
      },
      {
        id: "observability",
        label: "Observabilidade",
        description: "Mencionou logs, métricas e alertas.",
      },
      {
        id: "failure-handling",
        label: "Falhas",
        description: "Discutiu o que acontece quando componentes falham.",
      },
      {
        id: "tradeoffs",
        label: "Trade-offs",
        description: "Explicou decisões descartadas e por quê.",
      },
      {
        id: "scalability",
        label: "Escalabilidade",
        description: "Discutiu como o sistema cresce com o volume.",
      },
      {
        id: "communication",
        label: "Comunicação",
        description: "Estrutura clara, perguntas adequadas, sinalização de mudanças.",
      },
    ],
  },
  behavioral: {
    id: "rubric-behavioral",
    version: 1,
    mockType: "behavioral",
    criteria: [
      {
        id: "clear-situation",
        label: "Situação clara",
        description: "Contexto estabelecido em 2 frases: produto, time, problema, stakes.",
      },
      {
        id: "personal-responsibility",
        label: "Responsabilidade pessoal",
        description: "Usou 'eu' em vez de 'nós', deixou claro sua contribuição específica.",
      },
      {
        id: "specific-action",
        label: "Ação específica",
        description: "Descreveu decisões concretas, tradeoffs e como agiu.",
      },
      {
        id: "measurable-result",
        label: "Resultado mensurável",
        description: "Incluiu métricas (%, velocidade, $, usuários afetados).",
      },
      {
        id: "learning",
        label: "Aprendizado",
        description: "Mencionou mudança de comportamento ou insight resultante.",
      },
      {
        id: "conciseness",
        label: "Concisão",
        description: "Resposta entre 90 e 180 segundos, sem divagações.",
      },
      {
        id: "communication",
        label: "Comunicação",
        description: "Assertivo, claro e em inglês fluente.",
      },
      {
        id: "star-structure",
        label: "Estrutura STAR",
        description: "Seguiu Situation → Task → Action → Result claramente.",
      },
    ],
  },
  full_loop: {
    id: "rubric-full-loop",
    version: 1,
    mockType: "full_loop",
    criteria: [
      {
        id: "coding-overall",
        label: "Coding — Geral",
        description: "Desempenho geral na etapa de coding.",
      },
      {
        id: "system-design-overall",
        label: "System Design — Geral",
        description: "Desempenho geral na etapa de system design.",
      },
      {
        id: "behavioral-overall",
        label: "Behavioral — Geral",
        description: "Desempenho geral na etapa behavioral.",
      },
      {
        id: "consistency",
        label: "Consistência",
        description: "Manteve qualidade ao longo da entrevista completa.",
      },
      {
        id: "communication",
        label: "Comunicação geral",
        description: "Clareza, estrutura e profissionalismo durante toda a sessão.",
      },
      {
        id: "adaptability",
        label: "Adaptabilidade",
        description: "Ajustou abordagem com base no feedback do entrevistador.",
      },
    ],
  },
};

export function getRubricDefinition(mockType: CanonicalMockType): RubricDefinition {
  return RUBRIC_DEFINITIONS[mockType];
}

export function createEmptyRubricResult(mockType: CanonicalMockType) {
  const definition = getRubricDefinition(mockType);
  return {
    rubricDefinitionId: definition.id,
    version: definition.version,
    criteria: definition.criteria.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      rating: 0 as RubricRating,
    })),
    score: null as number | null,
  };
}
