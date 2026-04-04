"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheError = exports.DatabaseError = exports.InfrastructureError = void 0;
class InfrastructureError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.name = 'InfrastructureError';
        this.code = code;
        this.cause = cause;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InfrastructureError = InfrastructureError;
class DatabaseError extends InfrastructureError {
    constructor(operation, cause) {
        super(`Database operation failed: ${operation}`, 'DATABASE_ERROR', cause);
    }
}
exports.DatabaseError = DatabaseError;
class CacheError extends InfrastructureError {
    constructor(operation, cause) {
        super(`Cache operation failed: ${operation}`, 'CACHE_ERROR', cause);
    }
}
exports.CacheError = CacheError;
//# sourceMappingURL=infrastructure.error.js.map