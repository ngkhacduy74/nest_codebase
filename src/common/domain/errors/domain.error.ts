export class DomainError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  static create(message: string, code: string, context?: Record<string, unknown>): DomainError {
    return new DomainError(message, code, context);
  }
}
export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email address: "${email}"`, 'INVALID_EMAIL', { email });
  }
}

export class InvalidNameError extends DomainError {
  constructor(field: string) {
    super(`"${field}" cannot be empty`, 'INVALID_NAME', { field });
  }
}

export class UserAlreadyDeactivatedError extends DomainError {
  constructor(userId: string) {
    super(`User "${userId}" is already deactivated`, 'USER_ALREADY_DEACTIVATED', { userId });
  }
}
