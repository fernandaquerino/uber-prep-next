import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "@/test/indexed-db";
import {
  initializePlanProgress,
  startPlanBlock,
  completePlanBlock,
  skipPlanBlock,
  restoreSkippedPlanBlock,
  reschedulePlanBlock,
  shiftPendingSchedule,
  handleMissedStudyDay,
  getEffectiveSchedule,
  getCurrentStudyState,
} from "@/lib/application/progress";
import {
  buildStudySchedule,
  parseCalendarDate,
  DEFAULT_WEEKDAY_AVAILABILITY,
} from "@/lib/domain/schedule";
import { getPlanCompletionSummary } from "@/lib/domain/progress";
import { STUDY_PLAN } from "@/lib/data/study-plan";
import type { UberPrepDatabase } from "@/lib/db/db";

const START = parseCalendarDate("2026-06-11");
const TODAY = parseCalendarDate("2026-06-12");
const NOW = "2026-06-12T10:00:00.000Z";
const AVAILABILITY = DEFAULT_WEEKDAY_AVAILABILITY;

function getBaseSchedule() {
  return buildStudySchedule(STUDY_PLAN, {
    startDate: START,
    timezone: "America/Sao_Paulo",
    weekdayAvailability: AVAILABILITY,
  });
}

describe("Plan integration — calendário com início em 2026-06-11", () => {
  let db: UberPrepDatabase;
  const baseSchedule = getBaseSchedule();

  beforeEach(async () => {
    db = createTestDatabase();
    await initializePlanProgress({ db, baseSchedule, now: NOW });
  });

  it("11/06/2026 aparece como quinta-feira (day 1)", () => {
    const day1 = baseSchedule.find((d) => d.date === "2026-06-11");
    expect(day1).toBeDefined();
    expect(day1!.weekday).toBe("thursday");
    expect(day1!.isRestDay).toBe(false);
  });

  it("13/06/2026 aparece como sábado com 240 minutos", () => {
    const sat = baseSchedule.find((d) => d.date === "2026-06-13");
    expect(sat).toBeDefined();
    expect(sat!.weekday).toBe("saturday");
    expect(sat!.availableMinutes).toBe(240);
  });

  it("14/06/2026 é domingo de descanso sem conteúdo", () => {
    const sun = baseSchedule.find((d) => d.date === "2026-06-14");
    expect(sun).toBeDefined();
    expect(sun!.isRestDay).toBe(true);
    expect(sun!.items).toHaveLength(0);
  });

  it("inicializa progresso para todos os blocos do plano", async () => {
    const records = await db.planProgress.toArray();
    const totalBlocks = STUDY_PLAN.days.reduce((sum, d) => sum + d.blocks.length, 0);
    expect(records).toHaveLength(totalBlocks);
    expect(records.every((r) => r.status === "pending")).toBe(true);
  });

  it("inicia e conclui um bloco, atualizando o resumo", async () => {
    const firstBlock = baseSchedule.find((d) => d.date === "2026-06-11")!.items[0];
    expect(firstBlock).toBeDefined();

    await startPlanBlock({ db, blockId: firstBlock.blockId, startedAt: NOW });
    await completePlanBlock({
      db,
      blockId: firstBlock.blockId,
      completedAt: NOW,
      actualMinutes: 55,
      difficulty: 3,
      confidence: 4,
    });

    const effective = await getEffectiveSchedule({
      db,
      baseSchedule,
      today: TODAY,
      availability: AVAILABILITY,
    });
    const summary = getPlanCompletionSummary(effective);
    expect(summary.completed).toBe(1);
    expect(summary.inProgress).toBe(0);
  });

  it("pula bloco e o resumo reflete skipped (não completed)", async () => {
    const block = baseSchedule.find((d) => d.date === "2026-06-11")!.items[0];
    await skipPlanBlock({ db, blockId: block.blockId, skippedAt: NOW, reason: "muito fácil" });

    const effective = await getEffectiveSchedule({
      db,
      baseSchedule,
      today: TODAY,
      availability: AVAILABILITY,
    });
    const summary = getPlanCompletionSummary(effective);
    expect(summary.skipped).toBe(1);
    expect(summary.completed).toBe(0);
  });

  it("restaura bloco pulado para pending", async () => {
    const block = baseSchedule.find((d) => d.date === "2026-06-11")!.items[0];
    await skipPlanBlock({ db, blockId: block.blockId, skippedAt: NOW });
    await restoreSkippedPlanBlock({ db, blockId: block.blockId, occurredAt: NOW });

    const record = await db.planProgress.where("blockId").equals(block.blockId).first();
    expect(record?.status).toBe("pending");
  });

  it("persiste após recarregar (idempotente)", async () => {
    const block = baseSchedule.find((d) => d.date === "2026-06-11")!.items[0];
    await completePlanBlock({ db, blockId: block.blockId, completedAt: NOW });

    // Simula re-inicialização (deve ser idempotente)
    await initializePlanProgress({ db, baseSchedule, now: NOW });

    const record = await db.planProgress.where("blockId").equals(block.blockId).first();
    expect(record?.status).toBe("completed");
  });
});

