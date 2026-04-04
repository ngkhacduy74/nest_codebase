export declare const SECURITY_CONFIG_KEY = "security";
export interface CorsConfig {
    readonly allowedOrigins: string[];
    readonly allowedMethods: string[];
    readonly allowedHeaders: string[];
    readonly credentials: boolean;
    readonly maxAge: number;
}
export interface RateLimitConfig {
    readonly windowMs: number;
    readonly limit: number;
    readonly skipSuccessfulRequests: boolean;
}
export interface HelmetConfig {
    readonly contentSecurityPolicy: boolean;
    readonly hsts: boolean;
    readonly noSniff: boolean;
}
export interface SecurityConfig {
    readonly cors: CorsConfig;
    readonly rateLimit: RateLimitConfig;
    readonly helmet: HelmetConfig;
}
export declare const securityConfig: (() => SecurityConfig) & import("@nestjs/config").ConfigFactoryKeyHost<SecurityConfig>;
