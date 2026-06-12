import type { UberPrepDatabase } from "@/lib/db/schema";
import type {
  FullInterviewSession,
  FullInterviewStep,
  FullInterviewStepType,
  MockRubricResult,
} from "@/types/database";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `fi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stepId(): string {
  return `fis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_STEP_TYPES: FullInterviewStepType[] = [
  "coding",
  "system_design",
  "behavioral",
  "reflection",
];

export async function createFullInterviewSession(
  db: UberPrepDatabase,
  title: string,
  stepTypes: FullInterviewStepType[] = DEFAULT_STEP_TYPES,
): Promise<string> {
  const now = new Date().toISOString();
  const id = generateId();

  const steps: FullInterviewStep[] = stepTypes.map((type, i) => ({
    id: stepId(),
    sessionId: id,
    type,
    order: i,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }));

  const session: FullInterviewSession = {
    id,
    title,
    status: "draft",
    stepIds: steps.map((s) => s.id),
    currentStepIndex: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.fullInterviewSessions.put(session);
    await db.fullInterviewSteps.bulkPut(steps);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to create full interview session", err);
  }
}

export async function startFullInterviewSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  const session = await db.fullInterviewSessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  const now = new Date().toISOString();
  await db.fullInterviewSessions.put({
    ...session,
    status: "in_progress",
    startedAt: session.startedAt ?? now,
    updatedAt: now,
  });
}

export async function updateFullInterviewStep(
  db: UberPrepDatabase,
  stepId: string,
  updates: {
    prompt?: string;
    response?: string;
    rubricResult?: MockRubricResult;
    audioRecordingId?: string;
    notes?: string;
    durationSeconds?: number;
    status?: FullInterviewStep["status"];
  },
): Promise<void> {
  const step = await db.fullInterviewSteps.get(stepId);
  if (!step) throw new Error(`Step not found: ${stepId}`);

  const now = new Date().toISOString();
  await db.fullInterviewSteps.put({
    ...step,
    ...updates,
    completedAt:
      updates.status === "completed" ? (step.completedAt ?? now) : step.completedAt,
    updatedAt: now,
  });
}

export async function advanceFullInterviewSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  const session = await db.fullInterviewSessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  const next = Math.min(session.currentStepIndex + 1, session.stepIds.length - 1);
  await db.fullInterviewSessions.put({
    ...session,
    currentStepIndex: next,
    updatedAt: new Date().toISOString(),
  });
}

export async function completeFullInterviewSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  const session = await db.fullInterviewSessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  const now = new Date().toISOString();
  await db.fullInterviewSessions.put({
    ...session,
    status: "completed",
    completedAt: now,
    updatedAt: now,
  });
}

export async function deleteFullInterviewSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<void> {
  try {
    await db.fullInterviewSessions.delete(sessionId);
    await db.fullInterviewSteps.where("sessionId").equals(sessionId).delete();
  } catch (err) {
    throw new DatabaseError(`Failed to delete full interview session ${sessionId}`, err);
  }
}

export async function getFullInterviewSession(
  db: UberPrepDatabase,
  sessionId: string,
): Promise<{ session: FullInterviewSession; steps: FullInterviewStep[] } | null> {
  const session = await db.fullInterviewSessions.get(sessionId);
  if (!session) return null;

  const steps = (await db.fullInterviewSteps
    .where("sessionId")
    .equals(sessionId)
    .sortBy("order")) as FullInterviewStep[];

  return { session, steps };
}

