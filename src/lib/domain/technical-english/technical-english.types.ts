import type {
  TechnicalEnglishRecord,
  TechnicalEnglishPracticeRecord,
  TechnicalEnglishItemType,
  TechnicalEnglishScenario,
} from "@/types/database";

export type {
  TechnicalEnglishRecord,
  TechnicalEnglishPracticeRecord,
  TechnicalEnglishItemType,
  TechnicalEnglishScenario,
};

export const TECH_ENGLISH_SCENARIO_LABELS: Record<TechnicalEnglishScenario, string> = {
  intro: "Introdução pessoal",
  coding: "Coding interview",
  system_design: "System design",
  behavioral: "Behavioral",
  pair_programming: "Pair programming",
  clarifying: "Clarifying questions",
  tradeoffs: "Trade-offs",
  feedback: "Feedback",
  general: "Geral",
};

export const TECH_ENGLISH_TYPE_LABELS: Record<TechnicalEnglishItemType, string> = {
  phrase: "Frase",
  vocabulary: "Vocabulário",
  template: "Template",
  question: "Pergunta",
  answer: "Resposta",
  scenario: "Cenário",
};

export type TechnicalEnglishFilters = {
  query?: string;
  scenario?: TechnicalEnglishScenario;
  type?: TechnicalEnglishItemType;
  isFavorite?: boolean;
  tag?: string;
  lifecycleStatus?: "active" | "archived";
};

export type CreateTechnicalEnglishInput = {
  type: TechnicalEnglishItemType;
  scenario: TechnicalEnglishScenario;
  title: string;
  content: string;
  translation?: string;
  category?: string;
  topicIds?: string[];
  tags?: string[];
};

export type UpdateTechnicalEnglishInput = Partial<CreateTechnicalEnglishInput>;

export type TechnicalEnglishPageData = {
  items: TechnicalEnglishRecord[];
  practices: TechnicalEnglishPracticeRecord[];
  allTags: string[];
  allScenarios: TechnicalEnglishScenario[];
  stats: TechnicalEnglishStats;
};

export type TechnicalEnglishStats = {
  total: number;
  practiced: number;
  favorites: number;
};
