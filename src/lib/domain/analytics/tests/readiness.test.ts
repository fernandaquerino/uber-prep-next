// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateReadiness } from "../readiness";
import type { EvidenceRecord } from "../analytics.types";

function evidence(
  id: string,
  source: EvidenceRecord["source"],
  kind: EvidenceRecord["kind"],
  value: number,
): EvidenceRecord {
  return {
    id,
    source,
    sourceId: id,
    category: "algo",
    topicId: "arrays-hashing",
    kind,
    value,
    weight: 1,
    occurredAt: "2026-06-10T12:00:00.000Z",
  };
}

describe("calculateReadiness", () => {
  it("returns null instead of zero when evidence is insufficient", () => {
    const result = calculateReadiness(
      [evidence("q1", "quiz", "success", 1)],
      ["arrays-hashing"],
      "2026-06-12T12:00:00.000Z",
    );

    expect(result.score).toBeNull();
    expect(result.confidence).toBe("insufficient_data");
    expect(result.missingEvidence.length).toBeGreaterThan(0);
  });

  it("calculates readiness from multiple evaluated sources", () => {
    const items = [
      evidence("q1", "quiz", "success", 1),
      evidence("q2", "quiz", "success", 0.8),
      evidence("r1", "review", "review", 0.85),
      evidence("r2", "review", "review", 1),
      evidence("p1", "playground", "success", 0.9),
      evidence("m1", "mock", "mock_strength", 1),
    ];
    const result = calculateReadiness(items, ["arrays-hashing"], "2026-06-12T12:00:00.000Z");

    expect(result.score).not.toBeNull();
    expect(result.score).toBeGreaterThan(50);
    expect(result.sourceCount).toBe(4);
  });
});
