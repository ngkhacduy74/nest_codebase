import { registerAs } from '@nestjs/config';
import { 
  IsString, 
  IsOptional, 
  IsInt, 
  IsBoolean, 
  IsNotEmpty 
} from 'class-validator';
import { AuthConfig } from './auth-config.type';
import { validateConfig } from '@/utils/config/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  AUTH_JWT_ACCESS_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_JWT_REFRESH_EXPIRES_IN: string;

  @IsInt()
  @IsOptional()
  AUTH_SESSION_MAX_ACTIVE: number;

  @IsBoolean()
  @IsOptional()
  AUTH_SESSION_BLACKLIST_ENABLED: boolean;

  @IsInt()
  @IsOptional()
  AUTH_PASSWORD_MIN_LENGTH: number;

  @IsBoolean()
  @IsOptional()
  AUTH_PASSWORD_REQUIRE_UPPERCASE: boolean;

  @IsBoolean()
  @IsOptional()
  AUTH_PASSWORD_REQUIRE_LOWERCASE: boolean;

  @IsBoolean()
  @IsOptional()
  AUTH_PASSWORD_REQUIRE_NUMBERS: boolean;

  @IsBoolean()
  @IsOptional()
  AUTH_PASSWORD_REQUIRE_SPECIAL_CHARS: boolean;
}

export default registerAs<AuthConfig>('auth', () => {
  const validatedConfig = validateConfig(process.env, EnvironmentVariablesValidator);
  
  return {
    jwt: {
      accessToken: {
        secret: validatedConfig.AUTH_JWT_ACCESS_SECRET || '',
        expiresIn: validatedConfig.AUTH_JWT_ACCESS_EXPIRES_IN || '15m',
      },
      refreshToken: {
        secret: validatedConfig.AUTH_JWT_REFRESH_SECRET || '',
        expiresIn: validatedConfig.AUTH_JWT_REFRESH_EXPIRES_IN || '7d',
      },
    },
    session: {
      maxActive: validatedConfig.AUTH_SESSION_MAX_ACTIVE || 5,
      blacklistEnabled: validatedConfig.AUTH_SESSION_BLACKLIST_ENABLED !== false,
    },
    password: {
      minLength: validatedConfig.AUTH_PASSWORD_MIN_LENGTH || 8,
      requireUppercase: validatedConfig.AUTH_PASSWORD_REQUIRE_UPPERCASE !== false,
      requireLowercase: validatedConfig.AUTH_PASSWORD_REQUIRE_LOWERCASE !== false,
      requireNumbers: validatedConfig.AUTH_PASSWORD_REQUIRE_NUMBERS !== false,
      requireSpecialChars: validatedConfig.AUTH_PASSWORD_REQUIRE_SPECIAL_CHARS !== false,
    },
  };
});
