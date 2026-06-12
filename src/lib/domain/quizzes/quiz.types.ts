import type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizDifficulty,
  QuizFeedbackMode,
  QuizQuestionLifecycleStatus,
  QuizQuestionRecord,
  QuizQuestionSource,
  QuizQuestionType,
  QuizSelfAssessment,
  QuizSessionConfigRecord,
  QuizSessionRecord,
  QuizSessionStatus,
  QuizSessionType,
} from "@/types/database";

export type {
  QuizAnswerRecord,
  QuizAnswerValue,
  QuizDifficulty,
  QuizFeedbackMode,
  QuizQuestionLifecycleStatus,
  QuizQuestionRecord,
  QuizQuestionSource,
  QuizQuestionType,
  QuizSelfAssessment,
  QuizSessionConfigRecord,
  QuizSessionRecord,
  QuizSessionStatus,
  QuizSessionType,
};

export type QuizSessionScore = {
  totalQuestions: number;
  answeredQuestions: number;
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;
  autoGradedCount: number;
  selfAssessedCount: number;
};

export type QuizTopicMetrics = {
  topicId: string;
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number | null;
  averageTimeSeconds: number | null;
  confidenceAverage: number | null;
};

export type WeakQuizTopic = {
  topicId: string;
  score: number;
  evidenceCount: number;
  reasons: string[];
};
