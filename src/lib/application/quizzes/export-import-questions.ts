import type { UberPrepDatabase } from "@/lib/db/schema";
import type { QuizQuestionRecord } from "@/types/database";
import { validateQuizQuestion } from "@/lib/domain/quizzes";

export type QuizQuestionsExport = {
  version: 1;
  exportedAt: string;
  questions: QuizQuestionRecord[];
};

export type QuizImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export async function exportQuestions(db: UberPrepDatabase): Promise<QuizQuestionsExport> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    questions: await db.quizQuestions.toArray(),
  };
}

export async function importQuestions(
  db: UberPrepDatabase,
  data: unknown,
): Promise<QuizImportResult> {
  if (
    typeof data !== "object" ||
    data === null ||
    !("questions" in data) ||
    !Array.isArray((data as { questions?: unknown }).questions)
  ) {
    throw new Error("Formato de importação de quizzes inválido.");
  }

  const result: QuizImportResult = { imported: 0, skipped: 0, errors: [] };
  const payload = data as QuizQuestionsExport;
  const now = new Date().toISOString();

  for (const question of payload.questions) {
    const existing = await db.quizQuestions.get(question.id);
    if (existing) {
      result.skipped++;
      continue;
    }

    const record = {
      ...question,
      sourceType: question.sourceType ?? "imported",
      lifecycleStatus: question.lifecycleStatus ?? "active",
      createdAt: question.createdAt ?? now,
      updatedAt: now,
    } as QuizQuestionRecord;
    const issues = validateQuizQuestion(record);
    if (issues.length > 0) {
      result.errors.push(`${question.id}: ${issues[0]?.message}`);
      continue;
    }
    await db.quizQuestions.put(record);
    result.imported++;
  }

  return result;
}
