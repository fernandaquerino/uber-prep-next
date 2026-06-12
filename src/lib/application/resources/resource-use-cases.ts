import type { UberPrepDatabase } from "@/lib/db/schema";
import type { ResourceRecord, ResourceProgressRecord, ResourceStatus } from "@/types/database";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  ResourcePageData,
} from "@/lib/domain/resources";
import {
  mergeResourceProgress,
  collectResourceMeta,
  computeResourceStats,
} from "@/lib/domain/resources";
import {
  createResourcesRepository,
  createResourceProgressRepository,
} from "@/lib/repositories/resources.repository";
import { createReviewsRepository } from "@/lib/repositories/reviews.repository";
import type { ReviewRecord } from "@/types/database";

function nowIso() {
  return new Date().toISOString();
}

export async function getResourcePageData(db: UberPrepDatabase): Promise<ResourcePageData> {
  const resourceRepo = createResourcesRepository(db);
  const progressRepo = createResourceProgressRepository(db);

  const [resources, progressList] = await Promise.all([
    resourceRepo.list(),
    progressRepo.listAll(),
  ]);

  const items = mergeResourceProgress(resources, progressList);
  const { allTags, allCategories, allTopicIds } = collectResourceMeta(resources);
  const stats = computeResourceStats(items);

  return { items, allTags, allCategories, allTopicIds, stats };
}

export async function createResource(
  db: UberPrepDatabase,
  input: CreateResourceInput,
): Promise<ResourceRecord> {
  const repo = createResourcesRepository(db);
  const now = nowIso();

  const record: ResourceRecord = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    url: input.url || undefined,
    type: input.type,
    category: input.category,
    topicIds: input.topicIds ?? [],
    tags: input.tags ?? [],
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    isFavorite: false,
    sourceType: "manual",
    lifecycleStatus: "active",
    linkedPlanBlockIds: input.linkedPlanBlockIds ?? [],
    linkedNoteIds: [],
    createdAt: now,
    updatedAt: now,
  };

  await repo.upsert(record);
  return record;
}

export async function updateResource(
  db: UberPrepDatabase,
  id: string,
  input: UpdateResourceInput,
): Promise<void> {
  const repo = createResourcesRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;

  const updated: ResourceRecord = {
    ...existing,
    ...input,
    url: input.url !== undefined ? input.url || undefined : existing.url,
    updatedAt: nowIso(),
  };
  await repo.upsert(updated);
}

export async function toggleFavorite(db: UberPrepDatabase, id: string): Promise<void> {
  const repo = createResourcesRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;
  await repo.upsert({ ...existing, isFavorite: !existing.isFavorite, updatedAt: nowIso() });
}

export async function archiveResource(db: UberPrepDatabase, id: string): Promise<void> {
  const repo = createResourcesRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;
  await repo.upsert({ ...existing, lifecycleStatus: "archived", updatedAt: nowIso() });
}

export async function deleteResource(db: UberPrepDatabase, id: string): Promise<void> {
  const repo = createResourcesRepository(db);
  const progressRepo = createResourceProgressRepository(db);
  const progress = await progressRepo.findByResourceId(id);
  if (progress) await progressRepo.delete(progress.id);
  await repo.delete(id);
}

export async function updateResourceStatus(
  db: UberPrepDatabase,
  resourceId: string,
  status: ResourceStatus,
): Promise<void> {
  const progressRepo = createResourceProgressRepository(db);
  const now = nowIso();

  const existing = await progressRepo.findByResourceId(resourceId);
  if (existing) {
    const updated: ResourceProgressRecord = {
      ...existing,
      status,
      completedAt: status === "completed" ? (existing.completedAt ?? now) : existing.completedAt,
      startedAt:
        status === "in_progress" || status === "completed"
          ? (existing.startedAt ?? now)
          : existing.startedAt,
      updatedAt: now,
    };
    await progressRepo.upsert(updated);
  } else {
    const record: ResourceProgressRecord = {
      id: crypto.randomUUID(),
      resourceId,
      status,
      progressPercent: status === "completed" ? 100 : 0,
      startedAt: status === "in_progress" || status === "completed" ? now : undefined,
      completedAt: status === "completed" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };
    await progressRepo.upsert(record);
  }
}

export async function openResource(db: UberPrepDatabase, resourceId: string): Promise<void> {
  const progressRepo = createResourceProgressRepository(db);
  const now = nowIso();
  const existing = await progressRepo.findByResourceId(resourceId);

  if (existing) {
    await progressRepo.upsert({
      ...existing,
      lastOpenedAt: now,
      status: existing.status === "not_started" ? "in_progress" : existing.status,
      startedAt: existing.startedAt ?? now,
      updatedAt: now,
    });
  } else {
    await progressRepo.upsert({
      id: crypto.randomUUID(),
      resourceId,
      status: "in_progress",
      progressPercent: 0,
      startedAt: now,
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function updateResourceNotes(
  db: UberPrepDatabase,
  resourceId: string,
  notes: string,
): Promise<void> {
  const progressRepo = createResourceProgressRepository(db);
  const now = nowIso();
  const existing = await progressRepo.findByResourceId(resourceId);
  if (existing) {
    await progressRepo.upsert({ ...existing, notes, updatedAt: now });
  } else {
    await progressRepo.upsert({
      id: crypto.randomUUID(),
      resourceId,
      status: "not_started",
      progressPercent: 0,
      notes,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function createResourceReview(
  db: UberPrepDatabase,
  resourceId: string,
): Promise<void> {
  const reviewsRepo = createReviewsRepository(db);
  const now = nowIso();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const review: ReviewRecord = {
    id: crypto.randomUUID(),
    sourceType: "resource",
    sourceId: resourceId,
    status: "scheduled",
    scheduledFor: tomorrow,
    originalScheduledFor: tomorrow,
    cycleIndex: 0,
    reason: "marked_manually",
    history: [],
    markedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await reviewsRepo.upsert(review);
}

export async function getResourcesDashboardData(db: UberPrepDatabase): Promise<{
  inProgress: number;
  completedThisWeek: number;
}> {
  const resourceRepo = createResourcesRepository(db);
  const progressRepo = createResourceProgressRepository(db);

  const [resources, progressList] = await Promise.all([
    resourceRepo.list(),
    progressRepo.listAll(),
  ]);

  const progressMap = new Map(progressList.map((p) => [p.resourceId, p]));
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let inProgress = 0;
  let completedThisWeek = 0;

  for (const resource of resources) {
    if (resource.lifecycleStatus !== "active") continue;
    const p = progressMap.get(resource.id);
    if (!p) continue;
    if (p.status === "in_progress") inProgress++;
    if (p.status === "completed" && p.completedAt && p.completedAt >= weekAgo) completedThisWeek++;
  }

  return { inProgress, completedThisWeek };
}
