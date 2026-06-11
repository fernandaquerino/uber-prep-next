import type { StudyPlan, StudyPlanBlock, StudyPlanDay } from "@/lib/domain/schedule";
import { WEEKS } from "./plan";

type RawBlock = {
  time: string;
  duration: number;
  type: string;
  category: string | null;
  label: string;
  resource?: string;
  leetcode?: string;
  difficulty?: string;
};

function isStudyBlock(block: RawBlock): block is RawBlock & { category: string } {
  return block.category !== null && block.type !== "pausa";
}

function buildBlockId(dayNumber: number, idx: number): string {
  return `block-${dayNumber}-${idx}`;
}

function buildDayId(dayNumber: number): string {
  return `day-${dayNumber}`;
}

function mapBlock(
  block: RawBlock & { category: string },
  dayNumber: number,
  idx: number,
): StudyPlanBlock {
  const tags: string[] = [block.type];
  if (block.difficulty) tags.push(`difficulty:${block.difficulty}`);

  const description = block.leetcode ?? block.resource ?? undefined;

  return {
    id: buildBlockId(dayNumber, idx),
    title: block.label,
    category: block.category,
    estimatedMinutes: block.duration,
    description,
    tags,
  };
}

export const STUDY_PLAN: StudyPlan = {
  id: "uber-prep-v2",
  title: "Uber Frontend Engineer Prep",
  version: 2,
  days: WEEKS.flatMap((week) =>
    week.days.map((day): StudyPlanDay => {
      const studyBlocks = (day.blocks as RawBlock[]).filter(isStudyBlock);
      let blockIdx = 0;

      return {
        id: buildDayId(day.day),
        sequence: day.day,
        title: day.title,
        blocks: studyBlocks.map((block) => mapBlock(block, day.day, blockIdx++)),
      };
    }),
  ),
};
