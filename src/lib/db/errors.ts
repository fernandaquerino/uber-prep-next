export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MigrationError";
  }
}

export class BackupValidationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BackupValidationError";
  }
}

export class ImportConflictError extends Error {
  constructor(
    message: string,
    public readonly conflicts: Array<{ table: string; id: string }>,
  ) {
    super(message);
    this.name = "ImportConflictError";
  }
}

export class SsrAccessError extends DatabaseError {
  constructor() {
    super("IndexedDB is only available in browser context (not SSR).");
    this.name = "SsrAccessError";
  }
}
