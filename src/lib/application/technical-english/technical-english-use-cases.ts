
import type { UberPrepDatabase } from "@/lib/db/schema";
import type { TechnicalEnglishRecord, TechnicalEnglishPracticeRecord, ReviewRecord } from "@/types/database";
import type {
  CreateTechnicalEnglishInput,
  UpdateTechnicalEnglishInput,
  TechnicalEnglishPageData,
} from "@/lib/domain/technical-english";
import {
  collectTechnicalEnglishMeta,
  computeTechnicalEnglishStats,
} from "@/lib/domain/technical-english";
import {
  createTechnicalEnglishRepository,
  createTechnicalEnglishPracticeRepository,
} from "@/lib/repositories/technical-english.repository";
import { createReviewsRepository } from "@/lib/repositories/reviews.repository";

function nowIso() {
  return new Date().toISOString();
}

export async function getTechnicalEnglishPageData(
  db: UberPrepDatabase,
): Promise<TechnicalEnglishPageData> {
  const repo = createTechnicalEnglishRepository(db);
  const practiceRepo = createTechnicalEnglishPracticeRepository(db);

  const [items, practices] = await Promise.all([repo.list(), practiceRepo.listAll()]);

  const practicedIds = new Set(practices.map((p) => p.itemId));
  const { allTags, allScenarios } = collectTechnicalEnglishMeta(items);
  const stats = computeTechnicalEnglishStats(items, practicedIds);

  return { items, practices, allTags, allScenarios, stats };
}

export async function createTechnicalEnglishItem(
  db: UberPrepDatabase,
  input: CreateTechnicalEnglishInput,
): Promise<TechnicalEnglishRecord> {
  const repo = createTechnicalEnglishRepository(db);
  const now = nowIso();

  const record: TechnicalEnglishRecord = {
    id: crypto.randomUUID(),
    type: input.type,
    scenario: input.scenario,
    title: input.title,
    content: input.content,
    translation: input.translation,
    category: input.category,
    topicIds: input.topicIds ?? [],
    tags: input.tags ?? [],
    isFavorite: false,
    sourceType: "manual",
    lifecycleStatus: "active",
    createdAt: now,
    updatedAt: now,
  };

  await repo.upsert(record);
  return record;
}

export async function updateTechnicalEnglishItem(
  db: UberPrepDatabase,
  id: string,
  input: UpdateTechnicalEnglishInput,
): Promise<void> {
  const repo = createTechnicalEnglishRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;

  await repo.upsert({ ...existing, ...input, updatedAt: nowIso() });
}

export async function toggleTechEnglishFavorite(
  db: UberPrepDatabase,
  id: string,
): Promise<void> {
  const repo = createTechnicalEnglishRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;
  await repo.upsert({ ...existing, isFavorite: !existing.isFavorite, updatedAt: nowIso() });
}

export async function archiveTechnicalEnglishItem(
  db: UberPrepDatabase,
  id: string,
): Promise<void> {
  const repo = createTechnicalEnglishRepository(db);
  const existing = await repo.findById(id);
  if (!existing) return;
  await repo.upsert({ ...existing, lifecycleStatus: "archived", updatedAt: nowIso() });
}

export async function saveTechEnglishPractice(
  db: UberPrepDatabase,
  itemId: string,
  response: string,
): Promise<TechnicalEnglishPracticeRecord> {
  const repo = createTechnicalEnglishPracticeRepository(db);
  const now = nowIso();

  const record: TechnicalEnglishPracticeRecord = {
    id: crypto.randomUUID(),
    itemId,
    response,
    createdAt: now,
    updatedAt: now,
  };
  await repo.upsert(record);
  return record;
}

export async function createTechEnglishReview(
  db: UberPrepDatabase,
  itemId: string,
): Promise<void> {
  const reviewsRepo = createReviewsRepository(db);
  const now = nowIso();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const review: ReviewRecord = {
    id: crypto.randomUUID(),
    sourceType: "technical_english",
    sourceId: itemId,
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

export async function getTechEnglishDashboardData(db: UberPrepDatabase): Promise<{
  forReview: number;
  practicedRecently: number;
}> {
  const practiceRepo = createTechnicalEnglishPracticeRepository(db);
  const reviewsRepo = createReviewsRepository(db);

  const allReviews = await reviewsRepo.list();
  const practices = await practiceRepo.listAll();
  const reviews = allReviews.filter((r) => r.sourceType === "technical_english");

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const practicedRecently = practices.filter((p) => p.createdAt >= weekAgo).length;
  const forReview = reviews.filter(
    (r) => r.status !== "completed" && r.status !== "dismissed" && r.scheduledFor <= today,
  ).length;

  return { forReview, practicedRecently };
}
