import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_KEY = 'database';

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

export const databaseConfig = registerAs(
  DATABASE_CONFIG_KEY,
  (): DatabaseConfig => {
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';
    
    return {
      url: process.env['DATABASE_URL'] || (() => {
        throw new Error('DATABASE_URL is required');
      })(),
      pool: {
        min: parseInt(process.env['DB_POOL_MIN'] ?? '2', 10),
        max: parseInt(process.env['DB_POOL_MAX'] ?? '10', 10),
        acquireTimeoutMs: parseInt(
          process.env['DB_ACQUIRE_TIMEOUT_MS'] ?? '30000',
          10,
        ),
        idleTimeoutMs: parseInt(
          process.env['DB_IDLE_TIMEOUT_MS'] ?? '600000',
          10,
        ),
      },
      retry: {
        maxAttempts: parseInt(process.env['DB_RETRY_MAX'] ?? '3', 10),
        delayMs: parseInt(process.env['DB_RETRY_DELAY_MS'] ?? '1000', 10),
        backoffMultiplier: parseFloat(process.env['DB_RETRY_BACKOFF'] ?? '2'),
      },
      logQueries: nodeEnv === 'development',
      slowQueryThresholdMs: parseInt(
        process.env['DB_SLOW_QUERY_MS'] ?? '1000',
        10,
      ),
    };
  },
);
