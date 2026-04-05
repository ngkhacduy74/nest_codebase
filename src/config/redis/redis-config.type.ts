export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db?: number;
  connectTimeout?: number;
  lazyConnect?: boolean;
  maxRetriesPerRequest?: number;
};
