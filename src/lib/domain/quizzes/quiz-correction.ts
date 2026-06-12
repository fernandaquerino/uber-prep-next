import type { QuizAnswerValue, QuizQuestionRecord, QuizSelfAssessment } from "@/types/database";

export type QuizCorrectionResult = {
  isCorrect: boolean | null;
  score: number | null;
  requiresSelfAssessment: boolean;
};

export function correctSingleChoiceAnswer(
  selectedOptionId: string | null,
  correctOptionId: string,
): QuizCorrectionResult {
  const isCorrect = selectedOptionId === correctOptionId;
  return { isCorrect, score: isCorrect ? 1 : 0, requiresSelfAssessment: false };
}

export function correctMultipleChoiceAnswer(
  selectedOptionIds: string[],
  correctOptionIds: string[],
): QuizCorrectionResult {
  const selected = [...selectedOptionIds].sort();
  const correct = [...correctOptionIds].sort();
  const isCorrect =
    selected.length === correct.length && selected.every((id, index) => id === correct[index]);
  return { isCorrect, score: isCorrect ? 1 : 0, requiresSelfAssessment: false };
}

export function correctTrueFalseAnswer(
  selectedValue: boolean | null,
  correctValue: boolean,
): QuizCorrectionResult {
  const isCorrect = selectedValue === correctValue;
  return { isCorrect, score: isCorrect ? 1 : 0, requiresSelfAssessment: false };
}

export function scoreSelfAssessment(assessment: QuizSelfAssessment): number {
  if (assessment === "correct") return 1;
  if (assessment === "partial") return 0.5;
  return 0;
}

export function correctQuizAnswer(
  question: QuizQuestionRecord,
  answer: QuizAnswerValue | null,
  selfAssessment?: QuizSelfAssessment,
): QuizCorrectionResult {
  if (question.type === "open_text" || question.type === "interview") {
    if (!selfAssessment) {
      return { isCorrect: null, score: null, requiresSelfAssessment: true };
    }
    const score = scoreSelfAssessment(selfAssessment);
    return { isCorrect: score === 1, score, requiresSelfAssessment: false };
  }

  if (question.correctAnswer?.kind === "single") {
    return correctSingleChoiceAnswer(
      answer?.kind === "single" ? answer.optionId : null,
      question.correctAnswer.optionId,
    );
  }
  if (question.correctAnswer?.kind === "multiple") {
    return correctMultipleChoiceAnswer(
      answer?.kind === "multiple" ? answer.optionIds : [],
      question.correctAnswer.optionIds,
    );
  }
  if (question.correctAnswer?.kind === "boolean") {
    return correctTrueFalseAnswer(
      answer?.kind === "boolean" ? answer.value : null,
      question.correctAnswer.value,
    );
  }

  return { isCorrect: null, score: null, requiresSelfAssessment: true };
}
