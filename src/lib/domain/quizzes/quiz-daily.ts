import type { CalendarDate } from "@/lib/domain/schedule";
import type { QuizQuestionRecord } from "@/types/database";

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function buildDeterministicDailyQuestionIds(
  questions: QuizQuestionRecord[],
  date: CalendarDate,
  limit = 10,
  priorityQuestionIds: string[] = [],
): string[] {
  const active = questions.filter((question) => question.lifecycleStatus === "active");
  const byId = new Map(active.map((question) => [question.id, question]));
  const selected: string[] = [];

  for (const id of priorityQuestionIds) {
    if (selected.length >= limit) break;
    if (byId.has(id) && !selected.includes(id)) selected.push(id);
  }

  const remaining = active
    .filter((question) => !selected.includes(question.id))
    .sort((a, b) => hash(`${date}:${a.id}`) - hash(`${date}:${b.id}`));

  for (const question of remaining) {
    if (selected.length >= limit) break;
    selected.push(question.id);
  }

  return selected;
}
