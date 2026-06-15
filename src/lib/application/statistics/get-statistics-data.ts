import { getDashboardAnalytics } from "@/lib/application/dashboard/get-dashboard-analytics";
import {
  buildStatisticsViewModel,
  type StatisticsPeriod,
  type StatisticsViewModel,
} from "@/lib/presentation/statistics/statistics-view-model";

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export async function getStatisticsData(
  period: StatisticsPeriod,
): Promise<StatisticsViewModel> {
  const [{ getDb }, { runSeeds }] = await Promise.all([
    import("@/lib/db/db"),
    import("@/lib/db/seed"),
  ]);
  const db = getDb();
  await runSeeds(db);

  const today = getToday();
  const [analytics, timerSessions, quizAnswers, flashcards, planProgress] = await Promise.all([
    getDashboardAnalytics(db, today),
    db.timerSessions.orderBy("startedAt").reverse().toArray(),
    db.quizAnswers.toArray(),
    db.flashcards.toArray(),
    db.planProgress.toArray(),
  ]);

  return buildStatisticsViewModel({
    period,
    today,
    analytics,
    timerSessions,
    quizAnswers,
    flashcards,
    planProgress,
  });
}
