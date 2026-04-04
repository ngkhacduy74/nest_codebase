export class ApplicationError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, 'NOT_FOUND', 404, {
      resource,
      id,
    });
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, context);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', 403, context);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// User-specific Application Errors
export class UserNotFoundException extends ApplicationError {
  constructor(userId: string) {
    super(`User with id "${userId}" not found`, 'USER_NOT_FOUND', 404, {
      userId,
    });
  }
}

export class UserAlreadyExistsError extends ApplicationError {
  constructor(email: string) {
    super(`User with email "${email}" already exists`, 'USER_ALREADY_EXISTS', 409, {
      email,
    });
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class AccountInactiveError extends ApplicationError {
  constructor(userId: string) {
    super(`Account "${userId}" is inactive`, 'ACCOUNT_INACTIVE', 403, {
      userId,
    });
  }
}

export class AccountDeletedError extends ApplicationError {
  constructor(userId: string) {
    super(`Account "${userId}" has been deleted`, 'ACCOUNT_DELETED', 403, {
      userId,
    });
  }
}

// Auth-specific Application Errors
export class TokenExpiredError extends ApplicationError {
  constructor(tokenType: 'access' | 'refresh' = 'access') {
    super(`${tokenType} token has expired`, 'TOKEN_EXPIRED', 401, { tokenType });
  }
}

export class TokenInvalidError extends ApplicationError {
  constructor(reason: string = 'Invalid token format') {
    super(`Token is invalid: ${reason}`, 'TOKEN_INVALID', 401, { reason });
  }
}

export class TokenRevokedError extends ApplicationError {
  constructor() {
    super('Token has been revoked', 'TOKEN_REVOKED', 401);
  }
}

export class RefreshTokenReuseError extends ApplicationError {
  constructor() {
    super('Refresh token reuse detected', 'REFRESH_TOKEN_REUSE', 401);
  }
}

export class InvalidTokenStructureError extends ApplicationError {
  constructor() {
    super('Invalid token structure', 'INVALID_TOKEN_STRUCTURE', 401);
  }
}
