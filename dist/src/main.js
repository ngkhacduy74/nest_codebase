"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const nestjs_cls_1 = require("nestjs-cls");
const compress_1 = __importDefault(require("@fastify/compress"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const config_2 = require("./config");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: false, trustProxy: true }), { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const configService = app.get(config_1.ConfigService);
    const appConf = configService.get(config_2.APP_CONFIG_KEY);
    const secConf = configService.get(config_2.SECURITY_CONFIG_KEY);
    await app.register(helmet_1.default, {
        contentSecurityPolicy: secConf.helmet.contentSecurityPolicy,
        hsts: secConf.helmet.hsts
            ? { maxAge: 31536000, includeSubDomains: true }
            : false,
        noSniff: secConf.helmet.noSniff,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        crossOriginEmbedderPolicy: false,
    });
    await app.register(compress_1.default, { encodings: ['gzip', 'deflate'] });
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            try {
                const url = new URL(origin);
                const isAllowed = secConf.cors.allowedOrigins.some((allowed) => {
                    const allowedUrl = new URL(allowed);
                    return (url.protocol === allowedUrl.protocol &&
                        url.hostname === allowedUrl.hostname &&
                        url.port === allowedUrl.port);
                });
                if (isAllowed) {
                    callback(null, true);
                }
                else {
                    callback(new Error(`CORS: origin "${origin}" is not allowed`), false);
                }
            }
            catch {
                callback(new Error(`CORS: malformed origin "${origin}"`), false);
            }
        },
        methods: secConf.cors.allowedMethods,
        allowedHeaders: secConf.cors.allowedHeaders,
        credentials: secConf.cors.credentials,
        maxAge: secConf.cors.maxAge,
    });
    app.setGlobalPrefix(appConf.apiPrefix);
    app.enableVersioning({ type: common_1.VersioningType.URI });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        stopAtFirstError: false,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    const clsService = app.get((nestjs_cls_1.ClsService));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(clsService));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    if (appConf.nodeEnv !== config_2.NodeEnv.Production) {
        const doc = new swagger_1.DocumentBuilder()
            .setTitle('NestJS SaaS API')
            .setDescription('Enterprise-grade SaaS backend — full API reference')
            .setVersion(appConf.apiVersion)
            .addBearerAuth()
            .addServer(`http://localhost:${appConf.port}`, 'Local')
            .build();
        swagger_1.SwaggerModule.setup(`${appConf.apiPrefix}/docs`, app, swagger_1.SwaggerModule.createDocument(app, doc), { swaggerOptions: { persistAuthorization: true } });
        logger.log(`📚 Swagger: http://localhost:${appConf.port}/${appConf.apiPrefix}/docs`);
    }
    app.enableShutdownHooks();
    ['SIGTERM', 'SIGINT'].forEach((signal) => {
        process.on(signal, async () => {
            logger.log(`[${signal}] Shutting down gracefully (${appConf.shutdownTimeout}ms)...`);
            setTimeout(() => process.exit(1), appConf.shutdownTimeout).unref();
            await app.close();
            process.exit(0);
        });
    });
    await app.listen(appConf.port, '0.0.0.0');
    logger.log(`🚀 Running: http://localhost:${appConf.port}/${appConf.apiPrefix}`);
    logger.log(`🌍 Env: ${appConf.nodeEnv}`);
}
bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map