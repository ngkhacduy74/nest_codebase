import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, APP_CONFIG_KEY } from './app.config';
import { AuthConfig, AUTH_CONFIG_KEY } from './auth.config';
import { DatabaseConfig, DATABASE_CONFIG_KEY } from './database.config';
import { CacheConfig, CACHE_CONFIG_KEY } from './cache.config';
import { QueueConfig, QUEUE_CONFIG_KEY } from './queue.config';
import { LoggerConfig, LOGGER_CONFIG_KEY } from './logger.config';
import { SecurityConfig, SECURITY_CONFIG_KEY } from './security.config';
export interface GlobalConfig {
    [APP_CONFIG_KEY]: AppConfig;
    [AUTH_CONFIG_KEY]: AuthConfig;
    [DATABASE_CONFIG_KEY]: DatabaseConfig;
    [CACHE_CONFIG_KEY]: CacheConfig;
    [QUEUE_CONFIG_KEY]: QueueConfig;
    [LOGGER_CONFIG_KEY]: LoggerConfig;
    [SECURITY_CONFIG_KEY]: SecurityConfig;
}
export declare const ALL_CONFIGS: (((() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>) | ((() => AuthConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AuthConfig>) | ((() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>) | ((() => CacheConfig) & import("@nestjs/config").ConfigFactoryKeyHost<CacheConfig>) | ((() => QueueConfig) & import("@nestjs/config").ConfigFactoryKeyHost<QueueConfig>) | ((() => LoggerConfig) & import("@nestjs/config").ConfigFactoryKeyHost<LoggerConfig>) | ((() => SecurityConfig) & import("@nestjs/config").ConfigFactoryKeyHost<SecurityConfig>))[];
export type TypedConfigService = ConfigService<GlobalConfig, true>;
export declare const buildConfigModule: () => ReturnType<typeof ConfigModule.forRoot>;
