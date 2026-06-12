import { useMemo } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizAnswerRecord, QuizQuestionRecord } from "@/types/database";
import { QuizCategoryBadge, QuizStatusBadge } from "./quiz-badges";
import { getAccuracyTone, QUIZ_SESSION_LABELS } from "./quiz-labels";
import type { QuizzesData } from "./quiz-screen.types";
import { EmptyState, SectionLabel } from "./quiz-shared";

export function HistoryTab({
  data,
  questionById,
  onReviewQuestions,
}: {
  data: QuizzesData;
  questionById: Map<string, QuizQuestionRecord>;
  onReviewQuestions: (questionIds: string[]) => void;
}) {
  const sessions = useMemo(() => {
    const grouped = new Map<string, QuizAnswerRecord[]>();

    for (const answer of data.answers) {
      if (!answer.isSubmitted) continue;

      const current = grouped.get(answer.sessionId) ?? [];
      current.push(answer);
      grouped.set(answer.sessionId, current);
    }

    return [...grouped.entries()]
      .map(([sessionId, answers]) => {
        const session = data.sessions.find((item) => item.id === sessionId);
        const correct = answers.filter((answer) => answer.score === 1).length;
        const wrongQuestionIds = answers
          .filter((answer) => (answer.score ?? 0) < 1)
          .map((answer) => answer.questionId);
        const total = answers.length;

        return {
          sessionId,
          session,
          answers,
          correct,
          total,
          wrongQuestionIds: [...new Set(wrongQuestionIds)],
          accuracy: total > 0 ? correct / total : null,
        };
      })
      .reverse();
  }, [data.answers, data.sessions]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Nenhum histórico ainda"
        description="As sessões respondidas aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel>Histórico de respostas</SectionLabel>

      {sessions.map((session, index) => (
        <article key={session.sessionId} className="bg-card rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                className={`font-mono text-2xl font-semibold ${
                  getAccuracyTone(session.accuracy).split(" ")[1]
                }`}
              >
                {session.accuracy === null ? "-" : `${Math.round(session.accuracy * 100)}%`}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {QUIZ_SESSION_LABELS[session.session?.type ?? ""] ??
                  `Sessão ${sessions.length - index}`}{" "}
                · {session.correct}/{session.total} respostas corretas
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {session.wrongQuestionIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewQuestions(session.wrongQuestionIds)}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Revisar erros da sessão
                </Button>
              )}
              <QuizStatusBadge tone={session.wrongQuestionIds.length > 0 ? "wrong" : "ok"}>
                {session.wrongQuestionIds.length > 0
                  ? `${session.wrongQuestionIds.length} erros`
                  : "Em dia"}
              </QuizStatusBadge>
            </div>
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium">Ver respostas da sessão</summary>
            <div className="mt-3 space-y-2 border-t pt-3">
              {session.answers.map((answer) => (
                <HistoryAnswerRow
                  key={answer.id}
                  answer={answer}
                  question={questionById.get(answer.questionId)}
                  onReview={() => onReviewQuestions([answer.questionId])}
                />
              ))}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}

function HistoryAnswerRow({
  answer,
  question,
  onReview,
}: {
  answer: QuizAnswerRecord;
  question?: QuizQuestionRecord;
  onReview: () => void;
}) {
  const needsReview = (answer.score ?? 0) < 1;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="line-clamp-2 text-sm font-medium">{question?.prompt ?? "Questão removida"}</p>
        {question && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <QuizCategoryBadge category={question.category} />
            <QuizStatusBadge tone={needsReview ? "wrong" : "correct"}>
              {needsReview ? "Erro" : "Correta"}
            </QuizStatusBadge>
          </div>
        )}
      </div>

      {needsReview && question && (
        <Button variant="outline" size="sm" className="shrink-0" onClick={onReview}>
          <Play className="h-3.5 w-3.5" aria-hidden />
          Revisar
        </Button>
      )}
    </div>
  );
}
