// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildSkillTree } from "../skill-tree";
import type { EvidenceRecord } from "../analytics.types";

describe("analytics performance", () => {
  it("builds a large derived skill snapshot without persistence", () => {
    const evidence: EvidenceRecord[] = Array.from({ length: 5_000 }, (_, index) => ({
      id: `e-${index}`,
      source: index % 2 === 0 ? "quiz" : "review",
      sourceId: `source-${index}`,
      category: "algo",
      topicId: index % 2 === 0 ? "big-o" : "arrays-hashing",
      kind: index % 3 === 0 ? "failure" : "success",
      value: index % 3 === 0 ? 0 : 1,
      weight: 1,
      occurredAt: "2026-06-11T12:00:00.000Z",
    }));

    const startedAt = performance.now();
    const result = buildSkillTree(
      evidence,
      ["big-o", "arrays-hashing"],
      "2026-06-12T12:00:00.000Z",
    );
    const elapsed = performance.now() - startedAt;

    expect(result).toHaveLength(2);
    expect(elapsed).toBeLessThan(1_000);
  });
});
