import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { cn } from "@/lib/utils";
import type { QuizQuestionRecord } from "@/types/database";
import { getQuizCategoryLabel, QUIZ_DIFFICULTY_LABELS, QUIZ_TYPE_LABELS } from "./quiz-labels";

const STATUS_BADGE_CLASSES = {
  due: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  wrong: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  marked: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  correct: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  partial: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
} as const;

export type QuizStatusTone = keyof typeof STATUS_BADGE_CLASSES;

export function QuizCategoryBadge({
  category,
  className,
}: {
  category: string | QuizQuestionRecord["category"];
  className?: string;
}) {
  const visual = getCategoryVisual(String(category));

  return (
    <Badge variant="outline" className={cn(visual.badge, className)}>
      {getQuizCategoryLabel(category)}
    </Badge>
  );
}

export function QuizDifficultyBadge({
  difficulty,
}: {
  difficulty: QuizQuestionRecord["difficulty"];
}) {
  return <Badge variant="outline">{QUIZ_DIFFICULTY_LABELS[difficulty] ?? difficulty}</Badge>;
}

export function QuizTypeBadge({ type }: { type: QuizQuestionRecord["type"] }) {
  return <Badge variant="outline">{QUIZ_TYPE_LABELS[type] ?? type}</Badge>;
}

export function QuizStatusBadge({ tone, children }: { tone: QuizStatusTone; children: ReactNode }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASSES[tone]}>
      {children}
    </Badge>
  );
}
