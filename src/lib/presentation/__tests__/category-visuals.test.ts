import { describe, it, expect } from "vitest";
import {
  getCategoryVisual,
  getCategoryLabel,
  getBlockTypeLabel,
  type CategoryVisualConfig,
} from "../category-visuals";

describe("getCategoryVisual", () => {
  it("returns algo config with green classes", () => {
    const config = getCategoryVisual("algo");
    expect(config.key).toBe("algo");
    expect(config.label).toBe("Algoritmos");
    expect(config.badge).toContain("emerald");
    expect(config.border).toContain("emerald");
    expect(config.dot).toContain("emerald");
  });

  it("returns system config with violet classes", () => {
    const config = getCategoryVisual("system");
    expect(config.key).toBe("system");
    expect(config.label).toBe("System Design");
    expect(config.badge).toContain("violet");
  });

  it("returns js config with pink classes", () => {
    const config = getCategoryVisual("js");
    expect(config.key).toBe("js");
    expect(config.label).toBe("JavaScript");
    expect(config.badge).toContain("pink");
  });

  it("returns fe_coding config with sky classes", () => {
    const config = getCategoryVisual("fe_coding");
    expect(config.key).toBe("fe_coding");
    expect(config.label).toBe("Frontend Coding");
    expect(config.badge).toContain("sky");
  });

  it("returns mock config with orange classes", () => {
    const config = getCategoryVisual("mock");
    expect(config.key).toBe("mock");
    expect(config.label).toBe("Mock Interview");
    expect(config.badge).toContain("orange");
  });

  it("returns behavioral config with amber classes", () => {
    const config = getCategoryVisual("behavioral");
    expect(config.key).toBe("behavioral");
    expect(config.label).toBe("Behavioral");
    expect(config.badge).toContain("amber");
  });

  it("returns fallback config for unknown category", () => {
    const config = getCategoryVisual("unknown_xyz");
    expect(config.key).toBe("general");
    expect(config.label).toBe("Geral");
  });

  it("all configs have required fields", () => {
    const categories = ["algo", "system", "js", "fe_coding", "mock", "behavioral"];
    const requiredFields: (keyof CategoryVisualConfig)[] = [
      "key",
      "label",
      "badge",
      "border",
      "background",
      "text",
      "dot",
    ];

    for (const category of categories) {
      const config = getCategoryVisual(category);
      for (const field of requiredFields) {
        expect(config[field], `${category}.${field}`).toBeTruthy();
      }
    }
  });
});

describe("getCategoryLabel (presentation layer)", () => {
  it("returns Algoritmos for algo", () => {
    expect(getCategoryLabel("algo")).toBe("Algoritmos");
  });

  it("returns System Design for system", () => {
    expect(getCategoryLabel("system")).toBe("System Design");
  });

  it("returns Geral for unknown category", () => {
    expect(getCategoryLabel("xyz")).toBe("Geral");
  });
});

describe("getBlockTypeLabel", () => {
  it("returns Teoria for teoria", () => {
    expect(getBlockTypeLabel("teoria")).toBe("Teoria");
  });

  it("returns Exercício for exercicio", () => {
    expect(getBlockTypeLabel("exercicio")).toBe("Exercício");
  });

  it("returns Revisão for revisao", () => {
    expect(getBlockTypeLabel("revisao")).toBe("Revisão");
  });

  it("returns Mock for mock", () => {
    expect(getBlockTypeLabel("mock")).toBe("Mock");
  });

  it("returns Pausa for pausa", () => {
    expect(getBlockTypeLabel("pausa")).toBe("Pausa");
  });

  it("passes through unknown type", () => {
    expect(getBlockTypeLabel("unknown_type")).toBe("unknown_type");
  });
});
