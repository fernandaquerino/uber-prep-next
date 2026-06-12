import { STAR_QUESTIONS as RAW_STAR_QUESTIONS } from "./behavioral-star";

export type StarQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  focus: string;
  strongSignals: string[];
  pitfalls: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  Leadership: "Liderança",
  Conflict: "Conflito",
  Ownership: "Ownership",
  Failure: "Aprendizado com erros",
  Mentoring: "Mentoria",
  Ambiguity: "Ambiguidade",
  Impact: "Impacto",
  "Technical English": "Inglês técnico",
};

export const STAR_QUESTIONS: StarQuestion[] = RAW_STAR_QUESTIONS.map((q) => ({
  ...q,
  categoryLabel: CATEGORY_LABELS[q.category] ?? q.category,
}));

export function getStarQuestion(id: string): StarQuestion | undefined {
  return STAR_QUESTIONS.find((q) => q.id === id);
}

export function getStarQuestionsByCategory(category: string): StarQuestion[] {
  return STAR_QUESTIONS.filter((q) => q.category === category);
}
