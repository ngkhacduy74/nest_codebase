"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerConfig = exports.LOGGER_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.LOGGER_CONFIG_KEY = 'logger';
exports.loggerConfig = (0, config_1.registerAs)(exports.LOGGER_CONFIG_KEY, () => ({
    level: process.env['LOG_LEVEL'] ??
        (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
    provider: process.env['LOG_PROVIDER'] ?? 'console',
    prettyPrint: process.env['NODE_ENV'] !== 'production',
    redactPaths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.passwordHash',
        'req.body.refreshToken',
        'res.body.accessToken',
        'res.body.refreshToken',
    ],
    correlationIdHeader: process.env['CORRELATION_ID_HEADER'] ?? 'x-correlation-id',
}));
//# sourceMappingURL=logger.config.js.map