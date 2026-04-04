export declare enum CacheKey {
    AccessToken = "auth:token:%s:access",
    EmailVerificationToken = "auth:token:%s:email-verification",
    UserSocketClients = "socket:%s:clients",
    SignInMagicLinkMailLastSentAt = "auth:signin-magic-link-mail:%s:last-sent-at",
    EmailVerificationMailLastSentAt = "auth:email-verification-mail:%s:last-sent-at",
    ResetPasswordMailLastSentAt = "auth:reset-password-mail:%s:last-sent-at"
}
