// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getRiskTopics } from "../risk-topics";
import type { EvidenceRecord, SkillTopicAnalytics } from "../analytics.types";

const skill: SkillTopicAnalytics = {
  topicId: "dynamic-programming",
  area: "algo",
  label: "Dynamic Programming",
  state: "at_risk",
  explanation: "Falhas repetidas.",
  evidenceCount: 3,
  sourceCount: 2,
  lastActivityAt: "2026-06-10",
  knowledge: 30,
  retention: 20,
  confidence: 30,
  recentActivity: 2,
  reviewCount: 1,
  quizCount: 2,
  mockCount: 0,
  timeSeconds: 0,
  noteCount: 0,
  resourceCount: 0,
  nextAction: "Revisar.",
};

const failure: EvidenceRecord = {
  id: "failure-1",
  source: "quiz",
  sourceId: "q1",
  category: "algo",
  topicId: "dynamic-programming",
  kind: "failure",
  value: 0,
  weight: 1,
  occurredAt: "2026-06-10",
};

describe("getRiskTopics", () => {
  it("does not create risk for a topic that was never planned", () => {
    expect(getRiskTopics([skill], [failure], [])).toEqual([]);
  });

  it("returns reasons and an action for a planned risky topic", () => {
    const risks = getRiskTopics(
      [skill],
      [failure, { ...failure, id: "failure-2" }],
      ["dynamic-programming"],
    );

    expect(risks).toHaveLength(1);
    expect(risks[0]?.reasons.length).toBeGreaterThan(0);
    expect(risks[0]?.recommendedAction).toContain("Dynamic Programming");
  });
});
