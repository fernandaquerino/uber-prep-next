import type { FlashcardCreateInput } from "./flashcard.types";

export type FlashcardValidationError = {
  field: "front" | "back" | "category" | "tags";
  message: string;
};

const FRONT_MAX_LENGTH = 2000;
const BACK_MAX_LENGTH = 5000;
const TAG_MAX_LENGTH = 50;
const TAGS_MAX_COUNT = 20;

const VALID_CATEGORIES = [
  "algo",
  "system",
  "js",
  "fe_coding",
  "mock",
  "behavioral",
  "react",
  "english",
  "general",
];

export function validateFlashcardInput(
  input: Partial<FlashcardCreateInput>,
): FlashcardValidationError[] {
  const errors: FlashcardValidationError[] = [];

  if (input.front !== undefined) {
    const front = input.front.trim();
    if (!front) errors.push({ field: "front", message: "A pergunta é obrigatória." });
    else if (front.length > FRONT_MAX_LENGTH)
      errors.push({
        field: "front",
        message: `A pergunta não pode ultrapassar ${FRONT_MAX_LENGTH} caracteres.`,
      });
  }

  if (input.back !== undefined) {
    const back = input.back.trim();
    if (!back) errors.push({ field: "back", message: "A resposta é obrigatória." });
    else if (back.length > BACK_MAX_LENGTH)
      errors.push({
        field: "back",
        message: `A resposta não pode ultrapassar ${BACK_MAX_LENGTH} caracteres.`,
      });
  }

  if (input.category !== undefined) {
    if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
      errors.push({ field: "category", message: "Categoria inválida." });
    }
  }

  if (input.tags !== undefined) {
    if (input.tags.length > TAGS_MAX_COUNT) {
      errors.push({ field: "tags", message: `Máximo de ${TAGS_MAX_COUNT} tags por cartão.` });
    }
    for (const tag of input.tags) {
      if (tag.length > TAG_MAX_LENGTH) {
        errors.push({ field: "tags", message: `Tag muito longa: "${tag.slice(0, 20)}…"` });
        break;
      }
    }
  }

  return errors;
}

export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category);
}

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-áéíóúàèìòùâêîôûãõç]/g, "");
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const normalized = normalizeTag(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}
