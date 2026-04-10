export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export interface HelmetConfig {
  contentSecurityPolicy: boolean;
  hsts: boolean;
  noSniff: boolean;
}

export interface SecurityConfig {
  cors: CorsConfig;
  helmet: HelmetConfig;
}
