"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEnumValueError = exports.InvalidUuidError = exports.InvalidPasswordError = exports.InvalidEmailFormatError = exports.InvalidLengthError = exports.InvalidFormatError = exports.RequiredFieldError = exports.ValidationError = void 0;
class ValidationError extends Error {
    code;
    field;
    value;
    constructor(message, code, field, value) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.field = field;
        this.value = value;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ValidationError = ValidationError;
class RequiredFieldError extends ValidationError {
    constructor(field) {
        super(`Field "${field}" is required`, 'REQUIRED_FIELD', field);
    }
}
exports.RequiredFieldError = RequiredFieldError;
class InvalidFormatError extends ValidationError {
    constructor(field, format, value) {
        super(`Field "${field}" must be a valid ${format}`, 'INVALID_FORMAT', field, value);
    }
}
exports.InvalidFormatError = InvalidFormatError;
class InvalidLengthError extends ValidationError {
    constructor(field, min, max, value) {
        let message = `Field "${field}"`;
        if (min && max) {
            message += ` must be between ${min} and ${max} characters`;
        }
        else if (min) {
            message += ` must be at least ${min} characters`;
        }
        else if (max) {
            message += ` must be at most ${max} characters`;
        }
        super(message, 'INVALID_LENGTH', field, value);
    }
}
exports.InvalidLengthError = InvalidLengthError;
class InvalidEmailFormatError extends ValidationError {
    constructor(email) {
        super(`Invalid email format: "${email}"`, 'INVALID_EMAIL_FORMAT', 'email', email);
    }
}
exports.InvalidEmailFormatError = InvalidEmailFormatError;
class InvalidPasswordError extends ValidationError {
    constructor(reason) {
        super(`Password validation failed: ${reason}`, 'INVALID_PASSWORD', 'password');
    }
}
exports.InvalidPasswordError = InvalidPasswordError;
class InvalidUuidError extends ValidationError {
    constructor(value) {
        super(`Invalid UUID format: "${value}"`, 'INVALID_UUID', 'id', value);
    }
}
exports.InvalidUuidError = InvalidUuidError;
class InvalidEnumValueError extends ValidationError {
    constructor(field, enumValues, value) {
        super(`Field "${field}" must be one of: ${enumValues.join(', ')}`, 'INVALID_ENUM_VALUE', field, value);
    }
}
exports.InvalidEnumValueError = InvalidEnumValueError;
//# sourceMappingURL=validation.error.js.map