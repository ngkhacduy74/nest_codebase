import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService, LogContext } from '@/common/services/logger.service';

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
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.logger.trace(`Cache miss: ${key}`, undefined, {
        key,
        operation: 'get',
        result: 'miss',
      });

      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;

      this.logger.trace(`Cache miss (expired): ${key}`, undefined, {
        key,
        operation: 'get',
        result: 'expired',
        age: Date.now() - entry.createdAt,
      });

      return null;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;

    this.logger.trace(`Cache hit: ${key}`, undefined, {
      key,
      operation: 'get',
      result: 'hit',
      hits: entry.hits,
      age: Date.now() - entry.createdAt,
    });

    return entry.data;
  }

  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || this.getDefaultTtl();
    const expiresAt = now + ttl * 1000;

    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      expiresAt,
      ttl,
      tags: options.tags,
      priority: options.priority || 0,
      hits: 0,
    };

    this.cache.set(key, entry);
    this.stats.sets++;

    this.logger.trace(`Cache set: ${key}`, undefined, {
      key,
      operation: 'set',
      ttl,
      tags: options.tags,
      priority: options.priority,
    });
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.stats.deletes++;

      this.logger.trace(`Cache delete: ${key}`, undefined, {
        key,
        operation: 'delete',
        result: 'success',
      });
    } else {
      this.logger.trace(`Cache delete (not found): ${key}`, undefined, {
        key,
        operation: 'delete',
        result: 'not_found',
      });
    }

    return deleted;
  }

  async invalidateByTag(tag: string): Promise<number> {
    let invalidatedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    this.logger.trace(`Cache invalidation by tag: ${tag}`, undefined, {
      tag,
      operation: 'invalidate_by_tag',
      invalidatedCount,
    });

    return invalidatedCount;
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    let invalidatedCount = 0;

    for (const [key] of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    this.logger.trace(`Cache invalidation by pattern: ${pattern}`, undefined, {
      pattern,
      operation: 'invalidate_by_pattern',
      invalidatedCount,
    });

    return invalidatedCount;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();

    this.logger.trace(`Cache cleared`, undefined, {
      operation: 'clear',
      clearedEntries: size,
    });
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      results.set(key, value);
    }

    return results;
  }

  async setMultiple<T>(
    entries: Map<string, T>,
    options: CacheOptions = {},
  ): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, options);
    }
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    return Date.now() <= entry.expiresAt;
  }

  async getTtl(key: string): Promise<number | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const remainingTtl = Math.max(0, entry.expiresAt - Date.now());
    return Math.ceil(remainingTtl / 1000);
  }

  async getKeysByTag(tag: string): Promise<string[]> {
    const keys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        keys.push(key);
      }
    }

    return keys;
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      keys: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      memoryUsage: this.calculateMemoryUsage(),
    };
  }

  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    this.logger.trace(`Cache cleanup completed`, undefined, {
      operation: 'cleanup',
      cleanedCount,
      remainingEntries: this.cache.size,
    });

    return cleanedCount;
  }

  private getDefaultTtl(): number {
    return this.configService.get('cache.defaultTtl', 300); // 5 minutes default
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      // Rough estimation of memory usage
      totalSize += JSON.stringify(entry).length * 2; // Rough estimation
    }

    return totalSize;
  }

  // Cache warming utilities
  async warmup<T>(
    entries: Map<string, { data: T; options?: CacheOptions }>,
  ): Promise<void> {
    this.logger.trace(`Cache warmup started`, LogContext.SYSTEM, {
      operation: 'warmup',
      entryCount: entries.size,
    });

    for (const [key, { data, options }] of entries) {
      await this.set(key, data, options);
    }

    this.logger.trace(`Cache warmup completed`, LogContext.SYSTEM, {
      operation: 'warmup',
      entryCount: entries.size,
    });
  }

  // Cache debugging utilities
  async debug(): Promise<{
    entries: Array<{ key: string; entry: CacheEntry<any> }>;
    stats: CacheStats;
  }> {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry: {
        ...entry,
        age: Date.now() - entry.createdAt,
        remainingTtl: Math.max(0, entry.expiresAt - Date.now()),
      },
    }));

    return {
      entries,
      stats: this.getStats(),
    };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    stats: CacheStats;
    issues: string[];
  }> {
    const stats = this.getStats();
    const issues: string[] = [];

    // Check hit rate
    if (stats.hitRate < 50 && stats.hits + stats.misses > 100) {
      issues.push('Low cache hit rate');
    }

    // Check memory usage
    const maxMemory = this.configService.get(
      'cache.maxMemory',
      100 * 1024 * 1024,
    ); // 100MB default
    if (stats.memoryUsage > maxMemory) {
      issues.push('High memory usage');
    }

    // Check number of keys
    const maxKeys = this.configService.get('cache.maxKeys', 10000);
    if (stats.keys > maxKeys) {
      issues.push('Too many cache keys');
    }

    return {
      healthy: issues.length === 0,
      stats,
      issues,
    };
  }
}

// Cache decorator for methods
export const Cache =
  (options: CacheOptions = {}) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService as CacheService;
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      await cacheService.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };

// Cache invalidation decorator
export const CacheInvalidate =
  (tags: string[]) =>
  (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService as CacheService;

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Invalidate cache by tags
      for (const tag of tags) {
        await cacheService.invalidateByTag(tag);
      }

      return result;
    };

    return descriptor;
  };
