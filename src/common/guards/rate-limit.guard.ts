import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '@/common/services/logger.service';
import { AppError } from '@/common/errors/app.error';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  totalHits: number;
  remainingHits: number;
  resetTime: Date;
  windowMs: number;
}

export interface RateLimitStore {
  increment: (key: string, options: RateLimitOptions) => Promise<RateLimitInfo>;
  reset: (key: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store: RateLimitStore;
  private readonly defaultOptions: RateLimitOptions;

  constructor(
    private readonly reflector: Reflector,
    _configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.store = new MemoryRateLimitStore(logger);
    this.defaultOptions = {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      // Get rate limit options from metadata
      const options = this.getRateLimitOptions(context);

      // Generate key for rate limiting
      const key = this.generateKey(request, options);

      // Check rate limit
      const rateLimitInfo = await this.store.increment(key, options);

      // Add rate limit headers
      this.addRateLimitHeaders(response, rateLimitInfo);

      // Check if rate limit exceeded
      if (rateLimitInfo.totalHits > options.max) {
        this.logger.security('Rate limit exceeded', {
          key,
          totalHits: rateLimitInfo.totalHits,
          max: options.max,
          windowMs: options.windowMs,
          path: request.path,
          method: request.method,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });

        throw AppError.rateLimitExceeded(options.max, options.windowMs, {
          key,
          totalHits: rateLimitInfo.totalHits,
          remainingHits: rateLimitInfo.remainingHits,
          resetTime: rateLimitInfo.resetTime,
        });
      }

      // Log rate limit info
      this.logger.http(`Rate limit check passed`, {
        key,
        totalHits: rateLimitInfo.totalHits,
        remainingHits: rateLimitInfo.remainingHits,
        path: request.path,
        method: request.method,
      });

      return true;
    } catch (error) {
      this.logger.errorWithException('Rate limit guard error', error as Error, undefined, {
        path: request.path,
        method: request.method,
        ip: request.ip,
      });

      throw error;
    }
  }

  private getRateLimitOptions(_context: ExecutionContext): RateLimitOptions {
    const customOptions = this.reflector.get<Partial<RateLimitOptions>>(
      'rateLimit',
      _context.getHandler(),
    );

    return {
      ...this.defaultOptions,
      ...(customOptions ?? {}),
    };
  }

  private generateKey(
    request: {
      user?: { id: string };
      ip?: string;
      connection?: { remoteAddress?: string };
      socket?: { remoteAddress?: string };
      path: string;
    },
    _options: RateLimitOptions,
  ): string {
    // Get user ID if authenticated
    const userId = request.user?.id;

    // Get IP address
    const ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress;

    // Get endpoint
    const endpoint = request.path;

    // Generate key based on strategy
    if (userId) {
      // Rate limit per user
      return `rate_limit:user:${userId}:${endpoint}`;
    } else if (ip) {
      // Rate limit per IP
      return `rate_limit:ip:${ip}:${endpoint}`;
    } else {
      // Fallback to global rate limit
      return `rate_limit:global:${endpoint}`;
    }
  }

  private addRateLimitHeaders(response: any, rateLimitInfo: RateLimitInfo): void {
    response.setHeader('X-RateLimit-Limit', rateLimitInfo.windowMs);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitInfo.remainingHits));
    response.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime.toISOString());
  }
}

// Memory-based rate limit store
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitInfo>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private readonly logger: AppLoggerService) {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  async increment(key: string, options: RateLimitOptions): Promise<RateLimitInfo> {
    const now = Date.now();
    const resetTime = new Date(now + options.windowMs);

    // Get existing entry
    let entry = this.store.get(key);

    if (!entry) {
      // Create new entry
      entry = {
        totalHits: 1,
        remainingHits: options.max - 1,
        resetTime,
        windowMs: options.windowMs,
      };
    } else {
      // Check if window has expired
      if (now > entry.resetTime.getTime()) {
        // Reset entry
        entry = {
          totalHits: 1,
          remainingHits: options.max - 1,
          resetTime,
          windowMs: options.windowMs,
        };
      } else {
        // Increment existing entry
        entry.totalHits++;
        entry.remainingHits = Math.max(0, options.max - entry.totalHits);
      }
    }

    // Update store
    this.store.set(key, entry);

    return entry;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);

    this.logger.http(`Rate limit reset for key: ${key}`, {
      key,
    });
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime.getTime()) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.http(`Rate limit cleanup completed`, {
        cleanedCount,
        remainingEntries: this.store.size,
      });
    }
  }

  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.store.clear();

    this.logger.http('Rate limit store destroyed');
  }
}

// Decorator for setting rate limit options
export const RateLimit =
  (options: Partial<RateLimitOptions>) =>
  (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', options, descriptor.value);
    return descriptor;
  };

// Redis-based rate limit store (for production)
export class RedisRateLimitStore implements RateLimitStore {
  constructor(
    private readonly redis: any,
    private readonly logger: AppLoggerService,
  ) {}

  async increment(key: string, options: RateLimitOptions): Promise<RateLimitInfo> {
    const now = Date.now();
    const resetTime = now + options.windowMs;

    // Use Redis INCR with expiration
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(options.windowMs / 1000));

    const results = await pipeline.exec();
    const totalHits = results[0][1] as number;

    return {
      totalHits,
      remainingHits: Math.max(0, options.max - totalHits),
      resetTime: new Date(resetTime),
      windowMs: options.windowMs,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);

    this.logger.http(`Rate limit reset for key: ${key}`, {
      key,
    });
  }

  async cleanup(): Promise<void> {
    // Redis handles expiration automatically
    // No manual cleanup needed
  }
}
