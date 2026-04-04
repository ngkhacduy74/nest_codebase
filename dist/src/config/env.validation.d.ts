export declare enum NodeEnv {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare enum LogLevel {
    Fatal = "fatal",
    Error = "error",
    Warn = "warn",
    Info = "info",
    Debug = "debug",
    Trace = "trace"
}
export declare enum LogProvider {
    Console = "console",
    Pino = "pino"
}
declare class EnvironmentVariables {
    NODE_ENV: NodeEnv;
    PORT: number;
    APP_NAME: string;
    API_PREFIX: string;
    API_VERSION: string;
    SHUTDOWN_TIMEOUT_MS: number;
    DATABASE_URL: string;
    DB_POOL_MIN: number;
    DB_POOL_MAX: number;
    DB_ACQUIRE_TIMEOUT_MS: number;
    DB_IDLE_TIMEOUT_MS: number;
    DB_RETRY_MAX: number;
    DB_RETRY_DELAY_MS: number;
    DB_RETRY_BACKOFF: number;
    DB_SLOW_QUERY_MS: number;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    REDIS_DB: number;
    REDIS_TLS: boolean;
    REDIS_CLUSTER: boolean;
    CACHE_DEFAULT_TTL_MS: number;
    CACHE_KEY_PREFIX: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    MAX_ACTIVE_SESSIONS: number;
    ALLOWED_ORIGINS: string;
    THROTTLE_TTL_MS: number;
    THROTTLE_LIMIT: number;
    LOG_LEVEL: LogLevel;
    LOG_PROVIDER: LogProvider;
    CORRELATION_ID_HEADER: string;
    QUEUE_RETRY_ATTEMPTS: number;
    QUEUE_RETRY_DELAY_MS: number;
    QUEUE_CONCURRENCY: number;
    QUEUE_REMOVE_COMPLETE: number;
    QUEUE_REMOVE_FAIL: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
