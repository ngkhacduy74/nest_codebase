"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityConfig = exports.SECURITY_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.SECURITY_CONFIG_KEY = 'security';
const ALLOWED_PROTOCOLS = ['https:', 'http:'];
exports.securityConfig = (0, config_1.registerAs)(exports.SECURITY_CONFIG_KEY, () => {
    const rawOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    const validOrigins = rawOrigins.filter((origin) => {
        try {
            const url = new URL(origin);
            if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
                console.warn(`[SecurityConfig] Rejected origin with invalid protocol: ${origin}`);
                return false;
            }
            if (origin.includes('*')) {
                console.warn(`[SecurityConfig] Rejected wildcard origin: ${origin}`);
                return false;
            }
            return true;
        }
        catch {
            console.warn(`[SecurityConfig] Rejected malformed origin: ${origin}`);
            return false;
        }
    });
    if (validOrigins.length === 0) {
        throw new Error('No valid CORS origins configured');
    }
    return {
        cors: {
            allowedOrigins: validOrigins,
            allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'x-correlation-id',
            ],
            credentials: true,
            maxAge: 86400,
        },
        rateLimit: {
            windowMs: parseInt(process.env['THROTTLE_TTL_MS'] ?? '60000', 10),
            limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
            skipSuccessfulRequests: false,
        },
        helmet: {
            contentSecurityPolicy: process.env['NODE_ENV'] === 'production',
            hsts: process.env['NODE_ENV'] === 'production',
            noSniff: true,
        },
    };
});
//# sourceMappingURL=security.config.js.map