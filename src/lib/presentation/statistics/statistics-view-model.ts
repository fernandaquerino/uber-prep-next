import { SKILL_AREAS, type SkillAreaId } from "@/lib/data/skill-topics";
import {
  calculateReadiness,
  type AnalyticsSnapshot,
  type EvidenceRecord,
} from "@/lib/domain/analytics";
import { TIMER_SOURCE_LABELS } from "@/lib/domain/timer";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type {
  FlashcardRecord,
  PlanProgressRecord,
  QuizAnswerRecord,
  TimerSessionRecord,
} from "@/types/database";

export type StatisticsPeriod = "7d" | "14d" | "28d" | "all";

export type StatisticsMetric = {
  id: "time" | "sessions" | "adherence" | "accuracy" | "flashcards";
  label: string;
  value: string;
  comparison: number | null;
  hasData: boolean;
};

export type StatisticsWeek = {
  weekStart: string;
  label: string;
  plannedMinutes: number;
  actualMinutes: number;
};

export type StatisticsReadinessPoint = {
  weekStart: string;
  label: string;
  value: number | null;
};

export type StatisticsCategory = {
  id: SkillAreaId;
  label: string;
  seconds: number;
  percentage: number;
};

export type StatisticsCoverage = {
  id: SkillAreaId;
  label: string;
  covered: number;
  total: number;
  percentage: number;
};

export type StatisticsSession = {
  id: string;
  date: string;
  category: string;
  categoryLabel: string;
  title: string;
  activity: string;
  duration: string;
  focus: "Excelente" | "Bom" | "Regular";
};

export type StatisticsViewModel = {
  period: StatisticsPeriod;
  periodLabel: string;
  metrics: StatisticsMetric[];
  weeks: StatisticsWeek[];
  readiness: StatisticsReadinessPoint[];
  categories: StatisticsCategory[];
  coverage: StatisticsCoverage[];
  sessions: StatisticsSession[];
  hasActivity: boolean;
};

type StatisticsInput = {
  period: StatisticsPeriod;
  today: string;
  analytics: AnalyticsSnapshot;
  timerSessions: TimerSessionRecord[];
  quizAnswers: QuizAnswerRecord[];
  flashcards: FlashcardRecord[];
  planProgress: PlanProgressRecord[];
};

const PERIOD_DAYS: Record<Exclude<StatisticsPeriod, "all">, number> = {
  "7d": 7,
  "14d": 14,
  "28d": 28,
};

function parseDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateString(date);
}

function getMonday(value: string): string {
  const date = parseDate(value);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return toDateString(date);
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(parseDate(value))
    .replace(".", "");
}

function formatTableDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "UTC",
  }).format(parseDate(value));
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}

function getPeriodStart(period: StatisticsPeriod, today: string, dates: string[]): string {
  if (period === "all") return dates.sort()[0] ?? today;
  return addDays(today, -(PERIOD_DAYS[period] - 1));
}

function inRange(value: string | undefined, start: string, end: string): boolean {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= start && date <= end;
}

function percentageChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function getPreviousRange(start: string, end: string): { start: string; end: string } {
  const duration = Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / 86_400_000);
  return {
    start: addDays(start, -(duration + 1)),
    end: addDays(start, -1),
  };
}

function validSessions(sessions: TimerSessionRecord[]): TimerSessionRecord[] {
  return sessions.filter(
    (session) => session.status !== "cancelled" && session.actualDurationSeconds > 0,
  );
}

