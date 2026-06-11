import type { MetadataRecord, MigrationReport, MigrationStatus } from "@/types/database";
import type { UberPrepDatabase } from "@/lib/db/schema";
import { DATABASE_VERSION } from "@/lib/db/constants";
import { METADATA_ID } from "@/lib/db/constants";
import { DatabaseError } from "@/lib/db/errors";

export interface MigrationRepository {
  getMetadata(): Promise<MetadataRecord | undefined>;
  ensureMetadata(): Promise<MetadataRecord>;
  setMigrationStatus(status: MigrationStatus, report?: MigrationReport): Promise<void>;
  addSeedRun(seedId: string): Promise<void>;
  hasSeedRun(seedId: string): Promise<boolean>;
}

export function createMigrationRepository(db: UberPrepDatabase): MigrationRepository {
  async function getMetadata(): Promise<MetadataRecord | undefined> {
    try {
      return await db.metadata.get(METADATA_ID);
    } catch (err) {
      throw new DatabaseError("Failed to get metadata", err);
    }
  }

  async function ensureMetadata(): Promise<MetadataRecord> {
    try {
      const existing = await db.metadata.get(METADATA_ID);
      if (existing) return existing;

      const now = new Date().toISOString();
      const record: MetadataRecord = {
        id: METADATA_ID,
        schemaVersion: DATABASE_VERSION,
        migrationStatus: "none",
        migratedAt: null,
        backupVersion: 1,
        seedsRun: [],
        createdAt: now,
        updatedAt: now,
      };
      await db.metadata.put(record);
      return record;
    } catch (err) {
      throw new DatabaseError("Failed to ensure metadata", err);
    }
  }

  async function setMigrationStatus(
    status: MigrationStatus,
    report?: MigrationReport,
  ): Promise<void> {
    try {
      const meta = await ensureMetadata();
      const now = new Date().toISOString();
      await db.metadata.put({
        ...meta,
        migrationStatus: status,
        migratedAt: now,
        lastMigrationReport: report,
        updatedAt: now,
      });
    } catch (err) {
      throw new DatabaseError("Failed to set migration status", err);
    }
  }

  async function addSeedRun(seedId: string): Promise<void> {
    try {
      const meta = await ensureMetadata();
      if (meta.seedsRun.includes(seedId)) return;
      await db.metadata.put({
        ...meta,
        seedsRun: [...meta.seedsRun, seedId],
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw new DatabaseError(`Failed to record seed run ${seedId}`, err);
    }
  }

  async function hasSeedRun(seedId: string): Promise<boolean> {
    try {
      const meta = await db.metadata.get(METADATA_ID);
      return meta?.seedsRun.includes(seedId) ?? false;
    } catch (err) {
      throw new DatabaseError(`Failed to check seed run ${seedId}`, err);
    }
  }

  return { getMetadata, ensureMetadata, setMigrationStatus, addSeedRun, hasSeedRun };
}
