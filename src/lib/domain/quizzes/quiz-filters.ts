import type { QuizDifficulty, QuizQuestionRecord, QuizQuestionType } from "@/types/database";

export type QuizQuestionFilters = {
  query?: string;
  category?: string;
  difficulty?: QuizDifficulty;
  type?: QuizQuestionType;
  group?: string;
  week?: number;
  tag?: string;
  markedOnly?: boolean;
  unansweredOnly?: boolean;
  wrongOnly?: boolean;
  dueOnly?: boolean;
  archivedOnly?: boolean;
};

export type QuizQuestionFilterContext = {
  markedQuestionIds?: Set<string>;
  answeredQuestionIds?: Set<string>;
  wrongQuestionIds?: Set<string>;
  dueQuestionIds?: Set<string>;
};

export function applyQuizQuestionFilters(
  questions: QuizQuestionRecord[],
  filters: QuizQuestionFilters,
  context: QuizQuestionFilterContext = {},
): QuizQuestionRecord[] {
  let result = [...questions];

  if (filters.archivedOnly) {
    result = result.filter((question) => question.lifecycleStatus === "archived");
  } else {
    result = result.filter((question) => question.lifecycleStatus === "active");
  }

  if (filters.query?.trim()) {
    const query = filters.query.trim().toLowerCase();
    result = result.filter(
      (question) =>
        question.prompt.toLowerCase().includes(query) ||
        question.tags.some((tag) => tag.includes(query)) ||
        question.topicIds.some((topic) => topic.toLowerCase().includes(query)),
    );
  }
  if (filters.category)
    result = result.filter((question) => question.category === filters.category);
  if (filters.difficulty)
    result = result.filter((question) => question.difficulty === filters.difficulty);
  if (filters.type) result = result.filter((question) => question.type === filters.type);
  if (filters.group) result = result.filter((question) => question.group === filters.group);
  if (filters.week) result = result.filter((question) => question.week === filters.week);
  if (filters.tag) result = result.filter((question) => question.tags.includes(filters.tag!));
  if (filters.markedOnly) {
    result = result.filter((question) => context.markedQuestionIds?.has(question.id));
  }
  if (filters.unansweredOnly) {
    result = result.filter((question) => !context.answeredQuestionIds?.has(question.id));
  }
  if (filters.wrongOnly) {
    result = result.filter((question) => context.wrongQuestionIds?.has(question.id));
  }
  if (filters.dueOnly) {
    result = result.filter((question) => context.dueQuestionIds?.has(question.id));
  }

  return result;
}
