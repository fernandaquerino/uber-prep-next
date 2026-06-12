import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type { TimerSourceType } from "@/types/database";

export const TIMER_CATEGORY_OPTIONS = [
  "algo",
  "system",
  "js",
  "fe_coding",
  "behavioral",
  "mock",
  "general",
].map((value) => ({ value, label: getCategoryLabel(value) }));

export const TIMER_SOURCE_OPTIONS: Array<{ value: TimerSourceType; label: string }> = [
  { value: "general", label: "Geral" },
  { value: "plan_block", label: "Plano" },
  { value: "review", label: "Revisão" },
  { value: "flashcard_session", label: "Flashcards" },
  { value: "quiz_session", label: "Quiz" },
  { value: "playground_solution", label: "Playground" },
  { value: "manual", label: "Manual" },
];
