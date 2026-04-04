"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = exports.NodeEnv = exports.APP_CONFIG_KEY = void 0;
const config_1 = require("@nestjs/config");
exports.APP_CONFIG_KEY = 'app';
var NodeEnv;
(function (NodeEnv) {
    NodeEnv["Development"] = "development";
    NodeEnv["Production"] = "production";
    NodeEnv["Test"] = "test";
    NodeEnv["Staging"] = "staging";
    NodeEnv["Local"] = "local";
})(NodeEnv || (exports.NodeEnv = NodeEnv = {}));
exports.appConfig = (0, config_1.registerAs)(exports.APP_CONFIG_KEY, () => ({
    nodeEnv: process.env['NODE_ENV'] ?? NodeEnv.Development,
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    name: process.env['APP_NAME'] ?? 'NestJS SaaS Backend',
    apiPrefix: process.env['API_PREFIX'] ?? 'api/v1',
    apiVersion: process.env['API_VERSION'] ?? '1.0.0',
    debug: process.env['NODE_ENV'] !== NodeEnv.Production,
    shutdownTimeout: parseInt(process.env['SHUTDOWN_TIMEOUT_MS'] ?? '10000', 10),
    fallbackLanguage: process.env['FALLBACK_LANGUAGE'] ?? 'en',
}));
//# sourceMappingURL=app.config.js.map