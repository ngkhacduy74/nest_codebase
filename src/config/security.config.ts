import { registerAs } from '@nestjs/config';

export const SECURITY_CONFIG_KEY = 'security';

export interface CorsConfig {
  readonly allowedOrigins: string[];
  readonly allowedMethods: string[];
  readonly allowedHeaders: string[];
  readonly credentials: boolean;
  readonly maxAge: number;
}

export interface RateLimitConfig {
  readonly windowMs: number;
  readonly limit: number;
  readonly skipSuccessfulRequests: boolean;
}

export interface HelmetConfig {
  readonly contentSecurityPolicy: boolean;
  readonly hsts: boolean;
  readonly noSniff: boolean;
}

export interface SecurityConfig {
  readonly cors: CorsConfig;
  readonly rateLimit: RateLimitConfig;
  readonly helmet: HelmetConfig;
}

const ALLOWED_PROTOCOLS = ['https:', 'http:'];

export const securityConfig = registerAs(
  SECURITY_CONFIG_KEY,
  (): SecurityConfig => {
    const rawOrigins = (
      process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000'
    )
      .split(',')
      .map((o) => o.trim());

    const validOrigins = rawOrigins.filter((origin) => {
      try {
        const url = new URL(origin);
        if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
          console.warn(
            `[SecurityConfig] Rejected origin with invalid protocol: ${origin}`,
          );
          return false;
        }
        // Block wildcard subdomains unless explicitly needed
        if (origin.includes('*')) {
          console.warn(`[SecurityConfig] Rejected wildcard origin: ${origin}`);
          return false;
        }
        return true;
      } catch {
        console.warn(`[SecurityConfig] Rejected malformed origin: ${origin}`);
        return false;
      }
    });

    if (validOrigins.length === 0) {
      throw new Error('No valid CORS origins configured');
    }

    return {
      cors: {
        allowedOrigins: validOrigins,
        allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'x-correlation-id',
        ],
        credentials: true,
        maxAge: 86400, // 24h preflight cache
      },
      rateLimit: {
        windowMs: parseInt(process.env['THROTTLE_TTL_MS'] ?? '60000', 10),
        limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
        skipSuccessfulRequests: false,
      },
      helmet: {
        contentSecurityPolicy: process.env['NODE_ENV'] === 'production',
        hsts: process.env['NODE_ENV'] === 'production',
        noSniff: true,
      },
    };
  },
);
