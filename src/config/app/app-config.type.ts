export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging',
}

export type AppConfig = {
  nodeEnv: Environment;
  port: number;
  name: string;
  apiPrefix: string;
  apiVersion: string;
  shutdownTimeout: number;
  fallbackLanguage: string;
  corsOrigin: boolean | string[] | '*';
};