function buildWeeks(sessions: TimerSessionRecord[], start: string, end: string): StatisticsWeek[] {
  const firstWeek = getMonday(start);
  const weeks: StatisticsWeek[] = [];

  for (let cursor = firstWeek; cursor <= end; cursor = addDays(cursor, 7)) {
    const weekEnd = addDays(cursor, 6);
    const items = sessions.filter((session) => inRange(session.date, cursor, weekEnd));
    weeks.push({
      weekStart: cursor,
      label: formatShortDate(cursor),
      plannedMinutes: Math.round(
        items.reduce(
          (sum, session) =>
            sum + (session.targetDurationSeconds ?? session.actualDurationSeconds),
          0,
        ) / 60,
      ),
      actualMinutes: Math.round(
        items.reduce((sum, session) => sum + session.actualDurationSeconds, 0) / 60,
      ),
    });
  }

  return weeks.slice(-8);
}

function buildReadiness(
  evidence: EvidenceRecord[],
  plannedTopicIds: string[],
  weeks: StatisticsWeek[],
): StatisticsReadinessPoint[] {
  return weeks.slice(-6).map((week) => {
    const weekEnd = addDays(week.weekStart, 6);
    const cumulative = evidence.filter((item) => item.occurredAt.slice(0, 10) <= weekEnd);
    return {
      weekStart: week.weekStart,
      label: formatShortDate(week.weekStart),
      value: calculateReadiness(cumulative, plannedTopicIds, `${weekEnd}T23:59:59.999Z`).score,
    };
  });
}

function focusLabel(session: TimerSessionRecord): StatisticsSession["focus"] {
  if (!session.targetDurationSeconds) return "Bom";
  const ratio = session.actualDurationSeconds / session.targetDurationSeconds;
  if (ratio >= 0.9) return "Excelente";
  if (ratio >= 0.6) return "Bom";
  return "Regular";
}

