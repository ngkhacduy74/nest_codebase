import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ClsService } from 'nestjs-cls';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import { APP_CONFIG_KEY, AppConfig, NodeEnv, SECURITY_CONFIG_KEY, SecurityConfig } from './config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppClsStore } from './modules/cls/cls.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, trustProxy: true }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);
  const appConf = configService.get<AppConfig>(APP_CONFIG_KEY)!;
  const secConf = configService.get<SecurityConfig>(SECURITY_CONFIG_KEY)!;

  // ── Helmet ──────────────────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: secConf.helmet.contentSecurityPolicy,
    hsts: secConf.helmet.hsts
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
    noSniff: secConf.helmet.noSniff,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    crossOriginEmbedderPolicy: false,
  });

  // ── Compression ─────────────────────────────────────────────────────────────
  await app.register(compression, { encodings: ['gzip', 'deflate'] });

  // ── CORS — strict origin matching ──────────────────────────────────────────
  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin)
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        const isAllowed = secConf.cors.allowedOrigins.some((allowed) => {
          const allowedUrl = new URL(allowed);
          return (
            url.protocol === allowedUrl.protocol &&
            url.hostname === allowedUrl.hostname &&
            url.port === allowedUrl.port
          );
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" is not allowed`), false);
        }
      } catch {
        callback(new Error(`CORS: malformed origin "${origin}"`), false);
      }
    },
    methods: secConf.cors.allowedMethods,
    allowedHeaders: secConf.cors.allowedHeaders,
    credentials: secConf.cors.credentials,
    maxAge: secConf.cors.maxAge,
  });

  // ── API prefix & versioning ─────────────────────────────────────────────────
  app.setGlobalPrefix(appConf.apiPrefix);
  app.enableVersioning({ type: VersioningType.URI });

  // ── Global Validation Pipe — STRICT ────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true, // ← FIXED: was missing
      stopAtFirstError: false, // ← collect ALL errors, not just first
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // ── Global Filter (uses ClsService for requestId/traceId) ──────────────────
  const clsService = app.get(ClsService<AppClsStore>);
  app.useGlobalFilters(new AllExceptionsFilter(clsService));

  // ── Global Interceptors ─────────────────────────────────────────────────────
  // const auditService = app.get(AuditService);
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    // new AuditLogInterceptor( clsService),
  );

  // ── Swagger ─────────────────────────────────────────────────────────────────
  if (appConf.nodeEnv !== NodeEnv.Production) {
    const doc = new DocumentBuilder()
      .setTitle('NestJS SaaS API')
      .setDescription('Enterprise-grade SaaS backend — full API reference')
      .setVersion(appConf.apiVersion)
      .addBearerAuth()
      .addServer(`http://localhost:${appConf.port}`, 'Local')
      .build();
    SwaggerModule.setup(
      `${appConf.apiPrefix}/docs`,
      app,
      SwaggerModule.createDocument(app, doc),
      { swaggerOptions: { persistAuthorization: true } },
    );
    logger.log(
      `📚 Swagger: http://localhost:${appConf.port}/${appConf.apiPrefix}/docs`,
    );
  }

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  app.enableShutdownHooks();
  (['SIGTERM', 'SIGINT'] as NodeJS.Signals[]).forEach((signal) => {
    process.on(signal, async () => {
      logger.log(
        `[${signal}] Shutting down gracefully (${appConf.shutdownTimeout}ms)...`,
      );
      setTimeout(() => process.exit(1), appConf.shutdownTimeout).unref();
      await app.close();
      process.exit(0);
    });
  });

  await app.listen(appConf.port, '0.0.0.0');
  logger.log(
    `🚀 Running: http://localhost:${appConf.port}/${appConf.apiPrefix}`,
  );
  logger.log(`🌍 Env: ${appConf.nodeEnv}`);
}

bootstrap().catch((err: unknown) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
