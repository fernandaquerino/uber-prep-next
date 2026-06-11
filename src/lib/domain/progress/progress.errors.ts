export class ProgressDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidProgressTransitionError extends ProgressDomainError {}

export class PlanBlockNotFoundError extends ProgressDomainError {}

export class ProgressRecordNotFoundError extends ProgressDomainError {}

export class InvalidProgressInputError extends ProgressDomainError {}

export class InvalidRescheduleDateError extends ProgressDomainError {}

export class CannotRescheduleCompletedBlockError extends ProgressDomainError {}

export class CannotRescheduleSkippedBlockError extends ProgressDomainError {}

export class NoPendingItemsToShiftError extends ProgressDomainError {}

export class CannotUndoProgressActionError extends ProgressDomainError {}

export class ScheduleShiftConflictError extends ProgressDomainError {}
