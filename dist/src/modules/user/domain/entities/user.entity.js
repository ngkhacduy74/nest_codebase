"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const base_entity_1 = require("../../../../shared/domain/base.entity");
const domain_error_1 = require("../../../../shared/domain/errors/domain.error");
const email_value_object_1 = require("../value-objects/email.value-object");
class UserEntity extends base_entity_1.BaseEntity {
    _email;
    _firstName;
    _lastName;
    _role;
    _isActive;
    isEmailVerified;
    deletedAt;
    _passwordHash;
    constructor(props) {
        super(props.id, props.createdAt, props.updatedAt);
        this._email = email_value_object_1.Email.create(props.email);
        this._firstName = props.firstName;
        this._lastName = props.lastName;
        this._role = props.role;
        this._isActive = props.isActive;
        this.isEmailVerified = props.isEmailVerified;
        this.deletedAt = props.deletedAt;
        this._passwordHash = props.passwordHash;
    }
    static reconstitute(props) {
        return new UserEntity(props);
    }
    get email() {
        return this._email.value;
    }
    get firstName() {
        return this._firstName;
    }
    get lastName() {
        return this._lastName;
    }
    get fullName() {
        return `${this._firstName} ${this._lastName}`;
    }
    get role() {
        return this._role;
    }
    get isActive() {
        return this._isActive;
    }
    get isDeleted() {
        return !!this.deletedAt;
    }
    deactivate() {
        if (!this._isActive) {
            throw new domain_error_1.UserAlreadyDeactivatedError(this._id);
        }
        this._isActive = false;
        this.touch();
    }
    activate() {
        this._isActive = true;
        this.touch();
    }
    updateProfile(firstName, lastName) {
        if (!firstName.trim())
            throw new domain_error_1.InvalidNameError('firstName');
        if (!lastName.trim())
            throw new domain_error_1.InvalidNameError('lastName');
        this._firstName = firstName.trim();
        this._lastName = lastName.trim();
        this.touch();
    }
    async validatePassword(password) {
        if (!this._passwordHash)
            return false;
        const argon2 = await import('argon2');
        return argon2.verify(this._passwordHash, password);
    }
    setPassword(password) {
        this._passwordHash = password;
        this.touch();
    }
    toSnapshot() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            isActive: this.isActive,
            isEmailVerified: this.isEmailVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt,
            passwordHash: this._passwordHash,
        };
    }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=user.entity.js.map