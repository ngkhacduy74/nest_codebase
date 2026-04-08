import { registerAs } from '@nestjs/config';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { RedisConfig } from './redis-config.type';
import { validateConfig } from '@/common/utils/config/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  CACHE_REDIS_HOST: string;

  @IsInt()
  @IsOptional()
  CACHE_REDIS_PORT: number;

  @IsString()
  @IsOptional()
  CACHE_REDIS_PASSWORD: string;

  @IsInt()
  @IsOptional()
  CACHE_REDIS_DB: number;

  @IsInt()
  @IsOptional()
  CACHE_REDIS_CONNECT_TIMEOUT: number;

  @IsBoolean()
  @IsOptional()
  CACHE_REDIS_LAZY_CONNECT: boolean;

  @IsInt()
  @IsOptional()
  CACHE_REDIS_MAX_RETRIES: number;
}

export default registerAs<RedisConfig>('redis', () => {
  const validatedConfig = validateConfig(
    process.env,
    EnvironmentVariablesValidator,
  );

  return {
    host: validatedConfig.CACHE_REDIS_HOST ?? 'localhost',
    port: validatedConfig.CACHE_REDIS_PORT ?? 6379,
    password: validatedConfig.CACHE_REDIS_PASSWORD ?? '',
    db: validatedConfig.CACHE_REDIS_DB,
    connectTimeout: validatedConfig.CACHE_REDIS_CONNECT_TIMEOUT,
    lazyConnect: validatedConfig.CACHE_REDIS_LAZY_CONNECT,
    maxRetriesPerRequest: validatedConfig.CACHE_REDIS_MAX_RETRIES,
  };
});
