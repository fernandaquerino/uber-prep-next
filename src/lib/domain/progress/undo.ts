import { CannotUndoProgressActionError } from "./progress.errors";
import { createProgressEvent } from "./progress-events";
import type { PlanBlockProgress, ProgressEvent, ScheduleOverride } from "./progress.types";

export type UndoProgressActionInput = {
  eventId?: string;
  actionGroupId?: string;
  occurredAt: string;
};

export type UndoProgressActionResult = {
  progress: PlanBlockProgress[];
  events: ProgressEvent[];
  removedOverrideIds: string[];
};

export function undoProgressAction(
  progress: PlanBlockProgress[],
  events: ProgressEvent[],
  overrides: ScheduleOverride[],
  input: UndoProgressActionInput,
): UndoProgressActionResult {
  const eventsToUndo = input.actionGroupId
    ? events.filter((event) => event.actionGroupId === input.actionGroupId)
    : events.filter((event) => event.id === input.eventId);

  if (eventsToUndo.length === 0) {
    throw new CannotUndoProgressActionError("Progress event not found.");
  }

  assertNoLaterIncompatibleEvents(events, eventsToUndo);

  let nextProgress = progress;
  const undoneEvents: ProgressEvent[] = [];

  for (const event of eventsToUndo) {
    if (!event.previousProgress) {
      throw new CannotUndoProgressActionError(`Event ${event.id} cannot be undone.`);
    }

    nextProgress = nextProgress.map((record) =>
      record.blockId === event.blockId
        ? { ...event.previousProgress!, updatedAt: input.occurredAt }
        : record,
    );
    undoneEvents.push(
      createProgressEvent({
        blockId: event.blockId,
        type: "undone",
        occurredAt: input.occurredAt,
        previousProgress: event.nextProgress,
        nextProgress: event.previousProgress,
        metadata: { undoneEventId: event.id },
        actionGroupId: event.actionGroupId,
      }),
    );
  }

  const removedOverrideIds = overrides
    .filter((override) =>
      input.actionGroupId
        ? override.actionGroupId === input.actionGroupId
        : eventsToUndo.some(
            (event) =>
              event.blockId === override.blockId && event.occurredAt === override.createdAt,
          ),
    )
    .map((override) => override.id);

  return { progress: nextProgress, events: undoneEvents, removedOverrideIds };
}

function assertNoLaterIncompatibleEvents(
  allEvents: ProgressEvent[],
  eventsToUndo: ProgressEvent[],
): void {
  for (const event of eventsToUndo) {
    const later = allEvents.find(
      (candidate) =>
        candidate.blockId === event.blockId &&
        candidate.occurredAt > event.occurredAt &&
        candidate.type !== "undone" &&
        !eventsToUndo.some((sameGroup) => sameGroup.id === candidate.id),
    );

    if (later) {
      throw new CannotUndoProgressActionError(
        `Cannot undo ${event.id}; later event ${later.id} exists for the same block.`,
      );
    }
  }
}
