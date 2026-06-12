// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("weekly report print layout", () => {
  it("hides controls and avoids splitting report sections", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain("@media print");
    expect(css).toContain(".no-print");
    expect(css).toContain("break-inside: avoid");
  });
});
