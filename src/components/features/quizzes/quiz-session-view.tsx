import { Clock3, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { correctQuizAnswer } from "@/lib/domain/quizzes";
import type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizQuestionRecord,
  QuizSelfAssessment,
  QuizSessionRecord,
} from "@/types/database";
import { QuizCategoryBadge, QuizDifficultyBadge, QuizTypeBadge } from "./quiz-badges";
import { formatSeconds, QUIZ_TYPE_LABELS } from "./quiz-labels";
import { useTimerActions } from "@/hooks/use-timer-actions";

export function QuizSessionView(props: {
  session: QuizSessionRecord;
  questions: QuizQuestionRecord[];
  question: QuizQuestionRecord;
  answer?: QuizAnswerRecord;
  selectedAnswer: QuizAnswerValue | null;
  setSelectedAnswer: (answer: QuizAnswerValue | null) => void;
  draft: string;
  setDraft: (draft: string) => void;
  selfAssessment?: QuizSelfAssessment;
  setSelfAssessment: (assessment: QuizSelfAssessment | undefined) => void;
  sessionElapsed: number;
  questionElapsed: number;
  onSubmit: () => void;
  onFinish: () => void;
  onAbandon: () => void;
  isMarked: boolean;
  onToggleMarked: () => void;
}) {
  const timerActions = useTimerActions();
  const {
    session,
    questions,
    question,
    answer,
    selectedAnswer,
    setSelectedAnswer,
    draft,
    setDraft,
    selfAssessment,
    setSelfAssessment,
    sessionElapsed,
    questionElapsed,
  } = props;

  const correction = correctQuizAnswer(question, selectedAnswer, selfAssessment);
  const progress = ((session.currentIndex + 1) / questions.length) * 100;
  const isTextQuestion = question.type === "open_text" || question.type === "interview";
  const hasAnswer = isTextQuestion ? draft.trim().length > 0 : selectedAnswer !== null;
  const isLastQuestion = session.currentIndex === questions.length - 1;

  function startQuizFocus() {
    void timerActions.start({
      mode: "countdown",
      sourceType: "quiz_session",
      sourceId: session.id,
      category: question.category,
      title: `Quiz: ${question.prompt.slice(0, 60)}`,
      targetDurationSeconds: 25 * 60,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={props.onAbandon}>
            Voltar para quizzes
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={startQuizFocus}>
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              Foco
            </Button>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 font-mono text-xs">
              <span>
                {session.currentIndex + 1}/{questions.length}
              </span>
              <span>{QUIZ_TYPE_LABELS[question.type]}</span>
              <span>Total {formatSeconds(sessionElapsed)}</span>
              <span>Questão {formatSeconds(questionElapsed)}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <section className="bg-card rounded-xl border p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <QuizCategoryBadge category={question.category} />
              <QuizDifficultyBadge difficulty={question.difficulty} />
              <QuizTypeBadge type={question.type} />
            </div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Questão {session.currentIndex + 1}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={props.onToggleMarked}
            className={props.isMarked ? "text-amber-500" : undefined}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            {props.isMarked ? "Marcada" : "Marcar"}
          </Button>
        </div>

        <h1 className="text-xl leading-relaxed font-semibold sm:text-2xl">{question.prompt}</h1>

        {question.code && (
          <pre className="bg-background mt-5 overflow-x-auto rounded-lg border p-4 text-sm leading-relaxed">
            <code>{question.code}</code>
          </pre>
        )}
      </section>

      <QuestionAnswerControl
        question={question}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        draft={draft}
        setDraft={setDraft}
        selfAssessment={selfAssessment}
        setSelfAssessment={setSelfAssessment}
      />

      {answer?.isSubmitted && (
        <div className="bg-muted/30 rounded-xl border p-4 text-sm">
          <p className="font-medium">
            {answer.score === 1 ? "Resposta correta" : "Revise este ponto"}
          </p>
          {question.explanation && (
            <p className="text-muted-foreground mt-1">{question.explanation}</p>
          )}
        </div>
      )}

      <footer className="flex flex-wrap justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={props.onFinish}>
          Finalizar agora
        </Button>
        <Button
          onClick={props.onSubmit}
          disabled={!hasAnswer || (correction.requiresSelfAssessment && !selfAssessment)}
        >
          {isLastQuestion ? "Responder e finalizar" : "Responder e avançar"}
        </Button>
      </footer>
    </div>
  );
}

function QuestionAnswerControl(props: {
  question: QuizQuestionRecord;
  selectedAnswer: QuizAnswerValue | null;
  setSelectedAnswer: (answer: QuizAnswerValue | null) => void;
  draft: string;
  setDraft: (draft: string) => void;
  selfAssessment?: QuizSelfAssessment;
  setSelfAssessment: (assessment: QuizSelfAssessment | undefined) => void;
}) {
  const { question } = props;

  if (question.type === "open_text" || question.type === "interview") {
    return (
      <section className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quiz-open-answer">Sua resposta</Label>
          <Textarea
            id="quiz-open-answer"
            value={props.draft}
            onChange={(event) => props.setDraft(event.target.value)}
            rows={7}
            placeholder="Escreva sua resposta..."
            className="resize-y"
          />
        </div>

        {question.referenceAnswer && (
          <details className="bg-card rounded-xl border p-4 text-sm">
            <summary className="cursor-pointer font-medium">Ver resposta de referência</summary>
            <p className="text-muted-foreground mt-3 leading-relaxed">{question.referenceAnswer}</p>
          </details>
        )}

        <fieldset className="grid gap-2 sm:grid-cols-3">
          <legend className="mb-1 text-sm font-medium">Autoavaliação</legend>
          {(
            [
              ["incorrect", "Não consegui"],
              ["partial", "Parcial"],
              ["correct", "Boa resposta"],
            ] as Array<[QuizSelfAssessment, string]>
          ).map(([value, label]) => {
            const isSelected = props.selfAssessment === value;

            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
                  isSelected ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="self-assessment"
                  checked={isSelected}
                  onChange={() => props.setSelfAssessment(value)}
                  className="accent-primary"
                />
                {label}
              </label>
            );
          })}
        </fieldset>
      </section>
    );
  }

  if (question.type === "multiple_choice") {
    const selected =
      props.selectedAnswer?.kind === "multiple"
        ? new Set(props.selectedAnswer.optionIds)
        : new Set<string>();

    return (
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">
          Selecione todas as alternativas corretas
        </legend>
        {question.options?.map((option) => {
          const isSelected = selected.has(option.id);

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "bg-card hover:bg-muted/40"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(event) => {
                  const next = new Set(selected);

                  if (event.target.checked) next.add(option.id);
                  else next.delete(option.id);

                  props.setSelectedAnswer({
                    kind: "multiple",
                    optionIds: Array.from(next),
                  });
                }}
                className="accent-primary mt-0.5"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">Escolha uma alternativa</legend>
      {question.options?.map((option) => {
        const isSelected =
          props.selectedAnswer?.kind === "single" && props.selectedAnswer.optionId === option.id;

        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
              isSelected ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted/40"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={isSelected}
              onChange={() =>
                props.setSelectedAnswer({
                  kind: "single",
                  optionId: option.id,
                })
              }
              className="accent-primary mt-0.5"
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
