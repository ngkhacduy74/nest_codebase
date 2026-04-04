import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, IsIn, IsEnum, validateSync } from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

export enum LogProvider {
  Console = 'console',
  Pino = 'pino',
}

class EnvironmentVariables {
  // App Configuration
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  APP_NAME: string = 'NestJS SaaS Backend';

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  API_VERSION: string = '1.0.0';

  @IsNumber()
  @IsOptional()
  SHUTDOWN_TIMEOUT_MS: number = 10000;

  // Database Configuration
  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  @IsOptional()
  DB_POOL_MIN: number = 2;

  @IsNumber()
  @IsOptional()
  DB_POOL_MAX: number = 10;

  @IsNumber()
  @IsOptional()
  DB_ACQUIRE_TIMEOUT_MS: number = 30000;

  @IsNumber()
  @IsOptional()
  DB_IDLE_TIMEOUT_MS: number = 600000;

  @IsNumber()
  @IsOptional()
  DB_RETRY_MAX: number = 3;

  @IsNumber()
  @IsOptional()
  DB_RETRY_DELAY_MS: number = 1000;

  @IsNumber()
  @IsOptional()
  DB_RETRY_BACKOFF: number = 2;

  @IsNumber()
  @IsOptional()
  DB_SLOW_QUERY_MS: number = 1000;

  // Redis Configuration
  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  REDIS_DB: number = 0;

  @IsBoolean()
  @IsOptional()
  REDIS_TLS: boolean = false;

  @IsBoolean()
  @IsOptional()
  REDIS_CLUSTER: boolean = false;

  @IsNumber()
  @IsOptional()
  CACHE_DEFAULT_TTL_MS: number = 60000;

  @IsString()
  @IsOptional()
  CACHE_KEY_PREFIX: string = 'saas';

  // JWT Configuration
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsNumber()
  @IsOptional()
  MAX_ACTIVE_SESSIONS: number = 5;

  // Security Configuration
  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS: string = 'http://localhost:3000';

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL_MS: number = 60000;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 100;

  // Logger Configuration
  @IsEnum(LogLevel)
  @IsOptional()
  LOG_LEVEL: LogLevel;

  @IsEnum(LogProvider)
  @IsOptional()
  LOG_PROVIDER: LogProvider = LogProvider.Console;

  @IsString()
  @IsOptional()
  CORRELATION_ID_HEADER: string = 'x-correlation-id';

  // Queue Configuration
  @IsNumber()
  @IsOptional()
  QUEUE_RETRY_ATTEMPTS: number = 3;

  @IsNumber()
  @IsOptional()
  QUEUE_RETRY_DELAY_MS: number = 1000;

  @IsNumber()
  @IsOptional()
  QUEUE_CONCURRENCY: number = 10;

  @IsNumber()
  @IsOptional()
  QUEUE_REMOVE_COMPLETE: number = 100;

  @IsNumber()
  @IsOptional()
  QUEUE_REMOVE_FAIL: number = 50;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });
    
    console.error('❌ Environment validation failed:');
    errorMessages.forEach(message => console.error(`  - ${message}`));
    
    process.exit(1);
  }

  return validatedConfig;
}
