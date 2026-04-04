"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValueObject = void 0;
class BaseValueObject {
    props;
    constructor(props) {
        this.props = Object.freeze({ ...props });
    }
    equals(other) {
        if (!(other instanceof BaseValueObject))
            return false;
        return JSON.stringify(this.props) === JSON.stringify(other.props);
    }
}
exports.BaseValueObject = BaseValueObject;
//# sourceMappingURL=base.value-object.js.map