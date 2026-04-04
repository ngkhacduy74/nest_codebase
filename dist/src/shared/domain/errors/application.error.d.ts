export declare class ApplicationError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly context?: Record<string, unknown>;
    constructor(message: string, code: string, statusCode: number, context?: Record<string, unknown>);
}
export declare class NotFoundError extends ApplicationError {
    constructor(resource: string, id: string);
}
export declare class ConflictError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class ForbiddenError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class UnauthorizedError extends ApplicationError {
    constructor(message: string);
}
export declare class UserNotFoundException extends ApplicationError {
    constructor(userId: string);
}
export declare class UserAlreadyExistsError extends ApplicationError {
    constructor(email: string);
}
export declare class InvalidCredentialsError extends ApplicationError {
    constructor();
}
export declare class AccountInactiveError extends ApplicationError {
    constructor(userId: string);
}
export declare class AccountDeletedError extends ApplicationError {
    constructor(userId: string);
}
export declare class TokenExpiredError extends ApplicationError {
    constructor(tokenType?: 'access' | 'refresh');
}
export declare class TokenInvalidError extends ApplicationError {
    constructor(reason?: string);
}
export declare class TokenRevokedError extends ApplicationError {
    constructor();
}
export declare class RefreshTokenReuseError extends ApplicationError {
    constructor();
}
export declare class InvalidTokenStructureError extends ApplicationError {
    constructor();
}
