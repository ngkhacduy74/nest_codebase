export type DatabaseConfig = {
  url: string;
  ssl?: boolean;
  connectionTimeout?: number;
  idleTimeout?: number;
};
