import type { UberPrepDatabase } from "@/lib/db/schema";
import type { QuizQuestionRecord } from "@/types/database";

export async function createQuestionFromFlashcard(
  db: UberPrepDatabase,
  flashcardId: string,
): Promise<string> {
  const flashcard = await db.flashcards.get(flashcardId);
  if (!flashcard) throw new Error(`Flashcard not found: ${flashcardId}`);

  const existing = await db.quizQuestions
    .where("sourceType")
    .equals("flashcard")
    .filter((question) => question.sourceId === flashcardId)
    .first();
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const record: QuizQuestionRecord = {
    id: `quiz-from-flashcard:${flashcardId}`,
    prompt: flashcard.front,
    type: "open_text",
    category: flashcard.category,
    difficulty: "medium",
    topicIds: flashcard.tags.length > 0 ? flashcard.tags : [flashcard.category],
    tags: flashcard.tags,
    referenceAnswer: flashcard.back,
    sourceType: "flashcard",
    sourceId: flashcardId,
    lifecycleStatus: "active",
    createdAt: now,
    updatedAt: now,
  };

  await db.quizQuestions.put(record);
  return record.id;
}
