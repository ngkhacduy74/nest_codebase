export declare class ValidationError extends Error {
    readonly code: string;
    readonly field?: string;
    readonly value?: unknown;
    constructor(message: string, code: string, field?: string, value?: unknown);
}
export declare class RequiredFieldError extends ValidationError {
    constructor(field: string);
}
export declare class InvalidFormatError extends ValidationError {
    constructor(field: string, format: string, value?: unknown);
}
export declare class InvalidLengthError extends ValidationError {
    constructor(field: string, min?: number, max?: number, value?: unknown);
}
export declare class InvalidEmailFormatError extends ValidationError {
    constructor(email: string);
}
export declare class InvalidPasswordError extends ValidationError {
    constructor(reason: string);
}
export declare class InvalidUuidError extends ValidationError {
    constructor(value: string);
}
export declare class InvalidEnumValueError extends ValidationError {
    constructor(field: string, enumValues: string[], value?: unknown);
}
