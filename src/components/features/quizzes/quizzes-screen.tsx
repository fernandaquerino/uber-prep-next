"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/feedback/error-state";
import { useQuizActions } from "@/hooks/use-quiz-actions";
import { useQuizzes } from "@/hooks/use-quizzes";
import { applyQuizQuestionFilters, type QuizQuestionFilters } from "@/lib/domain/quizzes";
import type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizQuestionRecord,
  QuizSelfAssessment,
  QuizSessionRecord,
} from "@/types/database";
import { playTimerDing } from "@/lib/utils/timerSound";
import { HistoryTab } from "./quiz-history-tab";
import {
  answerId,
  getQuestionTopic,
  getQuizCategoryLabel,
  type QuickFilter,
  type QuizTab,
  type SessionType,
} from "./quiz-labels";
import { ReviewsTab } from "./quiz-reviews-tab";
import { QuizzesSkeleton } from "./quiz-shared";
import { QuizSessionView } from "./quiz-session-view";
import { StatsTab } from "./quiz-stats-tab";
import { QuizTabs } from "./quiz-tabs";
import { QuizzesTab } from "./quizzes-main-tab";

export function QuizzesScreen() {
  const { data, isLoading, isRefreshing, error, refresh } = useQuizzes();
  const actions = useQuizActions(refresh);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const questionStartedAtRef = useRef<number | null>(null);

  const [tab, setTab] = useState<QuizTab>("quizzes");
  const [filters, setFilters] = useState<QuizQuestionFilters>({});
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeSession, setActiveSession] = useState<QuizSessionRecord | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Map<string, QuizAnswerRecord>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerValue | null>(null);
  const [draft, setDraft] = useState("");
  const [selfAssessment, setSelfAssessment] = useState<QuizSelfAssessment>();
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);

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

    return applyQuizQuestionFilters(data.questions, effectiveFilters, filterContext).filter(
      (question) => {
        if (categoryFilter !== "all" && String(question.category) !== categoryFilter) return false;
        if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) return false;
        if (typeFilter !== "all" && question.type !== typeFilter) return false;
        return true;
      },
    );
  }, [categoryFilter, data, difficultyFilter, effectiveFilters, filterContext, typeFilter]);

  const questionById = useMemo(
    () => new Map(data?.questions.map((question) => [question.id, question]) ?? []),
    [data],
  );

  const categoryOptions = useMemo(() => {
    if (!data) return [];

    return [...new Set(data.questions.map((question) => String(question.category)))].sort((a, b) =>
      getQuizCategoryLabel(a).localeCompare(getQuizCategoryLabel(b)),
    );
  }, [data]);

  const questionsByTopic = useMemo(() => {
    const grouped = new Map<string, QuizQuestionRecord[]>();

    for (const question of filteredQuestions) {
      const topic = getQuestionTopic(question);
      const current = grouped.get(topic) ?? [];
      current.push(question);
      grouped.set(topic, current);
    }

    return [...grouped.entries()].sort(([topicA], [topicB]) =>
      topicA.localeCompare(topicB, "pt-BR"),
    );
  }, [filteredQuestions]);

  const sessionQuestions = useMemo(
    () =>
      activeSession?.questionIds
        .map((id) => questionById.get(id))
        .filter((question): question is QuizQuestionRecord => Boolean(question)) ?? [],
    [activeSession, questionById],
  );

  const currentQuestion = activeSession ? sessionQuestions[activeSession.currentIndex] : undefined;

  const currentAnswer =
    activeSession && currentQuestion
      ? localAnswers.get(answerId(activeSession.id, currentQuestion.id))
      : undefined;

  const activeSessionId = activeSession?.id;

  useEffect(() => {
    if (!activeSessionId) return;

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      if (sessionStartedAtRef.current) {
        setSessionElapsed(Math.max(0, Math.round((now - sessionStartedAtRef.current) / 1000)));
      }

      if (questionStartedAtRef.current) {
        setQuestionElapsed(Math.max(0, Math.round((now - questionStartedAtRef.current) / 1000)));
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeSessionId]);

  function startSessionTimers() {
    const now = Date.now();

    sessionStartedAtRef.current = now;
    questionStartedAtRef.current = now;
    setSessionElapsed(0);
    setQuestionElapsed(0);
  }

  function resetQuestionState() {
    setSelectedAnswer(null);
    setDraft("");
    setSelfAssessment(undefined);
    questionStartedAtRef.current = Date.now();
    setQuestionElapsed(0);
  }

  function resetActiveSession() {
    sessionStartedAtRef.current = null;
    questionStartedAtRef.current = null;
    setActiveSession(null);
    setLocalAnswers(new Map());
    setSelectedAnswer(null);
    setDraft("");
    setSelfAssessment(undefined);
    setSessionElapsed(0);
    setQuestionElapsed(0);
  }

  async function startSession(type: SessionType, questionIds?: string[]) {
    const session = await actions.createSession({
      type,
      limit: type === "daily" ? 10 : 12,
      filters:
        type === "daily"
          ? {}
          : type === "error_review"
            ? { wrongOnly: true }
            : type === "due_review"
              ? { dueOnly: true }
              : effectiveFilters,
      questionIds:
        questionIds ??
        (type === "filtered" ? filteredQuestions.map((question) => question.id) : undefined),
    });

    if (!session || session.questionIds.length === 0) return;

    startSessionTimers();
    setActiveSession(session);
    setLocalAnswers(new Map());
    setSelectedAnswer(null);
    setDraft("");
    setSelfAssessment(undefined);
  }

  function startQuestionReview(questionId: string) {
    void startSession("filtered", [questionId]);
  }

  function startQuestionsReview(questionIds: string[]) {
    const uniqueQuestionIds = [...new Set(questionIds)];
    if (uniqueQuestionIds.length === 0) return;

    void startSession("filtered", uniqueQuestionIds);
  }

  function resumeSession(session: QuizSessionRecord) {
    const sessionAnswers = data?.answers.filter((answer) => answer.sessionId === session.id) ?? [];

    startSessionTimers();
    setActiveSession(session);
    setLocalAnswers(new Map(sessionAnswers.map((answer) => [answer.id, answer])));
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

    const isLastQuestion = activeSession.currentIndex >= activeSession.questionIds.length - 1;

    const result = await actions.saveAnswer({
      sessionId: activeSession.id,
      questionId: currentQuestion.id,
      answer,
      draft,
      selfAssessment,
      timeSeconds: questionElapsed,
    });

    if (!result) return;

    setLocalAnswers((current) => new Map(current).set(result.id, result));

    if (isLastQuestion) {
      await actions.finishSession(activeSession.id);
      resetActiveSession();
      playTimerDing();
      setTab("stats");
      return;
    }

    setActiveSession((current) =>
      current
        ? {
            ...current,
            currentIndex: current.currentIndex + 1,
          }
        : current,
    );
    resetQuestionState();
  }

  async function finishSession() {
    if (!activeSession) return;

    await actions.finishSession(activeSession.id);
    resetActiveSession();
    setTab("stats");
  }

  async function abandonSession() {
    if (!activeSession) return;

    await actions.abandonSession(activeSession.id);
    resetActiveSession();
  }

  async function toggleMarked(questionId: string) {
    if (data?.markedQuestionIds.has(questionId)) {
      await actions.unmarkQuestion(questionId);
      return;
    }

    await actions.markQuestion(questionId);
  }

  async function handleExport() {
    const exported = await actions.exportQuestions();
    if (!exported) return;

    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
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

    try {
      await actions.importQuestions(JSON.parse(await file.text()) as unknown);
    } finally {
      event.target.value = "";
    }
  }

  if (isLoading) return <QuizzesSkeleton />;

  if (error) {
    return <ErrorState title="Erro ao carregar quizzes" description={error} onRetry={refresh} />;
  }

  if (!data) return null;

  if (activeSession && currentQuestion) {
    return (
      <QuizSessionView
        session={activeSession}
        questions={sessionQuestions}
        question={currentQuestion}
        answer={currentAnswer}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        draft={draft}
        setDraft={setDraft}
        selfAssessment={selfAssessment}
        setSelfAssessment={setSelfAssessment}
        sessionElapsed={sessionElapsed}
        questionElapsed={questionElapsed}
        onSubmit={() => void submitCurrentAnswer()}
        onFinish={() => void finishSession()}
        onAbandon={() => void abandonSession()}
        isMarked={data.markedQuestionIds.has(currentQuestion.id)}
        onToggleMarked={() => void toggleMarked(currentQuestion.id)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
            <p className="text-muted-foreground text-sm">
              Pratique conceitos, revise erros e acompanhe sua evolução.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isRefreshing}
            aria-label="Atualizar quizzes"
          >
            <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
          </Button>
        </div>
        <Separator />
      </header>

      {actions.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {actions.error}
        </p>
      )}

      <QuizTabs activeTab={tab} onChange={setTab} dueCount={data.summary.dueReviews} />

      {tab === "quizzes" && (
        <QuizzesTab
          data={data}
          filters={filters}
          setFilters={setFilters}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryOptions={categoryOptions}
          questionsByTopic={questionsByTopic}
          filteredQuestions={filteredQuestions}
          onStartDaily={() => void startSession("daily")}
          onStartFiltered={() => void startSession("filtered")}
          onStartErrors={() => void startSession("error_review")}
          onStartDue={() => void startSession("due_review")}
          onStartTopic={(questionIds) => void startSession("filtered", questionIds)}
          onResume={resumeSession}
          onImport={() => fileInputRef.current?.click()}
          onExport={() => void handleExport()}
        />
      )}

      {tab === "reviews" && (
        <ReviewsTab
          data={data}
          questionById={questionById}
          onStartDue={() => void startSession("due_review")}
          onStartErrors={() => void startSession("error_review")}
          onReviewQuestion={startQuestionReview}
          onToggleMarked={(questionId) => void toggleMarked(questionId)}
        />
      )}

      {tab === "history" && (
        <HistoryTab
          data={data}
          questionById={questionById}
          onReviewQuestions={startQuestionsReview}
        />
      )}

      {tab === "stats" && <StatsTab data={data} />}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleImport}
      />
    </div>
  );
}
