"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKey = void 0;
var CacheKey;
(function (CacheKey) {
    CacheKey["AccessToken"] = "auth:token:%s:access";
    CacheKey["EmailVerificationToken"] = "auth:token:%s:email-verification";
    CacheKey["UserSocketClients"] = "socket:%s:clients";
    CacheKey["SignInMagicLinkMailLastSentAt"] = "auth:signin-magic-link-mail:%s:last-sent-at";
    CacheKey["EmailVerificationMailLastSentAt"] = "auth:email-verification-mail:%s:last-sent-at";
    CacheKey["ResetPasswordMailLastSentAt"] = "auth:reset-password-mail:%s:last-sent-at";
})(CacheKey || (exports.CacheKey = CacheKey = {}));
//# sourceMappingURL=cache.constant.js.map