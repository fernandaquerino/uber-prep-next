import type { UberPrepDatabase } from "@/lib/db/schema";
import type { MockAudioRecord } from "@/types/database";
import { DatabaseError } from "@/lib/db/errors";

function generateId(): string {
  return `audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type SaveAudioInput = {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  mockId?: string;
};

export async function saveMockAudio(db: UberPrepDatabase, input: SaveAudioInput): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  const record: MockAudioRecord = {
    id,
    mockId: input.mockId,
    blob: input.blob,
    mimeType: input.mimeType,
    sizeBytes: input.blob.size,
    durationSeconds: input.durationSeconds,
    createdAt: now,
  };

  try {
    await db.mockAudio.put(record);
    return id;
  } catch (err) {
    throw new DatabaseError("Failed to save mock audio", err);
  }
}

export async function getMockAudio(
  db: UberPrepDatabase,
  audioId: string,
): Promise<MockAudioRecord | null> {
  try {
    return (await db.mockAudio.get(audioId)) ?? null;
  } catch (err) {
    throw new DatabaseError(`Failed to get mock audio ${audioId}`, err);
  }
}

export async function deleteMockAudio(db: UberPrepDatabase, audioId: string): Promise<void> {
  try {
    await db.mockAudio.delete(audioId);
  } catch (err) {
    throw new DatabaseError(`Failed to delete mock audio ${audioId}`, err);
  }
}

export async function getMockAudioByMockId(
  db: UberPrepDatabase,
  mockId: string,
): Promise<MockAudioRecord | null> {
  try {
    return (await db.mockAudio.where("mockId").equals(mockId).first()) ?? null;
  } catch (err) {
    throw new DatabaseError(`Failed to get audio for mock ${mockId}`, err);
  }
}
