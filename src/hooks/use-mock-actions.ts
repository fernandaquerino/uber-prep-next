"use client";

import { useState, useCallback } from "react";
import type { MockType, MockStatus, MockRubricResult } from "@/types/database";
import type { SaveStarAnswerInput } from "@/lib/application/star/star-use-cases";
import type { SaveAudioInput } from "@/lib/application/mocks/mock-audio-use-cases";

type ActionState = "idle" | "loading" | "error";

async function getDb() {
  const { getDb: _getDb } = await import("@/lib/db/db");
  return _getDb();
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export type MockFormInput = {
  title?: string;
  type: MockType;
  date?: string;
  status?: MockStatus;
  prompt?: string;
  response?: string;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  nextSteps?: string[];
  durationSeconds?: number;
  linkedPlanBlockId?: string;
  rubricResult?: MockRubricResult;
  audioRecordingId?: string;
};

export function useMockActions(onSuccess?: () => void) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setActionState("loading");
      setActionError(null);
      try {
        const result = await fn();
        setActionState("idle");
        onSuccess?.();
        return result;
      } catch (err) {
        setActionState("error");
        setActionError(err instanceof Error ? err.message : "Erro desconhecido.");
        return undefined;
      }
    },
    [onSuccess],
  );

  const createMock = useCallback(
    (input: MockFormInput) =>
      wrap(async () => {
        const db = await getDb();
        const { createMock: _create } = await import("@/lib/application/mocks");
        return _create(db, {
          type: input.type,
          title: input.title ?? "",
          date: input.date ?? getToday(),
          status: input.status,
          prompt: input.prompt,
          response: input.response,
          feedback: input.feedback,
          strengths: input.strengths,
          weaknesses: input.weaknesses,
          nextSteps: input.nextSteps,
          linkedPlanBlockId: input.linkedPlanBlockId,
        });
      }),
    [wrap],
  );

  const updateMock = useCallback(
    (id: string, input: Partial<MockFormInput>) =>
      wrap(async () => {
        const db = await getDb();
        const { updateMock: _update } = await import("@/lib/application/mocks");
        await _update(db, { id, ...input });
      }),
    [wrap],
  );

  const completeMock = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { completeMock: _complete } = await import("@/lib/application/mocks");
        await _complete(db, id);
      }),
    [wrap],
  );

  const cancelMock = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { cancelMock: _cancel } = await import("@/lib/application/mocks");
        await _cancel(db, id);
      }),
    [wrap],
  );

  const deleteMock = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { deleteMock: _delete } = await import("@/lib/application/mocks");
        await _delete(db, id);
      }),
    [wrap],
  );

  const duplicateMock = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { duplicateMock: _dup } = await import("@/lib/application/mocks");
        return _dup(db, id);
      }),
    [wrap],
  );

  const createReviewsFromGaps = useCallback(
    (mockId: string, selectedDescriptions: string[] = []) =>
      wrap(async () => {
        const db = await getDb();
        const today = getToday();
        const { createReviewsFromGaps: _create } = await import("@/lib/application/mocks");
        return _create(db, mockId, selectedDescriptions, today);
      }),
    [wrap],
  );

  return {
    actionState,
    actionError,
    isLoading: actionState === "loading",
    createMock,
    updateMock,
    completeMock,
    cancelMock,
    deleteMock,
    duplicateMock,
    createReviewsFromGaps,
  };
}

// ── STAR actions ──────────────────────────────────────────────────────────────

export function useStarActions(onSuccess?: () => void) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setActionState("loading");
      setActionError(null);
      try {
        const result = await fn();
        setActionState("idle");
        onSuccess?.();
        return result;
      } catch (err) {
        setActionState("error");
        setActionError(err instanceof Error ? err.message : "Erro desconhecido.");
        return undefined;
      }
    },
    [onSuccess],
  );

  const saveStarAnswer = useCallback(
    (input: SaveStarAnswerInput) =>
      wrap(async () => {
        const db = await getDb();
        const { saveStarAnswer: _save } = await import("@/lib/application/star/star-use-cases");
        return _save(db, input);
      }),
    [wrap],
  );

  const deleteStarAnswer = useCallback(
    (id: string) =>
      wrap(async () => {
        const db = await getDb();
        const { deleteStarAnswer: _delete } = await import("@/lib/application/star/star-use-cases");
        await _delete(db, id);
      }),
    [wrap],
  );

  return {
    actionState,
    actionError,
    isLoading: actionState === "loading",
    saveStarAnswer,
    deleteStarAnswer,
  };
}

// ── Audio actions ─────────────────────────────────────────────────────────────

export function useMockAudioActions(onSuccess?: () => void) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setActionState("loading");
      setActionError(null);
      try {
        const result = await fn();
        setActionState("idle");
        onSuccess?.();
        return result;
      } catch (err) {
        setActionState("error");
        setActionError(err instanceof Error ? err.message : "Erro ao salvar áudio.");
        return undefined;
      }
    },
    [onSuccess],
  );

  const saveAudio = useCallback(
    (input: SaveAudioInput) =>
      wrap(async () => {
        const db = await getDb();
        const { saveMockAudio } = await import("@/lib/application/mocks/mock-audio-use-cases");
        return saveMockAudio(db, input);
      }),
    [wrap],
  );

  const deleteAudio = useCallback(
    (audioId: string) =>
      wrap(async () => {
        const db = await getDb();
        const { deleteMockAudio } = await import("@/lib/application/mocks/mock-audio-use-cases");
        await deleteMockAudio(db, audioId);
      }),
    [wrap],
  );

  return { actionState, actionError, isLoading: actionState === "loading", saveAudio, deleteAudio };
}
