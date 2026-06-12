import type { UberPrepDatabase } from "@/lib/db/schema";
import type { StarAnswer, RubricRating } from "@/types/database";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `star-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type SaveStarAnswerInput = {
  questionId: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  learning?: string;
  conciseVersion?: string;
  englishVersion?: string;
  selfRating?: RubricRating;
  durationSeconds?: number;
  audioRecordingId?: string;
};

export async function saveStarAnswer(
  db: UberPrepDatabase,
  input: SaveStarAnswerInput,
): Promise<string> {
  const now = new Date().toISOString();

  try {
    const existing = await db.starAnswers.where("questionId").equals(input.questionId).first();

    const id = existing?.id ?? generateId();
    const record: StarAnswer = {
      id,
      questionId: input.questionId,
      situation: input.situation,
      task: input.task,
      action: input.action,
      result: input.result,
      learning: input.learning,
      conciseVersion: input.conciseVersion,
      englishVersion: input.englishVersion,
      selfRating: input.selfRating,
      durationSeconds: input.durationSeconds,
      audioRecordingId: input.audioRecordingId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.starAnswers.put(record);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to save STAR answer", err);
  }
}

export async function deleteStarAnswer(db: UberPrepDatabase, id: string): Promise<void> {
  try {
    await db.starAnswers.delete(id);
  } catch (err) {
    throw new DatabaseError(`Failed to delete STAR answer ${id}`, err);
  }
}

export async function getStarAnswerByQuestionId(
  db: UberPrepDatabase,
  questionId: string,
): Promise<StarAnswer | null> {
  try {
    return (await db.starAnswers.where("questionId").equals(questionId).first()) ?? null;
  } catch (err) {
    throw new DatabaseError(`Failed to get STAR answer for question ${questionId}`, err);
  }
}

export async function getAllStarAnswers(db: UberPrepDatabase): Promise<StarAnswer[]> {
  try {
    return await db.starAnswers.toArray();
  } catch (err) {
    throw new DatabaseError("Failed to get all STAR answers", err);
  }
}
