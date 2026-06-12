import type { UberPrepDatabase } from "@/lib/db/schema";
import type { MockRecord, MockEvidence, FullInterviewSession } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";

export type MocksPageData = {
  mocks: MockRecord[];
  completedCount: number;
  draftCount: number;
  inProgressCount: number;
  recentEvidence: MockEvidence[];
  activeSessions: FullInterviewSession[];
  lastMockDate: string | null;
};

export async function getMocksPageData(
  db: UberPrepDatabase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _today: CalendarDate,
): Promise<MocksPageData> {
  const [mocks, allEvidence, sessions] = await Promise.all([
    db.mocks.orderBy("date").reverse().toArray(),
    db.mockEvidence.orderBy("createdAt").reverse().limit(20).toArray(),
    db.fullInterviewSessions
      .filter((s) => s.status === "in_progress" || s.status === "draft")
      .toArray(),
  ]);

  const completedCount = mocks.filter((m) => m.status === "completed").length;
  const draftCount = mocks.filter((m) => m.status === "draft").length;
  const inProgressCount = mocks.filter((m) => m.status === "in_progress").length;
  const lastMockDate = mocks[0]?.date ?? null;

  return {
    mocks,
    completedCount,
    draftCount,
    inProgressCount,
    recentEvidence: allEvidence,
    activeSessions: sessions,
    lastMockDate,
  };
}
