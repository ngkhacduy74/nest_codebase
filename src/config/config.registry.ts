import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, APP_CONFIG_KEY, appConfig } from './app.config';
import { AuthConfig, AUTH_CONFIG_KEY, authConfig } from './auth.config';
import {
  DatabaseConfig,
  DATABASE_CONFIG_KEY,
  databaseConfig,
} from './database.config';
import { CacheConfig, CACHE_CONFIG_KEY, cacheConfig } from './cache.config';
import { QueueConfig, QUEUE_CONFIG_KEY, queueConfig } from './queue.config';
import { LoggerConfig, LOGGER_CONFIG_KEY, loggerConfig } from './logger.config';
import {
  SecurityConfig,
  SECURITY_CONFIG_KEY,
  securityConfig,
} from './security.config';
import { validate } from './env.validation';

// ── GlobalConfig type ─────────────────────────────────────────────────────────
export interface GlobalConfig {
  [APP_CONFIG_KEY]: AppConfig;
  [AUTH_CONFIG_KEY]: AuthConfig;
  [DATABASE_CONFIG_KEY]: DatabaseConfig;
  [CACHE_CONFIG_KEY]: CacheConfig;
  [QUEUE_CONFIG_KEY]: QueueConfig;
  [LOGGER_CONFIG_KEY]: LoggerConfig;
  [SECURITY_CONFIG_KEY]: SecurityConfig;
}

// ── All config factories — registered in ConfigModule ────────────────────────
export const ALL_CONFIGS = [
  appConfig,
  authConfig,
  databaseConfig,
  cacheConfig,
  queueConfig,
  loggerConfig,
  securityConfig,
];

// ── Typed config accessor — use everywhere instead of raw ConfigService ───────
export type TypedConfigService = ConfigService<GlobalConfig, true>;

// ── Helper: build ConfigModule with all configs in one line ──────────────────
export const buildConfigModule = (): ReturnType<typeof ConfigModule.forRoot> =>
  ConfigModule.forRoot({
    isGlobal: true,
    load: ALL_CONFIGS,
    envFilePath: ['.env.local', '.env'],
    expandVariables: true,
    validate: validate,
  });
