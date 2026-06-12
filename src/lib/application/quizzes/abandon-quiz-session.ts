import type { UberPrepDatabase } from "@/lib/db/schema";

export async function abandonQuizSession(db: UberPrepDatabase, sessionId: string): Promise<void> {
  const session = await db.quizSessions.get(sessionId);
  if (!session) throw new Error(`Quiz session not found: ${sessionId}`);
  const now = new Date().toISOString();
  await db.quizSessions.put({
    ...session,
    status: "abandoned",
    abandonedAt: now,
    updatedAt: now,
  });
}
