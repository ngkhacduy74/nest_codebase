import { AppConfig } from './app/app-config.type';
import { DatabaseConfig } from './database/database-config.type';
import { RedisConfig } from './redis/redis-config.type';
import { AuthConfig } from './auth/auth-config.type';

export type GlobalConfig = {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
};
