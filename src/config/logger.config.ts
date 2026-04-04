import { registerAs } from '@nestjs/config';

export const LOGGER_CONFIG_KEY = 'logger';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogProvider = 'console' | 'cloudwatch' | 'datadog' | 'stackdriver';

export interface LoggerConfig {
  readonly level: LogLevel;
  readonly provider: LogProvider;
  readonly prettyPrint: boolean;
  readonly redactPaths: string[];
  readonly correlationIdHeader: string;
}

export const loggerConfig = registerAs(
  LOGGER_CONFIG_KEY,
  (): LoggerConfig => ({
    level:
      (process.env['LOG_LEVEL'] as LogLevel) ??
      (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
    provider: (process.env['LOG_PROVIDER'] as LogProvider) ?? 'console',
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
    correlationIdHeader:
      process.env['CORRELATION_ID_HEADER'] ?? 'x-correlation-id',
  }),
);
