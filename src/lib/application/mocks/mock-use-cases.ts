import type { UberPrepDatabase } from "@/lib/db/schema";
import type { MockRecord, MockStatus, MockType, MockRubricResult } from "@/types/database";
import type { CanonicalMockType } from "@/lib/domain/mocks";
import {
  calculateMockScore,
  generateMockEvidence,
  normalizeMockType,
  createEmptyRubricResult,
} from "@/lib/domain/mocks";
import { DatabaseError } from "@/lib/db/errors";

// ─── ID helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Create mock ──────────────────────────────────────────────────────────────

export type CreateMockInput = {
  type: MockType;
  title: string;
  date: string;
  status?: MockStatus;
  prompt?: string;
  response?: string;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  nextSteps?: string[];
  rubricResult?: MockRubricResult;
  linkedPlanBlockId?: string;
  audioRecordingId?: string;
};

export async function createMock(db: UberPrepDatabase, input: CreateMockInput): Promise<string> {
  const now = new Date().toISOString();
  const id = generateId();
  const canonicalType = normalizeMockType(input.type);

  const rubricResult =
    input.rubricResult ?? createEmptyRubricResult(canonicalType as CanonicalMockType);

  const score = input.rubricResult ? calculateMockScore(input.rubricResult) : null;

  const record: MockRecord = {
    id,
    date: input.date,
    type: canonicalType,
    status: input.status ?? "draft",
    title: input.title.trim() || "Mock sem título",
    prompt: input.prompt,
    response: input.response,
    feedback: input.feedback,
    strengths: input.strengths ?? [],
    weaknesses: input.weaknesses ?? [],
    nextSteps: input.nextSteps ?? [],
    rubricResult,
    rubricDefinitionId: rubricResult.rubricDefinitionId,
    rubricVersion: rubricResult.version,
    score,
    hasAudio: !!input.audioRecordingId,
    audioRecordingId: input.audioRecordingId,
    linkedPlanBlockId: input.linkedPlanBlockId,
    sourceType: "manual",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.mocks.put(record);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to create mock", err);
  }
}

// ─── Update mock ──────────────────────────────────────────────────────────────

export type UpdateMockInput = Partial<Omit<CreateMockInput, "type">> & {
  id: string;
};

export async function updateMock(db: UberPrepDatabase, input: UpdateMockInput): Promise<void> {
  const existing = await db.mocks.get(input.id);
  if (!existing) throw new Error(`Mock not found: ${input.id}`);

  const now = new Date().toISOString();

  const rubricResult = input.rubricResult ?? existing.rubricResult;
  const score = rubricResult ? calculateMockScore(rubricResult) : existing.score;

  try {
    await db.mocks.put({
      ...existing,
      title: input.title?.trim() ?? existing.title,
      date: input.date ?? existing.date,
      status: input.status ?? existing.status,
      prompt: input.prompt ?? existing.prompt,
      response: input.response ?? existing.response,
      feedback: input.feedback ?? existing.feedback,
      strengths: input.strengths ?? existing.strengths,
      weaknesses: input.weaknesses ?? existing.weaknesses,
      nextSteps: input.nextSteps ?? existing.nextSteps,
      rubricResult: rubricResult ?? existing.rubricResult,
      score,
      hasAudio: input.audioRecordingId !== undefined ? !!input.audioRecordingId : existing.hasAudio,
      audioRecordingId: input.audioRecordingId ?? existing.audioRecordingId,
      linkedPlanBlockId: input.linkedPlanBlockId ?? existing.linkedPlanBlockId,
      updatedAt: now,
    });
  } catch (err) {
    throw new DatabaseError(`Failed to update mock ${input.id}`, err);
  }
}

// ─── Complete mock ────────────────────────────────────────────────────────────

export async function completeMock(
  db: UberPrepDatabase,
  mockId: string,
  rubricResult?: MockRubricResult,
): Promise<void> {
  const existing = await db.mocks.get(mockId);
  if (!existing) throw new Error(`Mock not found: ${mockId}`);

  const now = new Date().toISOString();
  const finalRubricResult = rubricResult ?? existing.rubricResult;
  const score = finalRubricResult ? calculateMockScore(finalRubricResult) : null;

  try {
    await db.mocks.put({
      ...existing,
      status: "completed",
      rubricResult: finalRubricResult,
      score,
      completedAt: now,
      updatedAt: now,
    });

    // Generate and save evidence from this completed mock
    const updatedMock = {
      ...existing,
      status: "completed" as const,
      rubricResult: finalRubricResult,
      score,
    };
    const evidence = generateMockEvidence(updatedMock, now);
    if (evidence.length > 0) {
      // Delete old evidence before saving new
      await db.mockEvidence.where("mockId").equals(mockId).delete();
      await db.mockEvidence.bulkPut(evidence);
    }
  } catch (err) {
    throw new DatabaseError(`Failed to complete mock ${mockId}`, err);
  }
}

