"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfig = exports.CACHE_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.CACHE_CONFIG_KEY = 'cache';
exports.cacheConfig = (0, config_1.registerAs)(exports.CACHE_CONFIG_KEY, () => ({
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
        user: 5 * 60 * 1000,
        session: 15 * 60 * 1000,
        general: 60 * 1000,
    },
}));
//# sourceMappingURL=cache.config.js.map