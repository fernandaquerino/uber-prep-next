import { describe, it, expect } from "vitest";
import {
  formatCalendarDate,
  formatMinutes,
  formatWeekdayLabel,
  getCategoryLabel,
  getStatusLabel,
} from "../plan-utils";
import type { CalendarDate } from "@/lib/domain/schedule";

const d = (s: string) => s as CalendarDate;

describe("formatCalendarDate", () => {
  it("formats 2026-06-11 as long date", () => {
    expect(formatCalendarDate(d("2026-06-11"))).toMatch(/11\s+de\s+junho/i);
  });

  it("formats 2026-06-11 as short date (DD/MM)", () => {
    const result = formatCalendarDate(d("2026-06-11"), "short");
    expect(result).toBe("11/06");
  });

  it("formats 2026-06-13 (sábado) correctly", () => {
    expect(formatCalendarDate(d("2026-06-13"))).toMatch(/13\s+de\s+junho/i);
  });
});

describe("formatMinutes", () => {
  it("returns 0 min for 0", () => expect(formatMinutes(0)).toBe("0 min"));
  it("returns minutes-only for < 60", () => expect(formatMinutes(45)).toBe("45 min"));
  it("returns hours-only for multiples of 60", () => expect(formatMinutes(120)).toBe("2h"));
  it("returns hours and minutes", () => expect(formatMinutes(90)).toBe("1h 30min"));
  it("handles 480 (8h)", () => expect(formatMinutes(480)).toBe("8h"));
  it("handles 240 (4h, sábado)", () => expect(formatMinutes(240)).toBe("4h"));
});

describe("formatWeekdayLabel", () => {
  it("formats thursday as Quinta-feira", () => {
    expect(formatWeekdayLabel("thursday")).toBe("Quinta-feira");
  });

  it("formats saturday as Sábado", () => {
    expect(formatWeekdayLabel("saturday")).toBe("Sábado");
  });

  it("formats sunday as Domingo", () => {
    expect(formatWeekdayLabel("sunday")).toBe("Domingo");
  });

  it("formats short label", () => {
    expect(formatWeekdayLabel("monday", true)).toBe("Seg");
  });
});

describe("getStatusLabel", () => {
  it("labels pending as Pendente", () => expect(getStatusLabel("pending")).toBe("Pendente"));
  it("labels in_progress as Em andamento", () =>
    expect(getStatusLabel("in_progress")).toBe("Em andamento"));
  it("labels completed as Concluído", () => expect(getStatusLabel("completed")).toBe("Concluído"));
  it("labels stuck as Travado", () => expect(getStatusLabel("stuck")).toBe("Travado"));
  it("labels skipped as Pulado", () => expect(getStatusLabel("skipped")).toBe("Pulado"));
});

describe("getCategoryLabel", () => {
  it("maps algo to Algoritmos & ED", () =>
    expect(getCategoryLabel("algo")).toBe("Algoritmos & ED"));
  it("maps system to Frontend System Design", () =>
    expect(getCategoryLabel("system")).toBe("Frontend System Design"));
  it("passes through unknown", () => expect(getCategoryLabel("xyz")).toBe("xyz"));
});
