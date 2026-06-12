import type { MockRecord, MockEvidence, MockRubricResult } from "@/types/database";
import type { CanonicalMockType } from "./mock.types";
import { normalizeMockType } from "./mock.types";
import { getRubricDefinition } from "./mock-rubrics";

function generateId(): string {
  return `mev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const RATING_GAP_THRESHOLD = 2; // rating ≤ 2 → gap candidate
const RATING_STRENGTH_THRESHOLD = 4; // rating ≥ 4 → strength candidate

const AREA_BY_MOCK_TYPE: Record<CanonicalMockType, string> = {
  coding: "algo",
  frontend_coding: "fe_coding",
  system_design: "system",
  behavioral: "behavioral",
  full_loop: "mock",
};

/**
 * Generate MockEvidence from a completed mock record.
 *
 * Sources:
 * 1. Rubric criteria with extreme ratings (≥4 = strength, ≤2 = gap).
 *    Criteria with rating = 0 (not evaluated) are excluded.
 * 2. Explicit strengths[] items → always strength.
 * 3. Explicit weaknesses[] items → always gap.
 */
export function generateMockEvidence(
  mock: MockRecord,
  now: string = new Date().toISOString(),
): MockEvidence[] {
  const mockType = normalizeMockType(mock.type);
  const area = AREA_BY_MOCK_TYPE[mockType] ?? "general";
  const evidence: MockEvidence[] = [];

  // ── 1. Rubric criteria ────────────────────────────────────────────────────────
  if (mock.rubricResult) {
    const rubricEvidence = generateEvidenceFromRubric(mock.id, mock.rubricResult, area, now);
    evidence.push(...rubricEvidence);
  }

  // ── 2. Explicit strengths (from text fields) ─────────────────────────────────
  const strengths = Array.isArray(mock.strengths) ? mock.strengths : [];
  for (const s of strengths) {
    const text = s.trim();
    if (!text) continue;
    evidence.push({
      id: generateId(),
      mockId: mock.id,
      area,
      kind: "strength",
      description: text,
      confidence: 0.7,
      createdAt: now,
    });
  }

  // ── 3. Explicit weaknesses (from text fields) ─────────────────────────────────
  const weaknesses = Array.isArray(mock.weaknesses) ? mock.weaknesses : [];
  for (const w of weaknesses) {
    const text = w.trim();
    if (!text) continue;
    evidence.push({
      id: generateId(),
      mockId: mock.id,
      area,
      kind: "gap",
      description: text,
      confidence: 0.7,
      createdAt: now,
    });
  }

  return evidence;
}

function generateEvidenceFromRubric(
  mockId: string,
  rubricResult: MockRubricResult,
  area: string,
  now: string,
): MockEvidence[] {
  const evidence: MockEvidence[] = [];

  for (const criterion of rubricResult.criteria) {
    if (criterion.rating === 0) continue; // not evaluated — skip

    let kind: "strength" | "gap" | null = null;
    let confidence = 0;

    if (criterion.rating >= RATING_STRENGTH_THRESHOLD) {
      kind = "strength";
      confidence = criterion.rating === 5 ? 0.9 : 0.75;
    } else if (criterion.rating <= RATING_GAP_THRESHOLD) {
      kind = "gap";
      confidence = criterion.rating === 1 ? 0.9 : 0.75;
    }

    if (!kind) continue; // rating 3 (adequate) — not a clear strength or gap

    evidence.push({
      id: generateId(),
      mockId,
      area,
      criterionId: criterion.id,
      kind,
      description: `${criterion.label}: ${RATING_DESCRIPTIONS[criterion.rating] ?? ""}`,
      confidence,
      createdAt: now,
    });
  }

  return evidence;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Muito fraco — requer trabalho urgente.",
  2: "Abaixo do esperado — precisa de melhoria.",
  4: "Bom desempenho — ponto forte.",
  5: "Excelente — destaque positivo.",
};

/**
 * Return only the gap evidence (for review/recommendation creation).
 */
export function getGapEvidence(evidence: MockEvidence[]): MockEvidence[] {
  return evidence.filter((e) => e.kind === "gap");
}

/**
 * Return only the strength evidence.
 */
export function getStrengthEvidence(evidence: MockEvidence[]): MockEvidence[] {
  return evidence.filter((e) => e.kind === "strength");
}

/** Get rubric definition for a mock type (re-exported for convenience) */
export { getRubricDefinition, normalizeMockType };
