"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Download, FileUp, Flag, Play, RefreshCw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/feedback/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { useQuizActions } from "@/hooks/use-quiz-actions";
import { useQuizzes } from "@/hooks/use-quizzes";
import {
  applyQuizQuestionFilters,
  correctQuizAnswer,
  type QuizQuestionFilters,
} from "@/lib/domain/quizzes";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizQuestionRecord,
  QuizSelfAssessment,
  QuizSessionRecord,
} from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  single_choice: "Escolha única",
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro/Falso",
  open_text: "Resposta aberta",
  interview: "Interview",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
};

type QuickFilter = "all" | "due" | "wrong" | "marked" | "unanswered";

function answerId(sessionId: string, questionId: string): string {
  return `quiz-answer:${sessionId}:${questionId}`;
}

export function QuizzesScreen() {
  const { data, isLoading, isRefreshing, error, refresh } = useQuizzes();
  const actions = useQuizActions(refresh);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<QuizQuestionFilters>({});
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [activeSession, setActiveSession] = useState<QuizSessionRecord | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Map<string, QuizAnswerRecord>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerValue | null>(null);
  const [draft, setDraft] = useState("");
  const [selfAssessment, setSelfAssessment] = useState<QuizSelfAssessment | undefined>();

  const filterContext = useMemo(
    () => ({
      markedQuestionIds: data?.markedQuestionIds,
      answeredQuestionIds: data?.answeredQuestionIds,
      wrongQuestionIds: data?.wrongQuestionIds,
      dueQuestionIds: data?.dueQuestionIds,
    }),
    [data],
  );

  const effectiveFilters = useMemo<QuizQuestionFilters>(() => {
    if (quickFilter === "due") return { ...filters, dueOnly: true };
    if (quickFilter === "wrong") return { ...filters, wrongOnly: true };
    if (quickFilter === "marked") return { ...filters, markedOnly: true };
    if (quickFilter === "unanswered") return { ...filters, unansweredOnly: true };
    return filters;
  }, [filters, quickFilter]);

  const filteredQuestions = useMemo(() => {
    if (!data) return [];
    return applyQuizQuestionFilters(data.questions, effectiveFilters, filterContext);
  }, [data, effectiveFilters, filterContext]);

  const questionById = useMemo(
    () => new Map(data?.questions.map((question) => [question.id, question]) ?? []),
    [data],
  );

  const sessionQuestions = activeSession?.questionIds
    .map((id) => questionById.get(id))
    .filter((question): question is QuizQuestionRecord => Boolean(question));
  const currentQuestion = activeSession
    ? sessionQuestions?.[activeSession.currentIndex]
    : undefined;
  const currentAnswer =
    activeSession && currentQuestion
      ? localAnswers.get(answerId(activeSession.id, currentQuestion.id))
      : undefined;

  async function startSession(type: "daily" | "filtered" | "error_review" | "due_review") {
    const session = await actions.createSession({
      type,
      limit: type === "daily" ? 10 : 12,
      filters:
        type === "error_review"
          ? { wrongOnly: true }
          : type === "due_review"
            ? { dueOnly: true }
            : effectiveFilters,
      questionIds:
        type === "filtered" ? filteredQuestions.map((question) => question.id) : undefined,
    });
    if (session) {
      setActiveSession(session);
      setLocalAnswers(new Map());
      resetQuestionState();
    }
  }

  function resumeSession(session: QuizSessionRecord) {
    setActiveSession(session);
    const sessionAnswers = data?.answers.filter((answer) => answer.sessionId === session.id) ?? [];
    setLocalAnswers(new Map(sessionAnswers.map((answer) => [answer.id, answer])));
    resetQuestionState();
  }

  function resetQuestionState() {
    setSelectedAnswer(null);
    setDraft("");
    setSelfAssessment(undefined);
  }

  async function submitCurrentAnswer() {
    if (!activeSession || !currentQuestion) return;
    const answer =
      currentQuestion.type === "open_text" || currentQuestion.type === "interview"
        ? ({ kind: "text", value: draft } satisfies QuizAnswerValue)
        : selectedAnswer;
    const result = await actions.saveAnswer({
      sessionId: activeSession.id,
      questionId: currentQuestion.id,
      answer,
      draft,
      selfAssessment,
      timeSeconds: 0,
    });
    if (result) {
      setLocalAnswers((current) => new Map(current).set(result.id, result));
      setActiveSession((current) =>
        current
          ? {
              ...current,
              currentIndex: Math.min(current.currentIndex + 1, current.questionIds.length - 1),
            }
          : current,
      );
      resetQuestionState();
    }
  }

  async function finishSession() {
    if (!activeSession) return;
    await actions.finishSession(activeSession.id);
    setActiveSession(null);
    setLocalAnswers(new Map());
  }

  async function abandonSession() {
    if (!activeSession) return;
    await actions.abandonSession(activeSession.id);
    setActiveSession(null);
    setLocalAnswers(new Map());
  }

  async function toggleMarked(questionId: string) {
    if (data?.markedQuestionIds.has(questionId)) {
      await actions.unmarkQuestion(questionId);
    } else {
      await actions.markQuestion(questionId);
    }
  }

  async function handleExport() {
    const exported = await actions.exportQuestions();
    if (!exported) return;
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `uber-prep-quizzes-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await actions.importQuestions(JSON.parse(await file.text()) as unknown);
    event.target.value = "";
  }

  if (isLoading) return <QuizzesSkeleton />;
  if (error)
    return <ErrorState title="Erro ao carregar quizzes" description={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="Quizzes"
          description="Pratique conceitos, revise erros e acompanhe sua evolução."
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={refresh}
          disabled={isRefreshing}
          aria-label="Atualizar"
        >
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
        </Button>
      </div>

      {actions.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {actions.error}
        </p>
      )}

      <QuizSummary data={data} />

      <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Star className="text-primary h-4 w-4" aria-hidden />
            <h2 className="text-sm font-semibold">Quiz diário</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            10 questões determinísticas para hoje, priorizando vencidas, erradas e marcadas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => void startSession("daily")}>
              <Play className="h-4 w-4" aria-hidden />
              Começar diário
            </Button>
            {data.inProgressSessions.map((session) => (
              <Button key={session.id} variant="outline" onClick={() => resumeSession(session)}>
                Retomar {session.type}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold">Ações de prática</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void startSession("filtered")}>
              Nova sessão
            </Button>
            <Button variant="outline" onClick={() => void startSession("error_review")}>
              Revisar erros
            </Button>
            <Button variant="outline" onClick={() => void startSession("due_review")}>
              Revisões devidas
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4" aria-hidden />
              Importar
            </Button>
            <Button variant="outline" onClick={() => void handleExport()}>
              <Download className="h-4 w-4" aria-hidden />
              Exportar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={handleImport}
            />
          </div>
        </div>
      </section>

      {activeSession && currentQuestion && (
        <QuizSessionPanel
          session={activeSession}
          questions={sessionQuestions ?? []}
          question={currentQuestion}
          answer={currentAnswer}
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          draft={draft}
          setDraft={setDraft}
          selfAssessment={selfAssessment}
          setSelfAssessment={setSelfAssessment}
          onSubmit={() => void submitCurrentAnswer()}
          onFinish={() => void finishSession()}
          onAbandon={() => void abandonSession()}
          isMarked={data.markedQuestionIds.has(currentQuestion.id)}
          onToggleMarked={() => void toggleMarked(currentQuestion.id)}
        />
      )}

      <section className="rounded-lg border p-4">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Banco de questões</h2>
            <p className="text-muted-foreground text-sm">
              {filteredQuestions.length} questões encontradas
            </p>
          </div>
          <QuizFilters
            filters={filters}
            setFilters={setFilters}
            quickFilter={quickFilter}
            setQuickFilter={setQuickFilter}
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuestions.slice(0, 36).map((question) => (
            <QuestionListCard
              key={question.id}
              question={question}
              isMarked={data.markedQuestionIds.has(question.id)}
              isWrong={data.wrongQuestionIds.has(question.id)}
              isDue={data.dueQuestionIds.has(question.id)}
              onToggleMarked={() => void toggleMarked(question.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function QuizSummary({ data }: { data: NonNullable<ReturnType<typeof useQuizzes>["data"]> }) {
  const accuracyLabel =
    data.summary.accuracy === null ? "Dados insuf." : `${Math.round(data.summary.accuracy * 100)}%`;
  const items = [
    ["Questões ativas", data.summary.activeQuestions],
    ["Respondidas", data.summary.answeredQuestions],
    ["Acurácia", accuracyLabel],
    ["Revisões devidas", data.summary.dueReviews],
    ["Erradas", data.summary.wrongQuestions],
    ["Marcadas", data.summary.markedQuestions],
    ["Sessões concluídas", data.summary.completedSessions],
  ];
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
      {items.map(([label, value]) => (
        <div key={label} className="bg-card rounded-lg border p-3">
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-muted-foreground text-xs">{label}</p>
        </div>
      ))}
    </section>
  );
}

function QuizFilters({
  filters,
  setFilters,
  quickFilter,
  setQuickFilter,
}: {
  filters: QuizQuestionFilters;
  setFilters: (filters: QuizQuestionFilters) => void;
  quickFilter: QuickFilter;
  setQuickFilter: (filter: QuickFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        value={filters.query ?? ""}
        onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        placeholder="Buscar..."
        className="h-8 w-44"
      />
      {(["all", "due", "wrong", "marked", "unanswered"] as const).map((filter) => (
        <Button
          key={filter}
          variant={quickFilter === filter ? "secondary" : "outline"}
          size="sm"
          onClick={() => setQuickFilter(filter)}
        >
          {filter === "all"
            ? "Todas"
            : filter === "due"
              ? "Devidas"
              : filter === "wrong"
                ? "Erradas"
                : filter === "marked"
                  ? "Marcadas"
                  : "Não respondidas"}
        </Button>
      ))}
    </div>
  );
}

function QuestionListCard({
  question,
  isMarked,
  isWrong,
  isDue,
  onToggleMarked,
}: {
  question: QuizQuestionRecord;
  isMarked: boolean;
  isWrong: boolean;
  isDue: boolean;
  onToggleMarked: () => void;
}) {
  return (
    <article className="rounded-lg border p-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Badge variant="outline">{getCategoryLabel(question.category)}</Badge>
        <Badge variant="outline">{TYPE_LABELS[question.type]}</Badge>
        <Badge variant="outline">{DIFFICULTY_LABELS[question.difficulty]}</Badge>
        {isDue && <Badge variant="outline">Devida</Badge>}
        {isWrong && <Badge variant="outline">Erro</Badge>}
      </div>
      <p className="line-clamp-3 text-sm font-medium">{question.prompt}</p>
      <Button variant="ghost" size="sm" className="mt-2" onClick={onToggleMarked}>
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {isMarked ? "Desmarcar" : "Marcar"}
      </Button>
    </article>
  );
}

function QuizSessionPanel(props: {
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
  onSubmit: () => void;
  onFinish: () => void;
  onAbandon: () => void;
  isMarked: boolean;
  onToggleMarked: () => void;
}) {
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
  } = props;
  const correction = correctQuizAnswer(question, selectedAnswer, selfAssessment);
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            Questão {session.currentIndex + 1} de {questions.length}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="outline">{getCategoryLabel(question.category)}</Badge>
            <Badge variant="outline">{TYPE_LABELS[question.type]}</Badge>
            <Badge variant="outline">{DIFFICULTY_LABELS[question.difficulty]}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={props.onToggleMarked}>
            <Flag className="h-3.5 w-3.5" aria-hidden />
            {props.isMarked ? "Desmarcada" : "Marcar"}
          </Button>
          <Button variant="outline" size="sm" onClick={props.onAbandon}>
            Sair
          </Button>
          <Button size="sm" onClick={props.onFinish}>
            Finalizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-muted/20 rounded-lg border p-4">
          <p className="text-base font-medium">{question.prompt}</p>
          {question.code && (
            <pre className="bg-background mt-3 overflow-x-auto rounded-md p-3 text-xs">
              {question.code}
            </pre>
          )}
        </div>

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
          <div className="bg-muted/30 rounded-lg border p-3 text-sm">
            <p className="font-medium">
              {answer.score === 1 ? "Resposta correta" : "Revise este ponto"}
            </p>
            {question.explanation && (
              <p className="text-muted-foreground mt-1">{question.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={props.onSubmit}
            disabled={correction.requiresSelfAssessment && !selfAssessment}
          >
            Responder e avançar
          </Button>
        </div>
      </div>
    </section>
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
      <div className="grid gap-3">
        <Label htmlFor="quiz-open-answer">Sua resposta</Label>
        <Textarea
          id="quiz-open-answer"
          value={props.draft}
          onChange={(event) => props.setDraft(event.target.value)}
          rows={6}
        />
        {question.referenceAnswer && (
          <details className="rounded-lg border p-3 text-sm">
            <summary className="cursor-pointer font-medium">Resposta de referência</summary>
            <p className="text-muted-foreground mt-2">{question.referenceAnswer}</p>
          </details>
        )}
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-1 text-sm font-medium">Autoavaliação</legend>
          {[
            ["incorrect", "Não consegui"],
            ["partial", "Parcial"],
            ["correct", "Boa resposta"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name="self-assessment"
                checked={props.selfAssessment === value}
                onChange={() => props.setSelfAssessment(value as QuizSelfAssessment)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
    );
  }

  if (question.type === "multiple_choice") {
    const selected =
      props.selectedAnswer?.kind === "multiple"
        ? new Set(props.selectedAnswer.optionIds)
        : new Set<string>();
    return (
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Selecione todas as corretas</legend>
        {question.options?.map((option) => (
          <label key={option.id} className="flex items-start gap-2 rounded-md border p-3 text-sm">
            <input
              type="checkbox"
              checked={selected.has(option.id)}
              onChange={(event) => {
                const next = new Set(selected);
                if (event.target.checked) next.add(option.id);
                else next.delete(option.id);
                props.setSelectedAnswer({ kind: "multiple", optionIds: Array.from(next) });
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">Escolha uma opção</legend>
      {question.options?.map((option) => (
        <label key={option.id} className="flex items-start gap-2 rounded-md border p-3 text-sm">
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={
              props.selectedAnswer?.kind === "single" && props.selectedAnswer.optionId === option.id
            }
            onChange={() => props.setSelectedAnswer({ kind: "single", optionId: option.id })}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

function QuizzesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-14 w-80" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-36" />
      <Skeleton className="h-96" />
    </div>
  );
}
