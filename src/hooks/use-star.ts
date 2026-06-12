"use client";

import { useState, useEffect, useCallback } from "react";
import type { StarAnswer } from "@/types/database";
import { STAR_QUESTIONS } from "@/lib/data/star-questions";

export type UseStarResult = {
  questions: typeof STAR_QUESTIONS;
  answers: Map<string, StarAnswer>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

async function loadStarAnswers(): Promise<StarAnswer[]> {
  const { getDb } = await import("@/lib/db/db");
  const { getAllStarAnswers } = await import("@/lib/application/star/star-use-cases");
  const db = getDb();
  return getAllStarAnswers(db);
}

export function useStar(): UseStarResult {
  const [answers, setAnswers] = useState<StarAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadStarAnswers()
      .then((data) => {
        if (!cancelled) {
          setAnswers(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro ao carregar respostas STAR.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rev]);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  const answersMap = new Map(answers.map((a) => [a.questionId, a]));

  return { questions: STAR_QUESTIONS, answers: answersMap, isLoading, error, refresh };
}
