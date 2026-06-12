"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Clock3,
  Download,
  FileUp,
  Flag,
  History,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { playTimerDing } from "@/lib/utils/timerSound";

const TYPE_LABELS: Record<string, string> = {
  single_choice: "Escolha única",
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro/Falso",
  open_text: "Resposta aberta",
  interview: "Entrevista",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
};

const SESSION_LABELS: Record<string, string> = {
  daily: "Quiz diário",
  filtered: "Quiz filtrado",
  error_review: "Revisão de erros",
  due_review: "Revisões devidas",
};

type QuickFilter = "all" | "due" | "wrong" | "marked" | "unanswered";
type QuizTab = "quizzes" | "reviews" | "history" | "stats";
type SessionType = "daily" | "filtered" | "error_review" | "due_review";
type QuizzesData = NonNullable<ReturnType<typeof useQuizzes>["data"]>;
type QuizQuestionWithTopic = QuizQuestionRecord & { topic?: string | null };

function answerId(sessionId: string, questionId: string): string {
  return `quiz-answer:${sessionId}:${questionId}`;
}

function getQuizCategoryLabel(category: string | QuizQuestionRecord["category"]): string {
  return getCategoryLabel(category as QuizQuestionRecord["category"]);
}

function getQuestionTopic(question: QuizQuestionRecord): string {
  const topic = (question as QuizQuestionWithTopic).topicIds[0]?.trim();
  return topic || "Sem tópico";
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function getAccuracyTone(accuracy: number | null): string {
  if (accuracy === null) return "border-border text-muted-foreground";
  if (accuracy >= 0.8) return "border-emerald-500/30 text-emerald-500";
  if (accuracy >= 0.55) return "border-amber-500/30 text-amber-500";
  return "border-rose-500/30 text-rose-500";
}

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

    console.log({ data });

    return applyQuizQuestionFilters(data.questions, effectiveFilters, filterContext).filter(
      (question) => {
        if (categoryFilter !== "all" && String(question.category) !== categoryFilter) {
          return false;
        }

        if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) {
          return false;
        }

        if (typeFilter !== "all" && question.type !== typeFilter) {
          return false;
        }

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

    if (!session) return;

    startSessionTimers();
    setActiveSession(session);
    setLocalAnswers(new Map());
    setSelectedAnswer(null);
    setDraft("");
    setSelfAssessment(undefined);
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
          onToggleMarked={(questionId) => void toggleMarked(questionId)}
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
          onToggleMarked={(questionId) => void toggleMarked(questionId)}
        />
      )}

      {tab === "history" && <HistoryTab data={data} questionById={questionById} />}

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

function QuizTabs({
  activeTab,
  onChange,
  dueCount,
}: {
  activeTab: QuizTab;
  onChange: (tab: QuizTab) => void;
  dueCount: number;
}) {
  const tabs: Array<{
    id: QuizTab;
    label: string;
    icon: typeof Sparkles;
  }> = [
    { id: "quizzes", label: "Quizzes", icon: Sparkles },
    { id: "reviews", label: `Revisões (${dueCount})`, icon: RotateCcw },
    { id: "history", label: "Histórico", icon: History },
    { id: "stats", label: "Estatísticas", icon: BarChart3 },
  ];

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Seções de quizzes">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => onChange(item.id)}
            aria-pressed={isActive}
            className={
              isActive
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : undefined
            }
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}

