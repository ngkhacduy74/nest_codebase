"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfigModule = exports.ALL_CONFIGS = void 0;
const config_1 = require("@nestjs/config");
const app_config_1 = require("./app.config");
const auth_config_1 = require("./auth.config");
const database_config_1 = require("./database.config");
const cache_config_1 = require("./cache.config");
const queue_config_1 = require("./queue.config");
const logger_config_1 = require("./logger.config");
const security_config_1 = require("./security.config");
const env_validation_1 = require("./env.validation");
exports.ALL_CONFIGS = [
    app_config_1.appConfig,
    auth_config_1.authConfig,
    database_config_1.databaseConfig,
    cache_config_1.cacheConfig,
    queue_config_1.queueConfig,
    logger_config_1.loggerConfig,
    security_config_1.securityConfig,
];
const buildConfigModule = () => config_1.ConfigModule.forRoot({
    isGlobal: true,
    load: exports.ALL_CONFIGS,
    envFilePath: ['.env.local', '.env'],
    expandVariables: true,
    validate: env_validation_1.validate,
});
exports.buildConfigModule = buildConfigModule;
//# sourceMappingURL=config.registry.js.map