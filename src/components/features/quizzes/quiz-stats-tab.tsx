import { useMemo } from "react";
import { Trophy } from "lucide-react";
import type { QuizAnswerRecord } from "@/types/database";
import { QuizCategoryBadge } from "./quiz-badges";
import { getAccuracyTone, getQuizCategoryLabel } from "./quiz-labels";
import type { QuizzesData } from "./quiz-screen.types";
import { SectionLabel } from "./quiz-shared";
import { QuizSummarySection } from "./quiz-summary";

export function StatsTab({ data }: { data: QuizzesData }) {
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
      <QuizSummarySection data={data} />

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
                  <QuizCategoryBadge category={item.category} />
                  <p className="text-muted-foreground mt-2 text-xs">
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
