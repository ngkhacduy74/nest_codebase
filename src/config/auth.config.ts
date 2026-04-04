import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG_KEY = 'auth';

export interface JwtTokenConfig {
  readonly secret: string;
  readonly expiresIn: string;
}

export interface ArgonConfig {
  readonly type: number; // argon2id = 2
  readonly memoryCost: number;
  readonly timeCost: number;
  readonly parallelism: number;
}

export interface AuthConfig {
  readonly accessToken: JwtTokenConfig;
  readonly refreshToken: JwtTokenConfig;
  readonly argon: ArgonConfig;
  readonly maxActiveSessions: number;
  readonly tokenBlacklistTtlSeconds: number;
}

export const authConfig = registerAs(
  AUTH_CONFIG_KEY,
  (): AuthConfig => ({
    accessToken: {
      secret: process.env['JWT_ACCESS_SECRET'] || (() => {
        throw new Error('JWT_ACCESS_SECRET is required');
      })(),
      expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    },
    refreshToken: {
      secret: process.env['JWT_REFRESH_SECRET'] || (() => {
        throw new Error('JWT_REFRESH_SECRET is required');
      })(),
      expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    },
    argon: {
      type: 2, // argon2id
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    },
    maxActiveSessions: parseInt(process.env['MAX_ACTIVE_SESSIONS'] ?? '5', 10),
    tokenBlacklistTtlSeconds: 60 * 60 * 24, // 24h — matches access token max lifetime
  }),
);
