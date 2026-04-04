export declare const AUTH_CONFIG_KEY = "auth";
export interface JwtTokenConfig {
    readonly secret: string;
    readonly expiresIn: string;
}
export interface ArgonConfig {
    readonly type: number;
    readonly memoryCost: number;
    readonly timeCost: number;
    readonly parallelism: number;
}
export interface AuthConfig {
    readonly accessToken: JwtTokenConfig;
    readonly refreshToken: JwtTokenConfig;
    readonly argon: ArgonConfig;
    readonly maxActiveSessions: number;
    readonly tokenBlacklistTtlSeconds: number;
}
export declare const authConfig: (() => AuthConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AuthConfig>;
