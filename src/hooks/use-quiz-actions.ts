"use client";

import { useCallback, useState } from "react";
import type {
  QuizAnswerValue,
  QuizQuestionRecord,
  QuizSelfAssessment,
  QuizSessionRecord,
  QuizSessionType,
} from "@/types/database";
import type { QuizQuestionFilters } from "@/lib/domain/quizzes";
import type { CalendarDate } from "@/lib/domain/schedule";
import { parseCalendarDate } from "@/lib/domain/schedule";

function getTodayCalendarDate(): CalendarDate {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

async function getDb() {
  const { getDb: loadDb } = await import("@/lib/db/db");
  return loadDb();
}

type ActionState = "idle" | "loading" | "error";

export function useQuizActions(onSuccess?: () => void) {
  const [state, setState] = useState<ActionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>, refresh = true): Promise<T | null> => {
      setState("loading");
      setError(null);
      try {
        const result = await fn();
        setState("idle");
        if (refresh) onSuccess?.();
        return result;
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
        return null;
      }
    },
    [onSuccess],
  );

  const createSession = useCallback(
    (input: {
      type: QuizSessionType;
      limit?: number;
      filters?: QuizQuestionFilters;
      questionIds?: string[];
    }) =>
      wrap(async () => {
        const db = await getDb();
        const { createQuizSession } = await import("@/lib/application/quizzes");
        return createQuizSession(db, { ...input, today: getTodayCalendarDate() });
      }),
    [wrap],
  );

  const saveAnswer = useCallback(
    (input: {
      sessionId: string;
      questionId: string;
      answer: QuizAnswerValue | null;
      draft?: string;
      selfAssessment?: QuizSelfAssessment;
      timeSeconds?: number;
    }) =>
      wrap(async () => {
        const db = await getDb();
        const { saveQuizAnswer } = await import("@/lib/application/quizzes");
        return saveQuizAnswer(db, { ...input, today: getTodayCalendarDate() });
      }),
    [wrap],
  );

  const finishSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { finishQuizSession } = await import("@/lib/application/quizzes");
        return finishQuizSession(db, sessionId);
      }),
    [wrap],
  );

  const abandonSession = useCallback(
    (sessionId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { abandonQuizSession } = await import("@/lib/application/quizzes");
        await abandonQuizSession(db, sessionId);
      }),
    [wrap],
  );

  const markQuestion = useCallback(
    (questionId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { markQuestion: mark } = await import("@/lib/application/quizzes");
        await mark(db, questionId);
      }),
    [wrap],
  );

  const unmarkQuestion = useCallback(
    (questionId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { unmarkQuestion: unmark } = await import("@/lib/application/quizzes");
        await unmark(db, questionId);
      }),
    [wrap],
  );

  const exportQuestions = useCallback(
    () =>
      wrap(async () => {
        const db = await getDb();
        const { exportQuestions: exportAll } = await import("@/lib/application/quizzes");
        return exportAll(db);
      }, false),
    [wrap],
  );

  const importQuestions = useCallback(
    (data: unknown) =>
      wrap(async () => {
        const db = await getDb();
        const { importQuestions: importAll } = await import("@/lib/application/quizzes");
        return importAll(db, data);
      }),
    [wrap],
  );

  return {
    createSession,
    saveAnswer,
    finishSession,
    abandonSession,
    markQuestion,
    unmarkQuestion,
    exportQuestions,
    importQuestions,
    isLoading: state === "loading",
    error,
  };
}

export type QuizActions = ReturnType<typeof useQuizActions>;
export type ActiveQuizSession = QuizSessionRecord;
export type QuizQuestion = QuizQuestionRecord;
