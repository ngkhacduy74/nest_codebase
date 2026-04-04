"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const base_value_object_1 = require("../../../../shared/domain/base.value-object");
const domain_error_1 = require("../../../../shared/domain/errors/domain.error");
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
class Email extends base_value_object_1.BaseValueObject {
    constructor(props) {
        super(props);
        this.validate(props);
    }
    static create(email) {
        return new Email({ value: email.toLowerCase().trim() });
    }
    validate(props) {
        if (!props.value || !EMAIL_REGEX.test(props.value)) {
            throw new domain_error_1.InvalidEmailError(props.value);
        }
        if (props.value.length > 255) {
            throw new domain_error_1.InvalidEmailError(props.value);
        }
    }
    get value() {
        return this.props.value;
    }
    toString() {
        return this.props.value;
    }
}
exports.Email = Email;
//# sourceMappingURL=email.value-object.js.map