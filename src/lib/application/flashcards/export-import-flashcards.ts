import type { UberPrepDatabase } from "@/lib/db/schema";
import type { FlashcardRecord } from "@/types/database";
import { validateFlashcardInput, normalizeTags } from "@/lib/domain/flashcards";
import { DatabaseError } from "@/lib/db/errors";

export type FlashcardExport = {
  version: 1;
  exportedAt: string;
  cards: FlashcardRecord[];
};

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export async function exportFlashcards(db: UberPrepDatabase): Promise<FlashcardExport> {
  const cards = await db.flashcards.toArray();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
  };
}

/** Import flashcards from a previously exported JSON.
 * Skips cards that already exist by ID or have duplicate front+category.
 */
export async function importFlashcards(db: UberPrepDatabase, data: unknown): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  if (
    typeof data !== "object" ||
    data === null ||
    !("version" in data) ||
    !Array.isArray((data as { cards?: unknown }).cards)
  ) {
    throw new Error("Formato de exportação inválido.");
  }

  const raw = data as FlashcardExport;
  const existingCards = await db.flashcards.toArray();
  const existingIds = new Set(existingCards.map((c) => c.id));

  const now = new Date().toISOString();

  for (const card of raw.cards) {
    if (existingIds.has(card.id)) {
      result.skipped++;
      continue;
    }

    const validationErrors = validateFlashcardInput({
      front: card.front,
      back: card.back,
      category: card.category,
      tags: card.tags ?? [],
    });

    if (validationErrors.length > 0) {
      result.errors.push(`Card "${card.front?.slice(0, 40)}": ${validationErrors[0]?.message}`);
      continue;
    }

    try {
      const record: FlashcardRecord = {
        ...card,
        tags: normalizeTags(card.tags ?? []),
        lifecycleStatus: card.lifecycleStatus ?? "active",
        source: card.source ?? "migrated",
        updatedAt: now,
      };
      await db.flashcards.put(record);
      result.imported++;
    } catch (err) {
      result.errors.push(
        `Card "${card.front?.slice(0, 40)}": ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    }
  }

  if (result.errors.length > 0 && result.imported === 0) {
    throw new DatabaseError("Nenhum cartão importado. Verifique o relatório de erros.", null);
  }

  return result;
}