export function buildStatisticsViewModel(input: StatisticsInput): StatisticsViewModel {
  const allDates = [
    ...input.timerSessions.map((item) => item.date),
    ...input.analytics.evidence.map((item) => item.occurredAt.slice(0, 10)),
  ];
  const start = getPeriodStart(input.period, input.today, allDates);
  const previous = getPreviousRange(start, input.today);
  const sessions = validSessions(input.timerSessions);
  const currentSessions = sessions.filter((item) => inRange(item.date, start, input.today));
  const previousSessions = sessions.filter((item) => inRange(item.date, previous.start, previous.end));
  const currentSeconds = currentSessions.reduce(
    (sum, session) => sum + session.actualDurationSeconds,
    0,
  );
  const previousSeconds = previousSessions.reduce(
    (sum, session) => sum + session.actualDurationSeconds,
    0,
  );

  const currentAnswers = input.quizAnswers.filter(
    (answer) => answer.isSubmitted && inRange(answer.submittedAt ?? answer.updatedAt, start, input.today),
  );
  const previousAnswers = input.quizAnswers.filter(
    (answer) =>
      answer.isSubmitted &&
      inRange(answer.submittedAt ?? answer.updatedAt, previous.start, previous.end),
  );
  const accuracy = (answers: QuizAnswerRecord[]) => {
    const scored = answers.filter((answer) => answer.score !== null);
    if (scored.length === 0) return null;
    return Math.round(
      (scored.reduce((sum, answer) => sum + (answer.score ?? 0), 0) / scored.length) * 100,
    );
  };

  const currentProgress = input.planProgress.filter((item) =>
    inRange(item.completedAt ?? item.skippedAt ?? item.updatedAt, start, input.today),
  );
  const previousProgress = input.planProgress.filter((item) =>
    inRange(item.completedAt ?? item.skippedAt ?? item.updatedAt, previous.start, previous.end),
  );
  const adherence = (items: PlanProgressRecord[]) => {
    const decided = items.filter((item) =>
      ["completed", "skipped", "stuck"].includes(item.status),
    );
    if (decided.length === 0) return null;
    return Math.round(
      (decided.filter((item) => item.status === "completed").length / decided.length) * 100,
    );
  };

  const flashcardPractices = (from: string, to: string) =>
    input.flashcards.reduce(
      (sum, card) =>
        sum +
        card.reviews.filter((review) => inRange(review.date, from, to)).length,
      0,
    );

  const currentAccuracy = accuracy(currentAnswers);
  const previousAccuracy = accuracy(previousAnswers);
  const currentAdherence = adherence(currentProgress);
  const previousAdherence = adherence(previousProgress);
  const currentFlashcards = flashcardPractices(start, input.today);
  const previousFlashcards = flashcardPractices(previous.start, previous.end);
  const weeks = buildWeeks(currentSessions, start, input.today);

  const categorySeconds = new Map<SkillAreaId, number>();
  for (const evidence of input.analytics.evidence) {
    if (evidence.kind !== "time" || !inRange(evidence.occurredAt, start, input.today)) continue;
    categorySeconds.set(
      evidence.category,
      (categorySeconds.get(evidence.category) ?? 0) + (evidence.value ?? 0),
    );
  }
  const largestCategory = Math.max(1, ...categorySeconds.values());

  const skillsByArea = new Map(
    SKILL_AREAS.map((area) => [
      area.id,
      input.analytics.skills.filter((skill) => skill.area === area.id),
    ]),
  );

  return {
    period: input.period,
    periodLabel:
      input.period === "all"
        ? "Todo o período"
        : `${PERIOD_DAYS[input.period]} dias`,
    metrics: [
      {
        id: "time",
        label: "Tempo total",
        value: formatDuration(currentSeconds),
        comparison: percentageChange(currentSeconds, previousSeconds),
        hasData: currentSeconds > 0,
      },
      {
        id: "sessions",
        label: "Sessões",
        value: String(currentSessions.length),
        comparison: percentageChange(currentSessions.length, previousSessions.length),
        hasData: currentSessions.length > 0,
      },
      {
        id: "adherence",
        label: "Aderência",
        value: currentAdherence === null ? "Sem dados" : `${currentAdherence}%`,
        comparison:
          currentAdherence === null || previousAdherence === null
            ? null
            : currentAdherence - previousAdherence,
        hasData: currentAdherence !== null,
      },
      {
        id: "accuracy",
        label: "Taxa de acerto",
        value: currentAccuracy === null ? "Sem dados" : `${currentAccuracy}%`,
        comparison:
          currentAccuracy === null || previousAccuracy === null
            ? null
            : currentAccuracy - previousAccuracy,
        hasData: currentAccuracy !== null,
      },
      {
        id: "flashcards",
        label: "Flashcards",
        value: String(currentFlashcards),
        comparison: percentageChange(currentFlashcards, previousFlashcards),
        hasData: currentFlashcards > 0,
      },
    ],
    weeks,
    readiness: buildReadiness(input.analytics.evidence, input.analytics.plannedTopicIds, weeks),
    categories: SKILL_AREAS.map((area) => ({
      id: area.id,
      label: area.label,
      seconds: categorySeconds.get(area.id) ?? 0,
      percentage: Math.round(((categorySeconds.get(area.id) ?? 0) / largestCategory) * 100),
    })).filter((item) => item.seconds > 0),
    coverage: SKILL_AREAS.map((area) => {
      const skills = skillsByArea.get(area.id) ?? [];
      const covered = skills.filter((skill) => skill.evidenceCount > 0).length;
      return {
        id: area.id,
        label: area.label,
        covered,
        total: skills.length,
        percentage: skills.length === 0 ? 0 : Math.round((covered / skills.length) * 100),
      };
    }).filter((item) => item.total > 0),
    sessions: currentSessions.slice(0, 8).map((session) => ({
      id: session.id,
      date: formatTableDate(session.date),
      category: session.category,
      categoryLabel: getCategoryLabel(session.category),
      title: session.title,
      activity: TIMER_SOURCE_LABELS[session.sourceType],
      duration: formatDuration(session.actualDurationSeconds),
      focus: focusLabel(session),
    })),
    hasActivity:
      currentSessions.length > 0 ||
      currentAnswers.length > 0 ||
      currentProgress.length > 0 ||
      currentFlashcards > 0,
  };
}
