import type { FullInterviewSession, FullInterviewStep } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export function createFullInterviewRepository(db: UberPrepDatabase) {
  async function findSessionById(id: string): Promise<FullInterviewSession | undefined> {
    try {
      return await db.fullInterviewSessions.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get full interview session ${id}`, err);
    }
  }

  async function listSessions(): Promise<FullInterviewSession[]> {
    try {
      return await db.fullInterviewSessions.orderBy("createdAt").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list full interview sessions", err);
    }
  }

  async function upsertSession(record: FullInterviewSession): Promise<void> {
    try {
      await db.fullInterviewSessions.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert session ${record.id}`, err);
    }
  }

  async function deleteSession(id: string): Promise<void> {
    try {
      await db.fullInterviewSessions.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete session ${id}`, err);
    }
  }

  async function listStepsBySession(sessionId: string): Promise<FullInterviewStep[]> {
    try {
      return (await db.fullInterviewSteps
        .where("sessionId")
        .equals(sessionId)
        .sortBy("order")) as FullInterviewStep[];
    } catch (err) {
      throw new DatabaseError(`Failed to list steps for session ${sessionId}`, err);
    }
  }

  async function upsertStep(step: FullInterviewStep): Promise<void> {
    try {
      await db.fullInterviewSteps.put(step);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert step ${step.id}`, err);
    }
  }

  async function deleteStepsBySession(sessionId: string): Promise<void> {
    try {
      await db.fullInterviewSteps.where("sessionId").equals(sessionId).delete();
    } catch (err) {
      throw new DatabaseError(`Failed to delete steps for session ${sessionId}`, err);
    }
  }

  return {
    findSessionById,
    listSessions,
    upsertSession,
    deleteSession,
    listStepsBySession,
    upsertStep,
    deleteStepsBySession,
  };
}
