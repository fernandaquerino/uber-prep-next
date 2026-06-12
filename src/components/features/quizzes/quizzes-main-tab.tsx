import {
  BookOpenCheck,
  Clock3,
  Download,
  FileUp,
  Play,
  RotateCcw,
  Search,
  Star,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuizQuestionFilters } from "@/lib/domain/quizzes";
import type { QuizQuestionRecord, QuizSessionRecord } from "@/types/database";
import { QuizCategoryBadge, QuizStatusBadge } from "./quiz-badges";
import {
  getQuizCategoryLabel,
  QUIZ_DIFFICULTY_LABELS,
  QUIZ_SESSION_LABELS,
  QUIZ_TYPE_LABELS,
  type QuickFilter,
} from "./quiz-labels";
import type { QuizzesData } from "./quiz-screen.types";
import { EmptyState, FilterSelect, SectionLabel } from "./quiz-shared";

export function QuizzesTab({
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

            <div className="flex flex-wrap gap-1.5">
              {data.summary.dueReviews > 0 ? (
                <QuizStatusBadge tone="due">{data.summary.dueReviews} devidas</QuizStatusBadge>
              ) : (
                <QuizStatusBadge tone="ok">Revisões em dia</QuizStatusBadge>
              )}
              {data.summary.wrongQuestions > 0 ? (
                <QuizStatusBadge tone="wrong">{data.summary.wrongQuestions} erros</QuizStatusBadge>
              ) : (
                <QuizStatusBadge tone="ok">Sem erros pendentes</QuizStatusBadge>
              )}
              {data.summary.markedQuestions > 0 && (
                <QuizStatusBadge tone="marked">
                  {data.summary.markedQuestions} marcadas
                </QuizStatusBadge>
              )}
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
                  Retomar {QUIZ_SESSION_LABELS[session.type] ?? session.type}
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
            {Object.entries(QUIZ_DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={typeFilter} onChange={setTypeFilter} ariaLabel="Filtrar por tipo">
            <option value="all">Todos os tipos</option>
            {Object.entries(QUIZ_TYPE_LABELS).map(([value, label]) => (
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
              className={
                quickFilter === value
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                  : undefined
              }
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
            {questionsByTopic.map(([topic, questions]) => (
              <TopicPracticeCard
                key={topic}
                topic={topic}
                questions={questions}
                answered={
                  questions.filter((question) => data.answeredQuestionIds.has(question.id)).length
                }
                wrong={
                  questions.filter((question) => data.wrongQuestionIds.has(question.id)).length
                }
                due={questions.filter((question) => data.dueQuestionIds.has(question.id)).length}
                onStart={() => onStartTopic(questions.map((question) => question.id))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TopicPracticeCard({
  topic,
  questions,
  answered,
  wrong,
  due,
  onStart,
}: {
  topic: string;
  questions: QuizQuestionRecord[];
  answered: number;
  wrong: number;
  due: number;
  onStart: () => void;
}) {
  const categories = [...new Set(questions.map((question) => String(question.category)))].slice(
    0,
    3,
  );

  return (
    <article className="bg-card hover:border-primary/30 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{topic}</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {questions.length} questões · {answered} respondidas
          </p>
        </div>
        <Target className="text-muted-foreground h-4 w-4" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <QuizCategoryBadge key={category} category={category} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {due > 0 && <QuizStatusBadge tone="due">{due} devidas</QuizStatusBadge>}
        {wrong > 0 && <QuizStatusBadge tone="wrong">{wrong} erros</QuizStatusBadge>}
        {due === 0 && wrong === 0 && <QuizStatusBadge tone="ok">Em dia</QuizStatusBadge>}
      </div>

      <Button variant="outline" size="sm" className="mt-4" onClick={onStart}>
        Praticar tópico
      </Button>
    </article>
  );
}
