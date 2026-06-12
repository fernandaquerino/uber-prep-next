export class TimerAlreadyRunningError extends Error {
  constructor() {
    super("Já existe uma sessão de foco em andamento.");
    this.name = "TimerAlreadyRunningError";
  }
}

export class ActiveTimerNotFoundError extends Error {
  constructor() {
    super("Nenhum timer ativo foi encontrado.");
    this.name = "ActiveTimerNotFoundError";
  }
}

export class InvalidTimerTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transição inválida do timer: ${from} → ${to}.`);
    this.name = "InvalidTimerTransitionError";
  }
}

export class InvalidTimerDurationError extends Error {
  constructor(message = "Duração inválida para o timer.") {
    super(message);
    this.name = "InvalidTimerDurationError";
  }
}

export class TimerSourceNotFoundError extends Error {
  constructor(sourceType: string, sourceId?: string) {
    super(`Origem do timer não encontrada: ${sourceType}${sourceId ? `/${sourceId}` : ""}.`);
    this.name = "TimerSourceNotFoundError";
  }
}
