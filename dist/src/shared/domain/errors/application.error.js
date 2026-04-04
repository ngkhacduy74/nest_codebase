"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTokenStructureError = exports.RefreshTokenReuseError = exports.TokenRevokedError = exports.TokenInvalidError = exports.TokenExpiredError = exports.AccountDeletedError = exports.AccountInactiveError = exports.InvalidCredentialsError = exports.UserAlreadyExistsError = exports.UserNotFoundException = exports.UnauthorizedError = exports.ForbiddenError = exports.ConflictError = exports.NotFoundError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    code;
    statusCode;
    context;
    constructor(message, code, statusCode, context) {
        super(message);
        this.name = 'ApplicationError';
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationError = ApplicationError;
class NotFoundError extends ApplicationError {
    constructor(resource, id) {
        super(`${resource} with id "${id}" not found`, 'NOT_FOUND', 404, {
            resource,
            id,
        });
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApplicationError {
    constructor(message, context) {
        super(message, 'CONFLICT', 409, context);
    }
}
exports.ConflictError = ConflictError;
class ForbiddenError extends ApplicationError {
    constructor(message, context) {
        super(message, 'FORBIDDEN', 403, context);
    }
}
exports.ForbiddenError = ForbiddenError;
class UnauthorizedError extends ApplicationError {
    constructor(message) {
        super(message, 'UNAUTHORIZED', 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class UserNotFoundException extends ApplicationError {
    constructor(userId) {
        super(`User with id "${userId}" not found`, 'USER_NOT_FOUND', 404, {
            userId,
        });
    }
}
exports.UserNotFoundException = UserNotFoundException;
class UserAlreadyExistsError extends ApplicationError {
    constructor(email) {
        super(`User with email "${email}" already exists`, 'USER_ALREADY_EXISTS', 409, {
            email,
        });
    }
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class AccountInactiveError extends ApplicationError {
    constructor(userId) {
        super(`Account "${userId}" is inactive`, 'ACCOUNT_INACTIVE', 403, {
            userId,
        });
    }
}
exports.AccountInactiveError = AccountInactiveError;
class AccountDeletedError extends ApplicationError {
    constructor(userId) {
        super(`Account "${userId}" has been deleted`, 'ACCOUNT_DELETED', 403, {
            userId,
        });
    }
}
exports.AccountDeletedError = AccountDeletedError;
class TokenExpiredError extends ApplicationError {
    constructor(tokenType = 'access') {
        super(`${tokenType} token has expired`, 'TOKEN_EXPIRED', 401, { tokenType });
    }
}
exports.TokenExpiredError = TokenExpiredError;
class TokenInvalidError extends ApplicationError {
    constructor(reason = 'Invalid token format') {
        super(`Token is invalid: ${reason}`, 'TOKEN_INVALID', 401, { reason });
    }
}
exports.TokenInvalidError = TokenInvalidError;
class TokenRevokedError extends ApplicationError {
    constructor() {
        super('Token has been revoked', 'TOKEN_REVOKED', 401);
    }
}
exports.TokenRevokedError = TokenRevokedError;
class RefreshTokenReuseError extends ApplicationError {
    constructor() {
        super('Refresh token reuse detected', 'REFRESH_TOKEN_REUSE', 401);
    }
}
exports.RefreshTokenReuseError = RefreshTokenReuseError;
class InvalidTokenStructureError extends ApplicationError {
    constructor() {
        super('Invalid token structure', 'INVALID_TOKEN_STRUCTURE', 401);
    }
}
exports.InvalidTokenStructureError = InvalidTokenStructureError;
//# sourceMappingURL=application.error.js.map