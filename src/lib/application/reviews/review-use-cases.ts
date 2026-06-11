import type { UberPrepDatabase } from "@/lib/db/schema";
import type { ReviewRecord, ReviewResult, ReviewReason } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import { addCalendarDays } from "@/lib/domain/schedule";
import { REVIEW_CYCLE } from "@/lib/db/constants";
import {
  isBlockTypeReviewable,
  isLowConfidence,
  isHighDifficulty,
  getNextCycleIndex,
  calculateNextReviewDate,
  isCycleCompleted,
} from "@/lib/domain/reviews";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import { DatabaseError } from "@/lib/db/errors";

// ─── ID helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  return `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPlanReviewId(blockId: string): string {
  return `plan-review:${blockId}`;
}

// ─── Block lookup ─────────────────────────────────────────────────────────────

export function findBlockInPlan(
  blockId: string,
): { title: string; category: string; type: string; estimatedMinutes: number } | null {
  for (const day of STUDY_PLAN.days) {
    for (const block of day.blocks) {
      if (block.id === blockId) {
        return {
          title: block.title,
          category: block.category,
          type: block.type,
          estimatedMinutes: block.estimatedMinutes,
        };
      }
    }
  }
  return null;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

async function findActiveReviewForBlock(
  db: UberPrepDatabase,
  blockId: string,
): Promise<ReviewRecord | undefined> {
  return db.reviews
    .where("sourceType")
    .equals("plan")
    .filter((r) => r.sourceId === blockId && (r.status === "scheduled" || r.status === "due"))
    .first();
}

// ─── Determine review reason from completion data ─────────────────────────────

function determineCompletionReason(confidence?: number, difficulty?: number): ReviewReason {
  if (isLowConfidence(confidence)) return "low_confidence";
  if (isHighDifficulty(difficulty)) return "high_difficulty";
  return "completed_plan_block";
}

// ─── Create review for completed plan block ───────────────────────────────────

/**
 * Called automatically after completing a block.
 * Creates a review scheduled for tomorrow if the block is reviewable
 * and there is no existing active review.
 */
export async function createReviewForCompletedBlock(
  db: UberPrepDatabase,
  blockId: string,
  completedOn: CalendarDate,
  confidence?: number,
  difficulty?: number,
): Promise<void> {
  try {
    const blockMeta = findBlockInPlan(blockId);
    if (!blockMeta || !isBlockTypeReviewable(blockMeta.type)) return;

    const existing = await findActiveReviewForBlock(db, blockId);
    if (existing) return;

    const reason = determineCompletionReason(confidence, difficulty);
    const scheduledFor = addCalendarDays(completedOn, REVIEW_CYCLE[0]); // +1 day
    const now = new Date().toISOString();

    const record: ReviewRecord = {
      id: createPlanReviewId(blockId),
      sourceType: "plan",
      sourceId: blockId,
      status: "scheduled",
      scheduledFor,
      originalScheduledFor: scheduledFor,
      cycleIndex: 0,
      reason,
      history: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.reviews.put(record);
  } catch (err) {
    throw new DatabaseError("Failed to create review for completed block", err);
  }
}

// ─── Create review for stuck block ───────────────────────────────────────────

/**
 * Called when a block is marked as stuck.
 * Creates a review for the next day with reason "stuck".
 */
export async function createReviewForStuckBlock(
  db: UberPrepDatabase,
  blockId: string,
  today: CalendarDate,
): Promise<void> {
  try {
    const blockMeta = findBlockInPlan(blockId);
    if (!blockMeta || !isBlockTypeReviewable(blockMeta.type)) return;

    const existing = await findActiveReviewForBlock(db, blockId);
    if (existing) {
      // Upgrade to stuck reason if already exists
      await db.reviews.put({
        ...existing,
        reason: "stuck",
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const scheduledFor = addCalendarDays(today, REVIEW_CYCLE[0]);
    const now = new Date().toISOString();

    const record: ReviewRecord = {
      id: createPlanReviewId(blockId),
      sourceType: "plan",
      sourceId: blockId,
      status: "scheduled",
      scheduledFor,
      originalScheduledFor: scheduledFor,
      cycleIndex: 0,
      reason: "stuck",
      history: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.reviews.put(record);
  } catch (err) {
    throw new DatabaseError("Failed to create review for stuck block", err);
  }
}

// ─── Mark block for review manually ──────────────────────────────────────────

export async function markBlockForReview(
  db: UberPrepDatabase,
  blockId: string,
  now: string,
): Promise<void> {
  try {
    const existing = await findActiveReviewForBlock(db, blockId);
    if (existing) return; // already marked

    const blockMeta = findBlockInPlan(blockId);
    const today = now.slice(0, 10) as CalendarDate;

    const record: ReviewRecord = {
      id: createPlanReviewId(blockId),
      sourceType: "plan",
      sourceId: blockId,
      status: "scheduled",
      scheduledFor: today,
      originalScheduledFor: today,
      cycleIndex: 0,
      reason: "marked_manually",
      markedAt: now,
      history: [],
      createdAt: now,
      updatedAt: now,
    };

    void blockMeta; // metadata available if needed for display
    await db.reviews.put(record);
  } catch (err) {
    throw new DatabaseError(`Failed to mark block ${blockId} for review`, err);
  }
}

// ─── Unmark block from review ─────────────────────────────────────────────────

/**
 * Cancels all pending (not yet completed) reviews for the given block.
 * Preserves completed review history.
 */
export async function unmarkBlockForReview(
  db: UberPrepDatabase,
  blockId: string,
  now: string,
): Promise<void> {
  try {
    const activeReviews = await db.reviews
      .where("sourceType")
      .equals("plan")
      .filter((r) => r.sourceId === blockId && (r.status === "scheduled" || r.status === "due"))
      .toArray();

    await db.reviews.bulkPut(
      activeReviews.map((r) => ({
        ...r,
        status: "cancelled" as const,
        cancelledAt: now,
        updatedAt: now,
      })),
    );
  } catch (err) {
    throw new DatabaseError(`Failed to unmark block ${blockId} from review`, err);
  }
}

// ─── Complete a review ────────────────────────────────────────────────────────

export async function completeReview(
  db: UberPrepDatabase,
  reviewId: string,
  result: ReviewResult,
  completedOn: CalendarDate,
  response?: string,
): Promise<{ nextReviewDate: CalendarDate | null }> {
  try {
    const review = await db.reviews.get(reviewId);
    if (!review) throw new Error(`Review not found: ${reviewId}`);

    const nextCycleIndex = getNextCycleIndex(review.cycleIndex, result);
    const nextReviewDate = calculateNextReviewDate({
      completedOn,
      currentCycleIndex: review.cycleIndex,
      result,
    });

    const now = new Date().toISOString();
    const attempt = {
      id: generateId(),
      date: now,
      result,
      previousCycleIndex: review.cycleIndex,
      nextCycleIndex,
      nextReviewAt: nextReviewDate,
      response,
    };

    const cycleCompleted = isCycleCompleted(nextCycleIndex);

    const updated: ReviewRecord = {
      ...review,
      status: cycleCompleted || !nextReviewDate ? "completed" : "scheduled",
      cycleIndex: nextCycleIndex,
      scheduledFor: nextReviewDate ?? review.scheduledFor,
      lastResult: result,
      lastRating: result,
      doneAt: now,
      history: [...review.history, attempt],
      updatedAt: now,
    };

    await db.reviews.put(updated);
    return { nextReviewDate };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Review not found")) throw err;
    throw new DatabaseError(`Failed to complete review ${reviewId}`, err);
  }
}

// ─── Postpone a review ────────────────────────────────────────────────────────

export async function postponeReview(
  db: UberPrepDatabase,
  reviewId: string,
  newDate: CalendarDate,
): Promise<void> {
  try {
    const review = await db.reviews.get(reviewId);
    if (!review) throw new Error(`Review not found: ${reviewId}`);

    await db.reviews.put({
      ...review,
      scheduledFor: newDate,
      status: "scheduled",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Review not found")) throw err;
    throw new DatabaseError(`Failed to postpone review ${reviewId}`, err);
  }
}

// ─── Dismiss a review ────────────────────────────────────────────────────────

export async function dismissReview(db: UberPrepDatabase, reviewId: string): Promise<void> {
  try {
    const review = await db.reviews.get(reviewId);
    if (!review) throw new Error(`Review not found: ${reviewId}`);

    const now = new Date().toISOString();
    await db.reviews.put({
      ...review,
      status: "dismissed",
      dismissedAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Review not found")) throw err;
    throw new DatabaseError(`Failed to dismiss review ${reviewId}`, err);
  }
}

// ─── Reopen a dismissed review ────────────────────────────────────────────────

export async function reopenReview(
  db: UberPrepDatabase,
  reviewId: string,
  today: CalendarDate,
): Promise<void> {
  try {
    const review = await db.reviews.get(reviewId);
    if (!review) throw new Error(`Review not found: ${reviewId}`);

    const now = new Date().toISOString();
    await db.reviews.put({
      ...review,
      status: "scheduled",
      scheduledFor: today,
      dismissedAt: undefined,
      cancelledAt: undefined,
      updatedAt: now,
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Review not found")) throw err;
    throw new DatabaseError(`Failed to reopen review ${reviewId}`, err);
  }
}

// ─── Create manual review ─────────────────────────────────────────────────────

export type CreateManualReviewInput = {
  title: string;
  category?: string;
  scheduledFor: CalendarDate;
  notes?: string;
  estimatedMinutes?: number;
};

export async function createManualReview(
  db: UberPrepDatabase,
  input: CreateManualReviewInput,
  now: string,
): Promise<void> {
  try {
    const id = generateId();
    const record: ReviewRecord = {
      id,
      sourceType: "manual",
      sourceId: id,
      status: "scheduled",
      scheduledFor: input.scheduledFor,
      originalScheduledFor: input.scheduledFor,
      cycleIndex: 0,
      reason: "marked_manually",
      legacyBlockLabel: input.title,
      markedAt: now,
      history: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.reviews.put(record);
  } catch (err) {
    throw new DatabaseError("Failed to create manual review", err);
  }
}

// ─── Has active review for block ─────────────────────────────────────────────

export async function hasActiveReviewForBlock(
  db: UberPrepDatabase,
  blockId: string,
): Promise<boolean> {
  const existing = await findActiveReviewForBlock(db, blockId);
  return existing !== undefined;
}
