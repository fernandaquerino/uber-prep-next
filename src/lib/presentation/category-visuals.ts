export type CategoryVisualConfig = {
  key: string;
  label: string;
  badge: string;
  border: string;
  background: string;
  text: string;
  dot: string;
};

const CATEGORY_VISUALS: CategoryVisualConfig[] = [
  {
    key: "algo",
    label: "Algoritmos",
    badge:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    border: "border-l-emerald-500",
    background: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    key: "system",
    label: "System Design",
    badge:
      "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
    border: "border-l-violet-500",
    background: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  {
    key: "js",
    label: "JavaScript",
    badge:
      "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700",
    border: "border-l-pink-500",
    background: "bg-pink-50 dark:bg-pink-950/20",
    text: "text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  {
    key: "fe_coding",
    label: "Frontend Coding",
    badge:
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700",
    border: "border-l-sky-500",
    background: "bg-sky-50 dark:bg-sky-950/20",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  {
    key: "mock",
    label: "Mock Interview",
    badge:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    border: "border-l-orange-500",
    background: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  {
    key: "behavioral",
    label: "Behavioral",
    badge:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    border: "border-l-amber-500",
    background: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
];

const FALLBACK_VISUAL: CategoryVisualConfig = {
  key: "general",
  label: "Geral",
  badge: "bg-muted text-muted-foreground border-border",
  border: "border-l-border",
  background: "bg-muted/30",
  text: "text-muted-foreground",
  dot: "bg-muted-foreground",
};

/** Todas as categorias selecionáveis, com "Geral" como primeira opção. */
export function getSelectableCategoryVisuals(): CategoryVisualConfig[] {
  return [FALLBACK_VISUAL, ...CATEGORY_VISUALS];
}

export function getCategoryVisual(category: string): CategoryVisualConfig {
  return CATEGORY_VISUALS.find((c) => c.key === category) ?? FALLBACK_VISUAL;
}

export function getCategoryLabel(category: string): string {
  return getCategoryVisual(category).label;
}

export type BlockTypeConfig = {
  key: string;
  label: string;
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  teoria: "Teoria",
  exercicio: "Exercício",
  revisao: "Revisão",
  mock: "Mock",
  system: "System Design",
  js: "JavaScript",
  fe_coding: "Frontend Coding",
  behavioral: "Behavioral",
  pausa: "Pausa",
  leitura: "Leitura",
};

export function getBlockTypeLabel(type: string): string {
  return BLOCK_TYPE_LABELS[type] ?? type;
}
