import { Flag, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestionRecord } from "@/types/database";
import {
  QuizCategoryBadge,
  QuizDifficultyBadge,
  QuizStatusBadge,
  QuizTypeBadge,
} from "./quiz-badges";

export function QuestionListCard({
  question,
  isMarked,
  isWrong,
  isDue,
  onToggleMarked,
  onReview,
}: {
  question: QuizQuestionRecord;
  isMarked: boolean;
  isWrong: boolean;
  isDue: boolean;
  onToggleMarked: () => void;
  onReview?: () => void;
}) {
  return (
    <article className="bg-card hover:border-primary/30 flex flex-col justify-between rounded-xl border p-4 transition-colors">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <QuizCategoryBadge category={question.category} />
        <QuizTypeBadge type={question.type} />
        <QuizDifficultyBadge difficulty={question.difficulty} />
        {isDue && <QuizStatusBadge tone="due">Devida</QuizStatusBadge>}
        {isWrong && <QuizStatusBadge tone="wrong">Erro</QuizStatusBadge>}
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed font-medium">{question.prompt}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={isMarked ? "text-amber-500" : undefined}
          onClick={onToggleMarked}
        >
          <Flag className="h-3.5 w-3.5" aria-hidden />
          {isMarked ? "Desmarcar" : "Marcar"}
        </Button>

        {onReview && (
          <Button variant="outline" size="sm" onClick={onReview}>
            <Play className="h-3.5 w-3.5" aria-hidden />
            Revisar
          </Button>
        )}
      </div>
    </article>
  );
}
