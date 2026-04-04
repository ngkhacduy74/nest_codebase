"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_OPTIONAL_AUTH = exports.IS_PUBLIC_AUTH = exports.AUTH_INSTANCE_KEY = exports.HOOK_KEY = exports.AFTER_HOOK_KEY = exports.BEFORE_HOOK_KEY = exports.JwtToken = void 0;
var JwtToken;
(function (JwtToken) {
    JwtToken["AccessToken"] = "access-token";
    JwtToken["RefreshToken"] = "refresh-token";
    JwtToken["EmailVerificationToken"] = "email-verification-token";
})(JwtToken || (exports.JwtToken = JwtToken = {}));
exports.BEFORE_HOOK_KEY = 'BEFORE_HOOK';
exports.AFTER_HOOK_KEY = 'AFTER_HOOK';
exports.HOOK_KEY = 'HOOK';
exports.AUTH_INSTANCE_KEY = 'AUTH_INSTANCE';
exports.IS_PUBLIC_AUTH = 'IS_PUBLIC_AUTH';
exports.IS_OPTIONAL_AUTH = 'IS_OPTIONAL_AUTH';
//# sourceMappingURL=auth.constant.js.map