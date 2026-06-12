import type { QuizQuestionRecord } from "@/types/database";

export type QuizValidationIssue = {
  questionId?: string;
  message: string;
};

export function validateQuizQuestion(question: QuizQuestionRecord): QuizValidationIssue[] {
  const issues: QuizValidationIssue[] = [];
  if (!question.id.trim()) issues.push({ message: "Questão sem ID." });
  if (!question.prompt.trim())
    issues.push({ questionId: question.id, message: "Questão sem enunciado." });
  if (!question.category.trim())
    issues.push({ questionId: question.id, message: "Questão sem categoria." });

  if (
    (question.type === "single_choice" ||
      question.type === "multiple_choice" ||
      question.type === "true_false") &&
    !question.correctAnswer
  ) {
    issues.push({ questionId: question.id, message: "Questão objetiva sem resposta correta." });
  }

  if (
    (question.type === "single_choice" || question.type === "multiple_choice") &&
    (!question.options || question.options.length < 2)
  ) {
    issues.push({ questionId: question.id, message: "Questão objetiva precisa de opções." });
  }

  if (
    (question.type === "open_text" || question.type === "interview") &&
    !question.referenceAnswer
  ) {
    issues.push({ questionId: question.id, message: "Questão aberta sem resposta de referência." });
  }

  return issues;
}
