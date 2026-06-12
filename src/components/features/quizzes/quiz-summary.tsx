import { BookOpenCheck, Flag, History, RotateCcw, Star, Target, Trophy } from "lucide-react";
import { SectionLabel } from "./quiz-shared";
import type { QuizzesData } from "./quiz-screen.types";

export function QuizSummary({ data }: { data: QuizzesData }) {
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

export function QuizSummarySection({ data }: { data: QuizzesData }) {
  return (
    <section className="space-y-3">
      <SectionLabel>Estatísticas gerais</SectionLabel>
      <QuizSummary data={data} />
    </section>
  );
}
