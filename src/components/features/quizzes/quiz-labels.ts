import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type { QuizQuestionRecord } from "@/types/database";

export const QUIZ_TYPE_LABELS: Record<string, string> = {
  single_choice: "Escolha única",
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro/Falso",
  open_text: "Resposta aberta",
  interview: "Entrevista",
};

export const QUIZ_DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
};

export const QUIZ_SESSION_LABELS: Record<string, string> = {
  daily: "Quiz diário",
  filtered: "Quiz filtrado",
  error_review: "Revisão de erros",
  due_review: "Revisões devidas",
};

export type QuickFilter = "all" | "due" | "wrong" | "marked" | "unanswered";
export type QuizTab = "quizzes" | "reviews" | "history" | "stats";
export type SessionType = "daily" | "filtered" | "error_review" | "due_review";

type QuizQuestionWithTopic = QuizQuestionRecord & { topic?: string | null };

export function answerId(sessionId: string, questionId: string): string {
  return `quiz-answer:${sessionId}:${questionId}`;
}

export function getQuizCategoryLabel(category: string | QuizQuestionRecord["category"]): string {
  return getCategoryLabel(category as QuizQuestionRecord["category"]);
}

export function getQuestionTopic(question: QuizQuestionRecord): string {
  const topic = (question as QuizQuestionWithTopic).topicIds[0]?.trim();
  return topic || "Sem tópico";
}

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

export function getAccuracyTone(accuracy: number | null): string {
  if (accuracy === null) return "border-border text-muted-foreground";
  if (accuracy >= 0.8) return "border-emerald-500/30 text-emerald-500";
  if (accuracy >= 0.55) return "border-amber-500/30 text-amber-500";
  return "border-rose-500/30 text-rose-500";
}