function QuizzesTab({
  data,
  filters,
  setFilters,
  quickFilter,
  setQuickFilter,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  typeFilter,
  setTypeFilter,
  categoryOptions,
  questionsByTopic,
  filteredQuestions,
  onStartDaily,
  onStartFiltered,
  onStartErrors,
  onStartDue,
  onStartTopic,
  onResume,
  onToggleMarked,
  onImport,
  onExport,
}: {
  data: QuizzesData;
  filters: QuizQuestionFilters;
  setFilters: (filters: QuizQuestionFilters) => void;
  quickFilter: QuickFilter;
  setQuickFilter: (filter: QuickFilter) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (difficulty: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  categoryOptions: string[];
  questionsByTopic: Array<[string, QuizQuestionRecord[]]>;
  filteredQuestions: QuizQuestionRecord[];
  onStartDaily: () => void;
  onStartFiltered: () => void;
  onStartErrors: () => void;
  onStartDue: () => void;
  onStartTopic: (questionIds: string[]) => void;
  onResume: (session: QuizSessionRecord) => void;
  onToggleMarked: (questionId: string) => void;
  onImport: () => void;
  onExport: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="via-background to-background rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
                <Star className="h-4 w-4" aria-hidden />
              </div>
              <SectionLabel className="mb-0 text-sky-500">Daily Quiz</SectionLabel>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Quiz diário de hoje</h2>
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                10 questões priorizando revisões vencidas, erros recentes e perguntas marcadas.
                Tempo estimado de 10 a 15 minutos.
              </p>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <span>{data.summary.dueReviews} revisões devidas</span>
              <span>{data.summary.wrongQuestions} questões erradas</span>
              <span>{data.summary.markedQuestions} marcadas</span>
            </div>
          </div>

          <Button onClick={onStartDaily} size="lg" className="shrink-0">
            <Play className="h-4 w-4" aria-hidden />
            Iniciar Daily Quiz
          </Button>
        </div>

        {data.inProgressSessions.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Sessões em andamento
            </p>
            <div className="flex flex-wrap gap-2">
              {data.inProgressSessions.map((session) => (
                <Button
                  key={session.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onResume(session)}
                >
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  Retomar {SESSION_LABELS[session.type] ?? session.type}
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionLabel>Filtros</SectionLabel>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative flex items-center sm:col-span-2 xl:col-span-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={filters.query ?? ""}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="Buscar questão..."
              className="min-h-10 pl-9"
            />
          </div>

          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            ariaLabel="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {getQuizCategoryLabel(category)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            ariaLabel="Filtrar por dificuldade"
          >
            <option value="all">Todas as dificuldades</option>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={typeFilter} onChange={setTypeFilter} ariaLabel="Filtrar por tipo">
            <option value="all">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todas"],
              ["due", "Devidas"],
              ["wrong", "Erradas"],
              ["marked", "Marcadas"],
              ["unanswered", "Não respondidas"],
            ] as Array<[QuickFilter, string]>
          ).map(([value, label]) => (
            <Button
              key={value}
              variant={quickFilter === value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Ações de prática</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onStartFiltered} disabled={filteredQuestions.length === 0}>
            <Play className="h-4 w-4" aria-hidden />
            Iniciar quiz filtrado
          </Button>
          <Button
            variant="outline"
            onClick={onStartErrors}
            disabled={data.summary.wrongQuestions === 0}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Refazer erros
          </Button>
          <Button variant="outline" onClick={onStartDue} disabled={data.summary.dueReviews === 0}>
            <BookOpenCheck className="h-4 w-4" aria-hidden />
            Revisões devidas
          </Button>
          <Button variant="outline" onClick={onImport}>
            <FileUp className="h-4 w-4" aria-hidden />
            Importar
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4" aria-hidden />
            Exportar
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Questões disponíveis</SectionLabel>
            <p className="text-muted-foreground text-sm">
              {filteredQuestions.length} questões em {questionsByTopic.length} tópicos
            </p>
          </div>
        </div>

        {questionsByTopic.length === 0 ? (
          <EmptyState
            title="Nenhuma questão encontrada"
            description="Ajuste os filtros para encontrar outras questões."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {questionsByTopic.map(([topic, questions]) => {
              const answered = questions.filter((question) =>
                data.answeredQuestionIds.has(question.id),
              ).length;
              const wrong = questions.filter((question) =>
                data.wrongQuestionIds.has(question.id),
              ).length;
              const due = questions.filter((question) =>
                data.dueQuestionIds.has(question.id),
              ).length;

              return (
                <article
                  key={topic}
                  className="bg-card hover:border-primary/30 rounded-xl border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{topic}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {questions.length} questões · {answered} respondidas
                      </p>
                    </div>
                    <Target className="text-muted-foreground h-4 w-4" aria-hidden />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {due > 0 && <Badge variant="outline">{due} devidas</Badge>}
                    {wrong > 0 && <Badge variant="outline">{wrong} erros</Badge>}
                    {due === 0 && wrong === 0 && <Badge variant="outline">Em dia</Badge>}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => onStartTopic(questions.map((question) => question.id))}
                  >
                    Praticar tópico
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewsTab({
  data,
  questionById,
  onStartDue,
  onStartErrors,
  onToggleMarked,
}: {
  data: QuizzesData;
  questionById: Map<string, QuizQuestionRecord>;
  onStartDue: () => void;
  onStartErrors: () => void;
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
      <EmptyState
        title="Nenhuma revisão pendente"
        description="Seus erros e revisões devidas aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Revisões devidas</SectionLabel>
            <p className="text-muted-foreground text-sm">
              Questões que já estão no momento de serem revisadas.
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
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Erros recentes</SectionLabel>
            <p className="text-muted-foreground text-sm">
              Questões erradas que ainda não entraram na revisão devida.
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
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function HistoryTab({
  data,
  questionById,
}: {
  data: QuizzesData;
  questionById: Map<string, QuizQuestionRecord>;
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
        const correct = answers.filter((answer) => answer.score === 1).length;
        const total = answers.length;

        return {
          sessionId,
          answers,
          correct,
          total,
          accuracy: total > 0 ? correct / total : null,
        };
      })
      .reverse();
  }, [data.answers]);

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
                {session.accuracy === null ? "—" : `${Math.round(session.accuracy * 100)}%`}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Sessão {sessions.length - index} · {session.correct}/{session.total} respostas
                corretas
              </p>
            </div>
            <Badge variant="outline">{session.total} questões</Badge>
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium">Ver respostas da sessão</summary>
            <div className="mt-3 space-y-2 border-t pt-3">
              {session.answers.map((answer) => {
                const question = questionById.get(answer.questionId);

                return (
                  <div
                    key={answer.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="line-clamp-2 text-sm font-medium">
                        {question?.prompt ?? "Questão removida"}
                      </p>
                      {question && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {getQuizCategoryLabel(question.category)}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        answer.score === 1
                          ? "border-emerald-500/30 text-emerald-500"
                          : "border-rose-500/30 text-rose-500"
                      }
                    >
                      {answer.score === 1 ? "Correta" : "Revisar"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}

function StatsTab({ data }: { data: QuizzesData }) {
  const categoryStats = useMemo(() => {
    const answersByQuestion = new Map<string, QuizAnswerRecord[]>();

    for (const answer of data.answers) {
      if (!answer.isSubmitted) continue;
      const current = answersByQuestion.get(answer.questionId) ?? [];
      current.push(answer);
      answersByQuestion.set(answer.questionId, current);
    }

    const grouped = new Map<
      string,
      { category: string; total: number; correct: number; questions: number }
    >();

    for (const question of data.questions) {
      const category = String(question.category);
      const answers = answersByQuestion.get(question.id) ?? [];
      const current = grouped.get(category) ?? {
        category,
        total: 0,
        correct: 0,
        questions: 0,
      };

      current.questions += 1;
      current.total += answers.length;
      current.correct += answers.filter((answer) => answer.score === 1).length;
      grouped.set(category, current);
    }

    return [...grouped.values()]
      .map((item) => ({
        ...item,
        accuracy: item.total > 0 ? item.correct / item.total : null,
      }))
      .sort((a, b) =>
        getQuizCategoryLabel(a.category).localeCompare(getQuizCategoryLabel(b.category)),
      );
  }, [data.answers, data.questions]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionLabel>Estatísticas gerais</SectionLabel>
        <QuizSummary data={data} />
      </section>

      <section className="space-y-3">
        <div>
          <SectionLabel>Heatmap de conhecimento</SectionLabel>
          <p className="text-muted-foreground text-sm">
            Desempenho calculado a partir das respostas registradas por categoria.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categoryStats.map((item) => (
            <article
              key={item.category}
              className={`bg-card rounded-xl border p-4 ${
                getAccuracyTone(item.accuracy).split(" ")[0]
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{getQuizCategoryLabel(item.category)}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {item.questions} questões · {item.total} respostas
                  </p>
                </div>
                <Trophy className="text-muted-foreground h-4 w-4" aria-hidden />
              </div>

              <p
                className={`mt-5 font-mono text-3xl font-semibold ${
                  getAccuracyTone(item.accuracy).split(" ")[1]
                }`}
              >
                {item.accuracy === null ? "Sem dados" : `${Math.round(item.accuracy * 100)}%`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuizSummary({ data }: { data: QuizzesData }) {
  const accuracyLabel =
    data.summary.accuracy === null ? "Dados insuf." : `${Math.round(data.summary.accuracy * 100)}%`;

  const items = [
    {
      label: "Questões ativas",
      value: data.summary.activeQuestions,
      icon: Target,
    },
    {
      label: "Respondidas",
      value: data.summary.answeredQuestions,
      icon: BookOpenCheck,
    },
    { label: "Acurácia", value: accuracyLabel, icon: Trophy },
    {
      label: "Revisões devidas",
      value: data.summary.dueReviews,
      icon: RotateCcw,
    },
    {
      label: "Erradas",
      value: data.summary.wrongQuestions,
      icon: Flag,
    },
    {
      label: "Marcadas",
      value: data.summary.markedQuestions,
      icon: Star,
    },
    {
      label: "Sessões concluídas",
      value: data.summary.completedSessions,
      icon: History,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.label} className="bg-card rounded-xl border p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xl font-semibold">{item.value}</p>
              <Icon className="text-muted-foreground h-4 w-4" aria-hidden />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{item.label}</p>
          </article>
        );
      })}
    </div>
  );
}

function QuizSessionView(props: {
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={props.onAbandon}>
            Voltar para quizzes
          </Button>

          <div className="text-muted-foreground flex flex-wrap items-center gap-3 font-mono text-xs">
            <span>
              {session.currentIndex + 1}/{questions.length}
            </span>
            <span>{TYPE_LABELS[question.type]}</span>
            <span>Total {formatSeconds(sessionElapsed)}</span>
            <span>Questão {formatSeconds(questionElapsed)}</span>
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
              <Badge variant="outline">{getQuizCategoryLabel(question.category)}</Badge>
              <Badge variant="outline">
                {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
              </Badge>
              <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>
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
    <article className="bg-card hover:border-primary/30 rounded-xl border p-4 transition-colors">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge variant="outline">{getQuizCategoryLabel(question.category)}</Badge>
        <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>
        <Badge variant="outline">
          {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
        </Badge>
        {isDue && (
          <Badge variant="outline" className="border-amber-500/30 text-amber-500">
            Devida
          </Badge>
        )}
        {isWrong && (
          <Badge variant="outline" className="border-rose-500/30 text-rose-500">
            Erro
          </Badge>
        )}
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed font-medium">{question.prompt}</p>

      <Button
        variant="ghost"
        size="sm"
        className={isMarked ? "mt-3 text-amber-500" : "mt-3"}
        onClick={onToggleMarked}
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {isMarked ? "Desmarcar" : "Marcar"}
      </Button>
    </article>
  );
}

function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px]"
    >
      {children}
    </select>
  );
}

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-muted-foreground mb-2 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase ${className}`}
    >
      {children}
    </p>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}

function QuizzesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-14 w-80" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-28" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    </div>
  );
}
