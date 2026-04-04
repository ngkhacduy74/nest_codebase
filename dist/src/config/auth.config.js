"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = exports.AUTH_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.AUTH_CONFIG_KEY = 'auth';
exports.authConfig = (0, config_1.registerAs)(exports.AUTH_CONFIG_KEY, () => ({
    accessToken: {
        secret: process.env['JWT_ACCESS_SECRET'] || (() => {
            throw new Error('JWT_ACCESS_SECRET is required');
        })(),
        expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    },
    refreshToken: {
        secret: process.env['JWT_REFRESH_SECRET'] || (() => {
            throw new Error('JWT_REFRESH_SECRET is required');
        })(),
        expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    },
    argon: {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    },
    maxActiveSessions: parseInt(process.env['MAX_ACTIVE_SESSIONS'] ?? '5', 10),
    tokenBlacklistTtlSeconds: 60 * 60 * 24,
}));
//# sourceMappingURL=auth.config.js.map