export declare class InfrastructureError extends Error {
    readonly code: string;
    readonly cause?: unknown;
    constructor(message: string, code: string, cause?: unknown);
}
export declare class DatabaseError extends InfrastructureError {
    constructor(operation: string, cause?: unknown);
}
export declare class CacheError extends InfrastructureError {
    constructor(operation: string, cause?: unknown);
}
