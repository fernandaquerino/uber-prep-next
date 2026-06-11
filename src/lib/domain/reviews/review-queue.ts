import type { CalendarDate } from "@/lib/domain/schedule";
import type { ReviewRecord } from "@/types/database";
import type { EffectiveScheduledDay } from "@/lib/domain/progress";
import type { ReviewQueueItem } from "./review.types";
import { getDaysOverdue, getReviewTimingStatus, isReviewDue } from "./review-selectors";
import { getReviewPriority, comparePriority } from "./review-priority";
import { STUDY_PLAN } from "@/lib/data/study-plan";

type BuildReviewQueueInput = {
  reviews: ReviewRecord[];
  effectiveSchedule: EffectiveScheduledDay[];
  today: CalendarDate;
};

function buildBlockLookupFromSchedule(
  schedule: EffectiveScheduledDay[],
): Map<string, EffectiveScheduledDay["items"][number]> {
  const map = new Map<string, EffectiveScheduledDay["items"][number]>();
  for (const day of schedule) {
    for (const block of day.items) {
      map.set(block.blockId, block);
    }
  }
  return map;
}

function findBlockInStaticPlan(
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

export function buildReviewQueue({
  reviews,
  effectiveSchedule,
  today,
}: BuildReviewQueueInput): ReviewQueueItem[] {
  const blockMap = buildBlockLookupFromSchedule(effectiveSchedule);

  const dueReviews = reviews.filter((r) => isReviewDue(r, today));

  const items: ReviewQueueItem[] = dueReviews.map((review) => {
    const daysOverdue = getDaysOverdue(review, today);
    const timingStatus = getReviewTimingStatus(review, today);
    const priority = getReviewPriority(review, today);

    let title = review.legacyBlockLabel ?? review.sourceId;
    let category: string | undefined;
    let type: string | undefined;
    let estimatedMinutes: number | undefined;

    if (review.sourceType === "plan") {
      const effective = blockMap.get(review.sourceId);
      if (effective) {
        title = effective.title;
        category = effective.category;
        type = effective.type;
        estimatedMinutes = effective.estimatedMinutes;
      } else {
        const staticBlock = findBlockInStaticPlan(review.sourceId);
        if (staticBlock) {
          title = staticBlock.title;
          category = staticBlock.category;
          type = staticBlock.type;
          estimatedMinutes = staticBlock.estimatedMinutes;
        }
      }
    }

    return {
      reviewId: review.id,
      sourceType: review.sourceType,
      sourceId: review.sourceId,
      title,
      category,
      type,
      scheduledFor: review.scheduledFor as CalendarDate,
      daysOverdue,
      timingStatus,
      reason: review.reason ?? "marked_manually",
      priority,
      cycleIndex: review.cycleIndex,
      estimatedMinutes,
      lastResult: review.lastResult ?? review.lastRating,
    };
  });

  return items.sort(compareQueueItems);
}

function compareQueueItems(a: ReviewQueueItem, b: ReviewQueueItem): number {
  const byPriority = comparePriority(a.priority, b.priority);
  if (byPriority !== 0) return byPriority;

  const byOverdue = b.daysOverdue - a.daysOverdue;
  if (byOverdue !== 0) return byOverdue;

  if (a.scheduledFor !== b.scheduledFor) {
    return a.scheduledFor < b.scheduledFor ? -1 : 1;
  }

  return a.reviewId.localeCompare(b.reviewId);
}
