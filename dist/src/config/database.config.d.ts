export declare const DATABASE_CONFIG_KEY = "database";
export interface DatabasePoolConfig {
    readonly min: number;
    readonly max: number;
    readonly acquireTimeoutMs: number;
    readonly idleTimeoutMs: number;
}
export interface DatabaseRetryConfig {
    readonly maxAttempts: number;
    readonly delayMs: number;
    readonly backoffMultiplier: number;
}
export interface DatabaseConfig {
    readonly url: string;
    readonly pool: DatabasePoolConfig;
    readonly retry: DatabaseRetryConfig;
    readonly logQueries: boolean;
    readonly slowQueryThresholdMs: number;
}
export declare const databaseConfig: (() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>;
