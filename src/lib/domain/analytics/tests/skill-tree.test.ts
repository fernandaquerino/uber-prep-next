// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildSkillTree } from "../skill-tree";
import type { EvidenceRecord } from "../analytics.types";

function item(
  id: string,
  source: EvidenceRecord["source"],
  kind: EvidenceRecord["kind"],
  value?: number,
): EvidenceRecord {
  return {
    id,
    source,
    sourceId: id,
    category: "algo",
    topicId: "big-o",
    kind,
    value,
    weight: 1,
    occurredAt: "2026-06-11T10:00:00.000Z",
  };
}

describe("buildSkillTree", () => {
  it("keeps planned topics without activity as not started", () => {
    const skills = buildSkillTree([], ["big-o"], "2026-06-12T12:00:00.000Z");
    expect(skills[0]?.state).toBe("not_started");
    expect(skills[0]?.knowledge).toBeNull();
  });

  it("marks a topic consistent only with enough positive independent evidence", () => {
    const evidence = [
      item("q1", "quiz", "success", 0.8),
      item("q2", "quiz", "success", 0.7),
      item("r1", "review", "review", 0.8),
      item("r2", "review", "review", 0.75),
      item("p1", "playground", "success", 0.8),
      item("p2", "plan", "completion", 1),
    ];
    const skill = buildSkillTree(evidence, ["big-o"], "2026-06-12T12:00:00.000Z")[0];

    expect(skill?.state).toBe("consistent");
    expect(skill?.sourceCount).toBeGreaterThanOrEqual(2);
  });
});
