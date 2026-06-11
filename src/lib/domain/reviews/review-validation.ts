/** Types for which review is meaningful (not administrative/rest content). */
const NON_REVIEWABLE_TYPES = new Set(["pausa"]);

export function isBlockTypeReviewable(blockType: string): boolean {
  return !NON_REVIEWABLE_TYPES.has(blockType);
}

/**
 * Confidence threshold below which a review is auto-created.
 * Confidence 1 or 2 out of 5 is considered low.
 */
export const LOW_CONFIDENCE_THRESHOLD = 2;

/**
 * Difficulty threshold above which a review is auto-created.
 * Difficulty 4 or 5 out of 5 is considered high.
 */
export const HIGH_DIFFICULTY_THRESHOLD = 4;

export function isLowConfidence(confidence: number | undefined): boolean {
  return confidence !== undefined && confidence <= LOW_CONFIDENCE_THRESHOLD;
}

export function isHighDifficulty(difficulty: number | undefined): boolean {
  return difficulty !== undefined && difficulty >= HIGH_DIFFICULTY_THRESHOLD;
}
