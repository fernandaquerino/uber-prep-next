import type {
  QuizCorrectAnswerRecord,
  QuizDifficulty,
  QuizOptionRecord,
  QuizQuestionRecord,
  QuizQuestionType,
} from "@/types/database";

type LegacyQuizQuestion = {
  id: string;
  prompt: string;
  code?: string;
  type?: string;
  topic?: string;
  group?: string;
  week?: number;
  difficulty?: string;
  tags?: string[];
  options?: string[];
  correctAnswer?: string | string[] | boolean;
  explanation?: string;
  idealAnswer?: string;
  referenceAnswer?: string;
  evaluationCriteria?: string[];
};

const GROUP_TO_CATEGORY: Record<string, string> = {
  algorithms: "algo",
  data_structures: "algo",
  javascript: "js",
  react: "react",
  frontend_system_design: "system",
  accessibility: "fe_coding",
  behavioral: "behavioral",
};

function normalizeQuestionType(type?: string, options?: string[]): QuizQuestionType {
  if (type === "open") return "open_text";
  if (type === "interview") return "interview";
  if (type === "true_false") return "true_false";
  if (type === "multiple_select") return "multiple_choice";
  if (options?.length === 2 && options.every((o) => /^(verdadeiro|falso|true|false)$/i.test(o))) {
    return "true_false";
  }
  return "single_choice";
}

function normalizeDifficulty(difficulty?: string): QuizDifficulty {
  if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") return difficulty;
  return "medium";
}

function optionId(questionId: string, index: number): string {
  return `${questionId}:opt-${String(index + 1).padStart(2, "0")}`;
}

function normalizeOptions(questionId: string, options?: string[]): QuizOptionRecord[] | undefined {
  if (!options?.length) return undefined;
  return options.map((label, index) => ({
    id: optionId(questionId, index),
    label,
  }));
}

function normalizeCorrectAnswer(
  question: LegacyQuizQuestion,
  type: QuizQuestionType,
  options?: QuizOptionRecord[],
): QuizCorrectAnswerRecord | undefined {
  if (type === "open_text" || type === "interview") return undefined;
  if (type === "true_false") {
    if (typeof question.correctAnswer === "boolean") {
      return { kind: "boolean", value: question.correctAnswer };
    }
    if (typeof question.correctAnswer === "string") {
      return { kind: "boolean", value: /^(verdadeiro|true)$/i.test(question.correctAnswer) };
    }
    return undefined;
  }

  if (!options?.length) return undefined;

  if (type === "multiple_choice" && Array.isArray(question.correctAnswer)) {
    const optionIds = options
      .filter((option) =>
        Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(option.label)
          : false,
      )
      .map((option) => option.id);
    return { kind: "multiple", optionIds };
  }

  if (typeof question.correctAnswer === "string") {
    const option = options.find((item) => item.label === question.correctAnswer);
    return option ? { kind: "single", optionId: option.id } : undefined;
  }

  return undefined;
}

export function normalizeLegacyQuizQuestion(
  question: LegacyQuizQuestion,
  now: string,
): QuizQuestionRecord {
  const type = normalizeQuestionType(question.type, question.options);
  const options = normalizeOptions(question.id, question.options);
  const group = question.group ?? "algorithms";
  const topic = question.topic ?? group;

  console.log({ question });

  return {
    id: question.id,
    prompt: question.prompt.trim(),
    code: question.code,
    type,
    category: GROUP_TO_CATEGORY[group] ?? "algo",
    difficulty: normalizeDifficulty(question.difficulty),
    group,
    week: question.week,
    topicIds: [topic],
    tags: Array.from(new Set([...(question.tags ?? []), topic].map((tag) => tag.toLowerCase()))),
    options,
    correctAnswer: normalizeCorrectAnswer(question, type, options),
    explanation: question.explanation,
    referenceAnswer: question.referenceAnswer ?? question.idealAnswer,
    evaluationCriteria: question.evaluationCriteria,
    sourceType: "seed",
    lifecycleStatus: "active",
    createdAt: now,
    updatedAt: now,
  };
}
