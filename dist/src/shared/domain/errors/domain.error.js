"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlreadyDeactivatedError = exports.InvalidNameError = exports.InvalidEmailError = exports.DomainError = void 0;
class DomainError extends Error {
    code;
    context;
    constructor(message, code, context) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
    static create(message, code, context) {
        return new DomainError(message, code, context);
    }
}
exports.DomainError = DomainError;
class InvalidEmailError extends DomainError {
    constructor(email) {
        super(`Invalid email address: "${email}"`, 'INVALID_EMAIL', { email });
    }
}
exports.InvalidEmailError = InvalidEmailError;
class InvalidNameError extends DomainError {
    constructor(field) {
        super(`"${field}" cannot be empty`, 'INVALID_NAME', { field });
    }
}
exports.InvalidNameError = InvalidNameError;
class UserAlreadyDeactivatedError extends DomainError {
    constructor(userId) {
        super(`User "${userId}" is already deactivated`, 'USER_ALREADY_DEACTIVATED', { userId });
    }
}
exports.UserAlreadyDeactivatedError = UserAlreadyDeactivatedError;
//# sourceMappingURL=domain.error.js.map