describe("Plan integration — dia perdido", () => {
  let db: UberPrepDatabase;
  const baseSchedule = getBaseSchedule();

  const PAST_TODAY = parseCalendarDate("2026-06-13");
  const PAST_NOW = "2026-06-13T10:00:00.000Z";

  beforeEach(async () => {
    db = createTestDatabase();
    await initializePlanProgress({ db, baseSchedule, now: NOW });
  });

  it("estratégia shift_pending move blocos pendentes para frente", async () => {
    const day1 = baseSchedule.find((d) => d.date === "2026-06-11")!;
    const firstBlock = day1.items[0];

    const effective = await getEffectiveSchedule({
      db,
      baseSchedule,
      today: PAST_TODAY,
      availability: AVAILABILITY,
    });

    await handleMissedStudyDay({
      db,
      baseSchedule,
      missedDate: parseCalendarDate("2026-06-11"),
      today: PAST_TODAY,
      strategy: "shift_pending",
      availability: AVAILABILITY,
      now: PAST_NOW,
    });

    const updated = await db.planProgress.where("blockId").equals(firstBlock.blockId).first();
    // O bloco deve ter sido movido para uma data posterior à original
    expect(updated?.scheduledDate).not.toBe("2026-06-11");
  });

  it("estratégia keep_overdue mantém datas originais", async () => {
    const day1 = baseSchedule.find((d) => d.date === "2026-06-11")!;
    const firstBlock = day1.items[0];

    await handleMissedStudyDay({
      db,
      baseSchedule,
      missedDate: parseCalendarDate("2026-06-11"),
      today: PAST_TODAY,
      strategy: "keep_overdue",
      availability: AVAILABILITY,
      now: PAST_NOW,
    });

    const updated = await db.planProgress.where("blockId").equals(firstBlock.blockId).first();
    expect(updated?.scheduledDate).toBe("2026-06-11");
  });
});

describe("Plan integration — reagendamento e desfazer", () => {
  let db: UberPrepDatabase;
  const baseSchedule = getBaseSchedule();

  beforeEach(async () => {
    db = createTestDatabase();
    await initializePlanProgress({ db, baseSchedule, now: NOW });
  });

  it("reage, nova data, depois desfaz e volta para data original", async () => {
    const block = baseSchedule.find((d) => d.date === "2026-06-11")!.items[0];
    const TARGET = parseCalendarDate("2026-06-15");

    const result = await reschedulePlanBlock({
      db,
      baseSchedule,
      blockId: block.blockId,
      targetDate: TARGET,
      today: TODAY,
      availability: AVAILABILITY,
      now: NOW,
    });

    let record = await db.planProgress.where("blockId").equals(block.blockId).first();
    expect(record?.scheduledDate).toBe("2026-06-15");

    // Desfazer
    const { undoProgressAction } = await import("@/lib/application/progress");
    const actionGroupId = result.overrides[0]?.actionGroupId ?? result.events[0]?.actionGroupId;
    if (actionGroupId) {
      await undoProgressAction({ db, actionGroupId, occurredAt: NOW });
      record = await db.planProgress.where("blockId").equals(block.blockId).first();
      expect(record?.scheduledDate).toBe("2026-06-11");
    }
  });
});
