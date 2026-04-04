"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.DATABASE_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.DATABASE_CONFIG_KEY = 'database';
exports.databaseConfig = (0, config_1.registerAs)(exports.DATABASE_CONFIG_KEY, () => {
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';
    return {
        url: process.env['DATABASE_URL'] || (() => {
            throw new Error('DATABASE_URL is required');
        })(),
        pool: {
            min: parseInt(process.env['DB_POOL_MIN'] ?? '2', 10),
            max: parseInt(process.env['DB_POOL_MAX'] ?? '10', 10),
            acquireTimeoutMs: parseInt(process.env['DB_ACQUIRE_TIMEOUT_MS'] ?? '30000', 10),
            idleTimeoutMs: parseInt(process.env['DB_IDLE_TIMEOUT_MS'] ?? '600000', 10),
        },
        retry: {
            maxAttempts: parseInt(process.env['DB_RETRY_MAX'] ?? '3', 10),
            delayMs: parseInt(process.env['DB_RETRY_DELAY_MS'] ?? '1000', 10),
            backoffMultiplier: parseFloat(process.env['DB_RETRY_BACKOFF'] ?? '2'),
        },
        logQueries: nodeEnv === 'development',
        slowQueryThresholdMs: parseInt(process.env['DB_SLOW_QUERY_MS'] ?? '1000', 10),
    };
});
//# sourceMappingURL=database.config.js.map