// ─── Cancel mock ──────────────────────────────────────────────────────────────

export async function cancelMock(db: UberPrepDatabase, mockId: string): Promise<void> {
  const existing = await db.mocks.get(mockId);
  if (!existing) throw new Error(`Mock not found: ${mockId}`);

  try {
    await db.mocks.put({
      ...existing,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    throw new DatabaseError(`Failed to cancel mock ${mockId}`, err);
  }
}

// ─── Delete mock ──────────────────────────────────────────────────────────────

export async function deleteMock(db: UberPrepDatabase, mockId: string): Promise<void> {
  try {
    await db.mocks.delete(mockId);
    await db.mockEvidence.where("mockId").equals(mockId).delete();
    await db.mockAudio.where("mockId").equals(mockId).delete();
    // Cancel any active reviews for this mock
    const reviews = await db.reviews
      .where("sourceType")
      .equals("mock")
      .filter((r) => r.sourceId === mockId && (r.status === "scheduled" || r.status === "due"))
      .toArray();
    if (reviews.length > 0) {
      const now = new Date().toISOString();
      await db.reviews.bulkPut(
        reviews.map((r) => ({
          ...r,
          status: "cancelled" as const,
          cancelledAt: now,
          updatedAt: now,
        })),
      );
    }
  } catch (err) {
    throw new DatabaseError(`Failed to delete mock ${mockId}`, err);
  }
}

// ─── Duplicate mock ───────────────────────────────────────────────────────────

export async function duplicateMock(db: UberPrepDatabase, mockId: string): Promise<string> {
  const existing = await db.mocks.get(mockId);
  if (!existing) throw new Error(`Mock not found: ${mockId}`);

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const newId = generateId();

  const canonicalType = normalizeMockType(existing.type);
  const freshRubric = createEmptyRubricResult(canonicalType as CanonicalMockType);

  try {
    await db.mocks.put({
      ...existing,
      id: newId,
      title: `${existing.title} (cópia)`,
      status: "draft",
      date: today,
      rubricResult: freshRubric,
      score: null,
      hasAudio: false,
      audioRecordingId: undefined,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return newId;
  } catch (err) {
    throw new DatabaseError(`Failed to duplicate mock ${mockId}`, err);
  }
}

// ─── Create reviews from gaps ─────────────────────────────────────────────────

export type GapReviewPreview = {
  criterionId?: string;
  description: string;
  area: string;
};

export async function getGapReviewPreviews(
  db: UberPrepDatabase,
  mockId: string,
): Promise<GapReviewPreview[]> {
  const evidence = await db.mockEvidence
    .where("mockId")
    .equals(mockId)
    .filter((e) => e.kind === "gap")
    .toArray();

  return evidence.map((e) => ({
    criterionId: e.criterionId,
    description: e.description,
    area: e.area,
  }));
}

export async function createReviewsFromGaps(
  db: UberPrepDatabase,
  mockId: string,
  selectedDescriptions: string[],
  today: string,
): Promise<void> {
  if (selectedDescriptions.length === 0) return;

  const now = new Date().toISOString();
  const selectedSet = new Set(selectedDescriptions);

  const evidence = await db.mockEvidence
    .where("mockId")
    .equals(mockId)
    .filter((e) => e.kind === "gap" && selectedSet.has(e.description))
    .toArray();

  const mock = await db.mocks.get(mockId);
  const mockTitle = mock?.title ?? "Mock";

  for (const ev of evidence) {
    const reviewId = `mock-gap-review:${mockId}:${ev.id}`;
    const existing = await db.reviews.get(reviewId);
    if (existing && (existing.status === "scheduled" || existing.status === "due")) continue;

    await db.reviews.put({
      id: reviewId,
      sourceType: "mock",
      sourceId: mockId,
      status: "scheduled",
      scheduledFor: today,
      originalScheduledFor: today,
      cycleIndex: 0,
      reason: "future_mock_gap",
      legacyBlockLabel: `Gap de mock: ${ev.description.slice(0, 60)}`,
      history: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  void mockTitle;
}
