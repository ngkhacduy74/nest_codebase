"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const cache_manager_1 = require("@nestjs/cache-manager");
const nestjs_pino_1 = require("nestjs-pino");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const config_1 = require("@nestjs/config");
const config_registry_1 = require("../config/config.registry");
const logger_config_1 = require("../config/logger.config");
const cache_config_1 = require("../config/cache.config");
const queue_config_1 = require("../config/queue.config");
const security_config_1 = require("../config/security.config");
const cls_module_1 = require("./cls/cls.module");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const metrics_module_1 = require("./metrics/metrics.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, config_registry_1.buildConfigModule)(),
            cls_module_1.AppClsModule,
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cs) => {
                    const conf = cs.get(logger_config_1.LOGGER_CONFIG_KEY);
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
                            genReqId: (req) => req.headers['x-request-id'] ??
                                crypto.randomUUID(),
                        },
                    };
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cs) => {
                    const conf = cs.get(security_config_1.SECURITY_CONFIG_KEY);
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
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                maxListeners: 20,
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cs) => {
                    const conf = cs.get(queue_config_1.QUEUE_CONFIG_KEY);
                    return { connection: conf.redis };
                },
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (cs) => {
                    const conf = cs.get(cache_config_1.CACHE_CONFIG_KEY);
                    return {
                        store: cache_manager_redis_yet_1.redisStore,
                        socket: { host: conf.redis.host, port: conf.redis.port },
                        password: conf.redis.password,
                        ttl: conf.defaultTtlMs,
                        keyPrefix: conf.keyPrefix,
                    };
                },
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            metrics_module_1.MetricsModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map