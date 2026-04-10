import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  priority?: number; // Priority for cache eviction
}

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  ttl: number;
  tags?: string[];
  priority: number;
  hits: number;
}

export interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    if (value === undefined || value === null) return null;
    return value;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async invalidateByTag(_tag: string): Promise<void> {
    // TODO: Implement với Redis SCAN pattern: `tag:${tag}:*`
    // Cần inject Redis client trực tiếp để dùng SCAN
  }
}
