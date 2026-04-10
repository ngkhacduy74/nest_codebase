export interface ThrottlerLimitConfig {
  ttl: number; // milliseconds
  limit: number; // requests
}

export interface ThrottlerEndpointConfig {
  pattern: string | RegExp;
  limit: ThrottlerLimitConfig;
}

export interface ThrottlerConfig {
  default: ThrottlerLimitConfig;
  endpoints: ThrottlerEndpointConfig[];
  storage: 'memory' | 'redis';
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  whitelist: string[]; // IP addresses to exclude
}
