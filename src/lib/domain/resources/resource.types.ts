import type {
  ResourceRecord,
  ResourceProgressRecord,
  ResourceStatus,
  ResourceType,
  ResourceDifficulty,
} from "@/types/database";

export type {
  ResourceRecord,
  ResourceProgressRecord,
  ResourceStatus,
  ResourceType,
  ResourceDifficulty,
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  article: "Artigo",
  video: "Vídeo",
  course: "Curso",
  documentation: "Documentação",
  book: "Livro",
  exercise: "Exercício",
  repo: "Repositório",
  cheatsheet: "Cheatsheet",
  other: "Outro",
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
  saved_for_later: "Salvo para depois",
  archived: "Arquivado",
};

export const RESOURCE_DIFFICULTY_LABELS: Record<ResourceDifficulty, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export type ResourceFilters = {
  query?: string;
  category?: string;
  type?: ResourceType;
  difficulty?: ResourceDifficulty;
  status?: ResourceStatus;
  topicId?: string;
  tag?: string;
  isFavorite?: boolean;
  lifecycleStatus?: "active" | "archived";
};

export type ResourceSortKey =
  | "recent"
  | "title"
  | "difficulty"
  | "status"
  | "estimated"
  | "last_opened";

export type CreateResourceInput = {
  title: string;
  description?: string;
  url?: string;
  type: ResourceType;
  category: string;
  topicIds?: string[];
  tags?: string[];
  difficulty?: ResourceDifficulty;
  estimatedMinutes?: number;
  linkedPlanBlockIds?: string[];
};

export type UpdateResourceInput = {
  title?: string;
  description?: string;
  url?: string;
  type?: ResourceType;
  category?: string;
  topicIds?: string[];
  tags?: string[];
  difficulty?: ResourceDifficulty;
  estimatedMinutes?: number;
  linkedPlanBlockIds?: string[];
  linkedNoteIds?: string[];
};

export type ResourceWithProgress = {
  resource: ResourceRecord;
  progress: ResourceProgressRecord | undefined;
};

export type ResourcePageData = {
  items: ResourceWithProgress[];
  allTags: string[];
  allCategories: string[];
  allTopicIds: string[];
  stats: ResourceStats;
};

export type ResourceStats = {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  favorites: number;
};
