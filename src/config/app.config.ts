import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';

export interface AppConfig {
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly name: string;
  readonly apiPrefix: string;
  readonly apiVersion: string;
  readonly debug: boolean;
  readonly shutdownTimeout: number;
  readonly fallbackLanguage: string;
}

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
  Local = 'local',
}

export const appConfig = registerAs(
  APP_CONFIG_KEY,
  (): AppConfig => ({
    nodeEnv: (process.env['NODE_ENV'] as NodeEnv) ?? NodeEnv.Development,
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    name: process.env['APP_NAME'] ?? 'NestJS SaaS Backend',
    apiPrefix: process.env['API_PREFIX'] ?? 'api/v1',
    apiVersion: process.env['API_VERSION'] ?? '1.0.0',
    debug: (process.env['NODE_ENV'] as NodeEnv) !== NodeEnv.Production,
    shutdownTimeout: parseInt(
      process.env['SHUTDOWN_TIMEOUT_MS'] ?? '10000',
      10,
    ),
    fallbackLanguage: process.env['FALLBACK_LANGUAGE'] ?? 'en',
  }),
);
