"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueConfig = exports.QUEUE_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.QUEUE_CONFIG_KEY = 'queue';
exports.queueConfig = (0, config_1.registerAs)(exports.QUEUE_CONFIG_KEY, () => ({
    redis: {
        host: process.env['REDIS_HOST'] ?? 'localhost',
        port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
        password: process.env['REDIS_PASSWORD'] ?? undefined,
    },
    defaultJobOptions: {
        attempts: parseInt(process.env['QUEUE_RETRY_ATTEMPTS'] ?? '3', 10),
        backoff: {
            type: 'exponential',
            delay: parseInt(process.env['QUEUE_RETRY_DELAY_MS'] ?? '1000', 10),
        },
    },
    concurrency: parseInt(process.env['QUEUE_CONCURRENCY'] ?? '10', 10),
    removeOnComplete: parseInt(process.env['QUEUE_REMOVE_COMPLETE'] ?? '100', 10),
    removeOnFail: parseInt(process.env['QUEUE_REMOVE_FAIL'] ?? '50', 10),
}));
//# sourceMappingURL=queue.config.js.map