import { CACHE_CONFIG_KEY, CacheConfig } from '@/config';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const TOKEN_STORE = Symbol('TOKEN_STORE');

export interface ITokenStore {
  storeRefreshToken(
    userId: string,
    tokenId: string,
    ttlSeconds: number,
  ): Promise<void>;
  validateRefreshToken(userId: string, tokenId: string): Promise<boolean>;
  revokeRefreshToken(userId: string, tokenId: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
  blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void>;
  isAccessTokenBlacklisted(jti: string): Promise<boolean>;
}

@Injectable()
export class RedisTokenStore implements ITokenStore, OnModuleDestroy {
  private readonly logger = new Logger(RedisTokenStore.name);
  private readonly redis: Redis;
  private readonly keyPrefix: string;

  constructor(configService: ConfigService) {
    const cacheConf = configService.get<CacheConfig>(CACHE_CONFIG_KEY)!;
    this.keyPrefix = cacheConf.keyPrefix;
    this.redis = new Redis({
      host: cacheConf.redis.host,
      port: cacheConf.redis.port,
      password: cacheConf.redis.password,
      db: cacheConf.redis.db ?? 1, // separate DB from cache
    });

    this.redis.on('error', (err: Error) => {
      this.logger.error('Redis token store error:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  // Stores a valid refresh token ID for a user
  async storeRefreshToken(
    userId: string,
    tokenId: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = this.refreshKey(userId, tokenId);
    await this.redis.setex(key, ttlSeconds, '1');
  }

  // Returns true only if this exact tokenId exists for this userId
  async validateRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<boolean> {
    const key = this.refreshKey(userId, tokenId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  // Revoke a specific token (called after rotation — old token must not be reusable)
  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const key = this.refreshKey(userId, tokenId);
    const deleted = await this.redis.del(key);
    if (deleted === 0) {
      // Token was already gone — possible reuse attack!
      this.logger.warn(
        `[TOKEN REUSE DETECTED] userId=${userId} tokenId=${tokenId}`,
      );
      // Revoke ALL sessions for this user as a security measure
      await this.revokeAllUserTokens(userId);
      throw new Error(
        'Refresh token reuse detected — all sessions invalidated',
      );
    }
  }

  // Revoke all refresh tokens for a user (logout all devices)
  async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `${this.keyPrefix}:rt:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Blacklist an access token by its jti (until it expires)
  async blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void> {
    const key = this.blacklistKey(jti);
    await this.redis.setex(key, ttlSeconds, '1');
  }

  async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
    const key = this.blacklistKey(jti);
    return (await this.redis.exists(key)) === 1;
  }

  private refreshKey(userId: string, tokenId: string): string {
    return `${this.keyPrefix}:rt:${userId}:${tokenId}`;
  }

  private blacklistKey(jti: string): string {
    return `${this.keyPrefix}:blacklist:${jti}`;
  }
}
