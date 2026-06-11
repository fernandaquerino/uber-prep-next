export class ScheduleDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCalendarDateError extends ScheduleDomainError {}

export class InvalidAvailabilityError extends ScheduleDomainError {}

export class NoStudyDaysEnabledError extends ScheduleDomainError {}

export class InvalidStudyPlanError extends ScheduleDomainError {}
