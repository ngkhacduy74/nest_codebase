import { registerAs } from '@nestjs/config';

export const CACHE_CONFIG_KEY = 'cache';

export interface RedisNodeConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db?: number;
  readonly tls?: boolean;
}

export interface CacheConfig {
  readonly redis: RedisNodeConfig;
  readonly defaultTtlMs: number;
  readonly keyPrefix: string;
  readonly isCluster: boolean;
  readonly ttl: {
    readonly user: number;
    readonly session: number;
    readonly general: number;
  };
}

export const cacheConfig = registerAs(
  CACHE_CONFIG_KEY,
  (): CacheConfig => ({
    redis: {
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      password: process.env['REDIS_PASSWORD'] ?? undefined,
      db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
      tls: process.env['REDIS_TLS'] === 'true',
    },
    defaultTtlMs: parseInt(process.env['CACHE_DEFAULT_TTL_MS'] ?? '60000', 10),
    keyPrefix: process.env['CACHE_KEY_PREFIX'] ?? 'saas',
    isCluster: process.env['REDIS_CLUSTER'] === 'true',
    ttl: {
      user: 5 * 60 * 1000, // 5 min
      session: 15 * 60 * 1000, // 15 min
      general: 60 * 1000, // 1 min
    },
  }),
);
