import { BookOpenCheck, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestionRecord } from "@/types/database";
import { QuestionListCard } from "./quiz-question-card";
import type { QuizzesData } from "./quiz-screen.types";
import { EmptyState, SectionLabel } from "./quiz-shared";

export function ReviewsTab({
  data,
  questionById,
  onStartDue,
  onStartErrors,
  onReviewQuestion,
  onToggleMarked,
}: {
  data: QuizzesData;
  questionById: Map<string, QuizQuestionRecord>;
  onStartDue: () => void;
  onStartErrors: () => void;
  onReviewQuestion: (questionId: string) => void;
  onToggleMarked: (questionId: string) => void;
}) {
  const dueQuestions = [...data.dueQuestionIds]
    .map((id) => questionById.get(id))
    .filter((question): question is QuizQuestionRecord => Boolean(question));

  const wrongQuestions = [...data.wrongQuestionIds]
    .filter((id) => !data.dueQuestionIds.has(id))
    .map((id) => questionById.get(id))
    .filter((question): question is QuizQuestionRecord => Boolean(question));

  if (dueQuestions.length === 0 && wrongQuestions.length === 0) {
    return (
      <div className="space-y-4">
        <ReviewRuleNote />
        <EmptyState
          title="Nenhuma revisão pendente"
          description="Seus erros e revisões devidas aparecerão aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewRuleNote />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Revisões devidas</SectionLabel>
            <p className="text-muted-foreground text-sm">
              Questões cujo agendamento de revisão é hoje ou já passou.
            </p>
          </div>
          <Button onClick={onStartDue} disabled={dueQuestions.length === 0}>
            <Play className="h-4 w-4" aria-hidden />
            Revisar pendentes
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {dueQuestions.map((question) => (
            <QuestionListCard
              key={question.id}
              question={question}
              isMarked={data.markedQuestionIds.has(question.id)}
              isWrong={data.wrongQuestionIds.has(question.id)}
              isDue
              onToggleMarked={() => onToggleMarked(question.id)}
              onReview={() => onReviewQuestion(question.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Erros recentes</SectionLabel>
            <p className="text-muted-foreground text-sm">
              Questões erradas que ainda não chegaram na data agendada.
            </p>
          </div>
          <Button variant="outline" onClick={onStartErrors} disabled={wrongQuestions.length === 0}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Refazer erros
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {wrongQuestions.map((question) => (
            <QuestionListCard
              key={question.id}
              question={question}
              isMarked={data.markedQuestionIds.has(question.id)}
              isWrong
              isDue={false}
              onToggleMarked={() => onToggleMarked(question.id)}
              onReview={() => onReviewQuestion(question.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewRuleNote() {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm">
      <div className="flex items-start gap-3">
        <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
        <p className="text-muted-foreground">
          Erro ou resposta parcial agenda revisão para o dia seguinte. Acerto segue o ciclo espaçado
          de 1, 3, 7, 14 e 30 dias. A questão aparece como devida quando a data agendada é hoje ou
          anterior.
        </p>
      </div>
    </div>
  );
}
