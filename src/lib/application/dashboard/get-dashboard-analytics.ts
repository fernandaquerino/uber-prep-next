import type { UberPrepDatabase } from "@/lib/db/schema";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import { SKILL_AREAS } from "@/lib/data/skill-topics";
import {
  buildAnalyticsRecommendations,
  buildEvidenceRecords,
  buildModuleMetrics,
  buildSkillTree,
  buildTimeByCategory,
  buildWeeklyEvolution,
  calculateReadiness,
  calculateReadinessByArea,
  calculateRetention,
  getRiskTopics,
  type AnalyticsSnapshot,
} from "@/lib/domain/analytics";

export async function getDashboardAnalytics(
  db: UberPrepDatabase,
  today: string,
): Promise<AnalyticsSnapshot> {
  const [
    planProgress,
    reviews,
    flashcards,
    quizQuestions,
    quizAnswers,
    playgroundSolutions,
    timerSessions,
    mockEvidence,
    notes,
    resources,
    resourceProgress,
    technicalEnglishItems,
    technicalEnglishPractices,
  ] = await Promise.all([
    db.planProgress.toArray(),
    db.reviews.toArray(),
    db.flashcards.toArray(),
    db.quizQuestions.toArray(),
    db.quizAnswers.toArray(),
    db.playgroundSolutions.toArray(),
    db.timerSessions.toArray(),
    db.mockEvidence.toArray(),
    db.notes.toArray(),
    db.resources.toArray(),
    db.resourceProgress.toArray(),
    db.technicalEnglishItems.toArray(),
    db.technicalEnglishPractices.toArray(),
  ]);

  const generatedAt = new Date().toISOString();
  const { evidence, plannedTopicIds } = buildEvidenceRecords(
    {
      plan: STUDY_PLAN,
      planProgress,
      reviews,
      flashcards,
      quizQuestions,
      quizAnswers,
      playgroundSolutions,
      timerSessions,
      mockEvidence,
      notes,
      resources,
      resourceProgress,
      technicalEnglishItems,
      technicalEnglishPractices,
    },
    today,
  );
  const skills = buildSkillTree(evidence, plannedTopicIds, generatedAt);
  const readiness = calculateReadiness(evidence, plannedTopicIds, generatedAt);
  const readinessByArea = calculateReadinessByArea(evidence, plannedTopicIds, generatedAt).filter(
    (item) =>
      item.readiness.evidenceCount > 0 ||
      plannedTopicIds.some(
        (topicId) => skills.find((skill) => skill.topicId === topicId)?.area === item.area,
      ),
  );
  const risks = getRiskTopics(skills, evidence, plannedTopicIds);
  const strengths = skills
    .filter((skill) => skill.state === "mastered" || skill.state === "consistent")
    .sort((a, b) => (b.knowledge ?? 0) - (a.knowledge ?? 0))
    .slice(0, 5);
  const recommendations = buildAnalyticsRecommendations(risks, skills, readiness, evidence);

  return {
    generatedAt,
    evidence,
    plannedTopicIds,
    skills,
    readiness,
    readinessByArea,
    risks,
    strengths,
    recommendations,
    moduleMetrics: buildModuleMetrics(evidence),
    weeklyEvolution: buildWeeklyEvolution(evidence),
    timeByCategory: buildTimeByCategory(evidence),
    retention: calculateRetention(evidence),
  };
}

export const ANALYTICS_AREA_LABELS = Object.fromEntries(
  SKILL_AREAS.map((area) => [area.id, area.label]),
);
