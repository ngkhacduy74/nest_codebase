export declare class DomainError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    constructor(message: string, code: string, context?: Record<string, unknown>);
    static create(message: string, code: string, context?: Record<string, unknown>): DomainError;
}
export declare class InvalidEmailError extends DomainError {
    constructor(email: string);
}
export declare class InvalidNameError extends DomainError {
    constructor(field: string);
}
export declare class UserAlreadyDeactivatedError extends DomainError {
    constructor(userId: string);
}
