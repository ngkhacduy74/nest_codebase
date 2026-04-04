"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    _id;
    _createdAt;
    _updatedAt;
    constructor(id, createdAt, updatedAt) {
        this._id = id;
        this._createdAt = createdAt ?? new Date();
        this._updatedAt = updatedAt ?? new Date();
    }
    get id() {
        return this._id;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    equals(other) {
        if (!(other instanceof BaseEntity))
            return false;
        return this._id === other._id;
    }
    touch() {
        this._updatedAt = new Date();
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.entity.js.map