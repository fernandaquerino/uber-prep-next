import type { MockRecord, MockAudioRecord, MockEvidence, MockStatus } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DatabaseError } from "@/lib/db/errors";

export interface MocksRepository {
  // Mock records
  findById(id: string): Promise<MockRecord | undefined>;
  list(): Promise<MockRecord[]>;
  listByType(type: string): Promise<MockRecord[]>;
  listByStatus(status: MockStatus): Promise<MockRecord[]>;
  listCompleted(): Promise<MockRecord[]>;
  upsert(record: MockRecord): Promise<void>;
  bulkUpsert(records: MockRecord[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;

  // Audio
  findAudioById(id: string): Promise<MockAudioRecord | undefined>;
  findAudioByMockId(mockId: string): Promise<MockAudioRecord | undefined>;
  saveAudio(record: MockAudioRecord): Promise<void>;
  deleteAudio(id: string): Promise<void>;
  deleteAudioByMockId(mockId: string): Promise<void>;
  clearAudio(): Promise<void>;

  // Evidence
  listEvidenceByMockId(mockId: string): Promise<MockEvidence[]>;
  saveEvidence(evidence: MockEvidence[]): Promise<void>;
  deleteEvidenceByMockId(mockId: string): Promise<void>;
}

export function createMocksRepository(db: UberPrepDatabase): MocksRepository {
  // ─── Mock Records ─────────────────────────────────────────────────────────────

  async function findById(id: string): Promise<MockRecord | undefined> {
    try {
      return await db.mocks.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get mock ${id}`, err);
    }
  }

  async function list(): Promise<MockRecord[]> {
    try {
      return await db.mocks.orderBy("date").reverse().toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list mocks", err);
    }
  }

  async function listByType(type: string): Promise<MockRecord[]> {
    try {
      return await db.mocks.where("type").equals(type).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list mocks by type ${type}`, err);
    }
  }

  async function listByStatus(status: MockStatus): Promise<MockRecord[]> {
    try {
      return await db.mocks.where("status").equals(status).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list mocks by status ${status}`, err);
    }
  }

  async function listCompleted(): Promise<MockRecord[]> {
    try {
      return await db.mocks.where("status").equals("completed").toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list completed mocks", err);
    }
  }

  async function upsert(record: MockRecord): Promise<void> {
    try {
      await db.mocks.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to upsert mock ${record.id}`, err);
    }
  }

  async function bulkUpsert(records: MockRecord[]): Promise<void> {
    try {
      await db.mocks.bulkPut(records);
    } catch (err) {
      throw new DatabaseError("Failed to bulk upsert mocks", err);
    }
  }

  async function delete_(id: string): Promise<void> {
    try {
      await db.mocks.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete mock ${id}`, err);
    }
  }

  async function clear(): Promise<void> {
    try {
      await db.mocks.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear mocks", err);
    }
  }

  async function count(): Promise<number> {
    try {
      return await db.mocks.count();
    } catch (err) {
      throw new DatabaseError("Failed to count mocks", err);
    }
  }

  // ─── Audio ────────────────────────────────────────────────────────────────────

  async function findAudioById(id: string): Promise<MockAudioRecord | undefined> {
    try {
      return await db.mockAudio.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to get audio ${id}`, err);
    }
  }

  async function findAudioByMockId(mockId: string): Promise<MockAudioRecord | undefined> {
    try {
      return await db.mockAudio.where("mockId").equals(mockId).first();
    } catch (err) {
      throw new DatabaseError(`Failed to get audio for mock ${mockId}`, err);
    }
  }

  async function saveAudio(record: MockAudioRecord): Promise<void> {
    try {
      await db.mockAudio.put(record);
    } catch (err) {
      throw new DatabaseError(`Failed to save audio for mock ${record.mockId}`, err);
    }
  }

  async function deleteAudio(id: string): Promise<void> {
    try {
      await db.mockAudio.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to delete audio ${id}`, err);
    }
  }

  async function deleteAudioByMockId(mockId: string): Promise<void> {
    try {
      await db.mockAudio.where("mockId").equals(mockId).delete();
    } catch (err) {
      throw new DatabaseError(`Failed to delete audio for mock ${mockId}`, err);
    }
  }

  async function clearAudio(): Promise<void> {
    try {
      await db.mockAudio.clear();
    } catch (err) {
      throw new DatabaseError("Failed to clear mock audio", err);
    }
  }

  // ─── Evidence ─────────────────────────────────────────────────────────────────

  async function listEvidenceByMockId(mockId: string): Promise<MockEvidence[]> {
    try {
      return await db.mockEvidence.where("mockId").equals(mockId).toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list evidence for mock ${mockId}`, err);
    }
  }

  async function saveEvidence(evidence: MockEvidence[]): Promise<void> {
    try {
      await db.mockEvidence.bulkPut(evidence);
    } catch (err) {
      throw new DatabaseError("Failed to save mock evidence", err);
    }
  }

  async function deleteEvidenceByMockId(mockId: string): Promise<void> {
    try {
      await db.mockEvidence.where("mockId").equals(mockId).delete();
    } catch (err) {
      throw new DatabaseError(`Failed to delete evidence for mock ${mockId}`, err);
    }
  }

  return {
    findById,
    list,
    listByType,
    listByStatus,
    listCompleted,
    upsert,
    bulkUpsert,
    delete: delete_,
    clear,
    count,
    findAudioById,
    findAudioByMockId,
    saveAudio,
    deleteAudio,
    deleteAudioByMockId,
    clearAudio,
    listEvidenceByMockId,
    saveEvidence,
    deleteEvidenceByMockId,
  };
}
