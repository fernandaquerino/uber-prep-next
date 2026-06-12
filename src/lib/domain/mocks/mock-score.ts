import type { MockRubricResult, RubricRating } from "@/types/database";

/**
 * Calculate a mock score from rubric results.
 *
 * Rules:
 * - Ratings of 0 ("not evaluated") are excluded from the average.
 * - If ALL criteria are 0, score is null ("Não avaliado").
 * - Score is expressed as a percentage: average_of_evaluated / 5 * 100.
 * - Score is rounded to nearest integer.
 */
export function calculateMockScore(rubricResult: MockRubricResult): number | null {
  const evaluated = rubricResult.criteria.filter((c) => c.rating !== 0);
  if (evaluated.length === 0) return null;
  const sum = evaluated.reduce((acc, c) => acc + c.rating, 0);
  const avg = sum / evaluated.length;
  return Math.round((avg / 5) * 100);
}

/** Format a score value for display */
export function formatMockScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "Não avaliado";
  return `${score}%`;
}

/** Format a legacy readiness score (stored as 1-100) */
export function formatLegacyScore(score: number | undefined): string {
  if (score === undefined) return "Não avaliado";
  return `${score}% (legado)`;
}

/** Classify score into a rating level for UI */
export function scoreToBadge(score: number | null | undefined): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (score === null || score === undefined) return { label: "Não avaliado", variant: "outline" };
  if (score >= 80) return { label: `${score}%`, variant: "default" };
  if (score >= 60) return { label: `${score}%`, variant: "secondary" };
  return { label: `${score}%`, variant: "destructive" };
}

/**
 * Given an array of criteria ratings, return the evaluated ones and their average.
 */
export function getRubricStats(criteria: Array<{ rating: RubricRating }>) {
  const evaluated = criteria.filter((c) => c.rating !== 0);
  const notEvaluated = criteria.filter((c) => c.rating === 0);
  const avg =
    evaluated.length > 0
      ? evaluated.reduce((s, c) => s + c.rating, 0) / evaluated.length
      : null;
  return {
    total: criteria.length,
    evaluatedCount: evaluated.length,
    notEvaluatedCount: notEvaluated.length,
    average: avg,
    scorePercent: avg !== null ? Math.round((avg / 5) * 100) : null,
  };
}
