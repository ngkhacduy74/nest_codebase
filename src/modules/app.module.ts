import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigService } from '@nestjs/config';
import { buildConfigModule } from '@config/config.registry';
import { LOGGER_CONFIG_KEY, LoggerConfig } from '@config/logger.config';
import { CACHE_CONFIG_KEY, CacheConfig } from '@config/cache.config';
import { QUEUE_CONFIG_KEY, QueueConfig } from '@config/queue.config';
import { SECURITY_CONFIG_KEY, SecurityConfig } from '@config/security.config';
import { AppClsModule } from '@modules/cls/cls.module';
import { PrismaModule } from '@modules/prisma/prisma.module';

import { HealthModule } from '@modules/health/health.module';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    // ── Config (must be first) ────────────────────────────────────────────────
    buildConfigModule(),

    // ── Request Context ───────────────────────────────────────────────────────
    AppClsModule,

    // ── Structured Logging ────────────────────────────────────────────────────
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const conf = cs.get<LoggerConfig>(LOGGER_CONFIG_KEY)!;
        return {
          pinoHttp: {
            level: conf.level,
            redact: conf.redactPaths,
            transport: conf.prettyPrint
              ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
            genReqId: (req) =>
              (req.headers['x-request-id'] as string | undefined) ??
              crypto.randomUUID(),
          },
        };
      },
    }),

    // ── Rate Limiting ─────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const conf = cs.get<SecurityConfig>(SECURITY_CONFIG_KEY)!;
        return {
          throttlers: [
            {
              ttl: conf.rateLimit.windowMs,
              limit: conf.rateLimit.limit,
            },
          ],
        };
      },
    }),

    // ── Internal Events ───────────────────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // ── Queue (BullMQ) ────────────────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const conf = cs.get<QueueConfig>(QUEUE_CONFIG_KEY)!;
        return { connection: conf.redis };
      },
    }),

    // ── Cache (Redis) ─────────────────────────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cs: ConfigService) => {
        const conf = cs.get<CacheConfig>(CACHE_CONFIG_KEY)!;
        return {
          store: redisStore,
          socket: { host: conf.redis.host, port: conf.redis.port },
          password: conf.redis.password,
          ttl: conf.defaultTtlMs,
          keyPrefix: conf.keyPrefix,
        };
      },
    }),

    // ── Core Infrastructure ───────────────────────────────────────────────────
    PrismaModule,

    // ── Observability ─────────────────────────────────────────────────────────
    HealthModule,
    MetricsModule,

    // ── Feature Modules ───────────────────────────────────────────────────────
    AuthModule,
    UserModule,
  ],
  providers: [
    // Apply ThrottlerGuard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
