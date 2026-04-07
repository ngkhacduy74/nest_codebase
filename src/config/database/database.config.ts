import { registerAs } from '@nestjs/config';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { DatabaseConfig } from './database-config.type';
import { validateConfig } from '@/utils/config/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL: boolean;

  @IsInt()
  @IsOptional()
  DATABASE_CONNECTION_TIMEOUT: number;

  @IsInt()
  @IsOptional()
  DATABASE_IDLE_TIMEOUT: number;
}

export default registerAs<DatabaseConfig>('database', () => {
  const validatedConfig = validateConfig(
    process.env,
    EnvironmentVariablesValidator,
  );

  return {
    url: validatedConfig.DATABASE_URL || '',
    ssl: validatedConfig.DATABASE_SSL,
    connectionTimeout: validatedConfig.DATABASE_CONNECTION_TIMEOUT,
    idleTimeout: validatedConfig.DATABASE_IDLE_TIMEOUT,
  };
});
