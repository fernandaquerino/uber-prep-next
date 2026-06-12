import type { MockType, MockStatus, RubricRating } from "@/types/database";

export type { MockType, MockStatus, RubricRating };

export const MOCK_TYPE_LABELS: Record<string, string> = {
  coding: "Coding",
  frontend_coding: "Frontend Coding",
  system_design: "System Design",
  behavioral: "Behavioral",
  full_loop: "Full Loop",
  // legacy
  Coding: "Coding",
  "Frontend Coding": "Frontend Coding",
  "System Design": "System Design",
  Behavioral: "Behavioral",
  "Full Loop": "Full Loop",
};

export const MOCK_STATUS_LABELS: Record<MockStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const RUBRIC_RATING_LABELS: Record<RubricRating, string> = {
  0: "Não avaliado",
  1: "Muito fraco",
  2: "Abaixo do esperado",
  3: "Adequado",
  4: "Bom",
  5: "Excelente",
};

/** Canonical mock types accepted by the new system */
export const CANONICAL_MOCK_TYPES = [
  "coding",
  "frontend_coding",
  "system_design",
  "behavioral",
  "full_loop",
] as const;

export type CanonicalMockType = (typeof CANONICAL_MOCK_TYPES)[number];

export function normalizeMockType(type: MockType): CanonicalMockType {
  const map: Record<string, CanonicalMockType> = {
    Coding: "coding",
    "Frontend Coding": "frontend_coding",
    "System Design": "system_design",
    Behavioral: "behavioral",
    "Full Loop": "full_loop",
  };
  return (map[type] as CanonicalMockType | undefined) ?? (type as CanonicalMockType);
}

export function getMockTypeLabel(type: MockType): string {
  return MOCK_TYPE_LABELS[type] ?? type;
}
