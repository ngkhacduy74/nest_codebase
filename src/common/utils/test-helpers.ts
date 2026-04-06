import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppLoggerService } from '@/common/services/logger.service';

// Mock providers for testing
export const mockProviders = {
  // Cache Manager
  CACHE_MANAGER: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  },
  
  // Logger Service
  AppLoggerService: {
    recordMetric: jest.fn(),
    recordDuration: jest.fn(),
    startTimer: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },

  // Config Service
  ConfigService: {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  },
};

// Performance metrics tokens
export const PERFORMANCE_TOKENS = {
  CACHE_HITS_TOTAL: 'PROM_METRIC_CACHE_HITS_TOTAL',
  CACHE_MISSES_TOTAL: 'PROM_METRIC_CACHE_MISSES_TOTAL',
  ACTIVE_SESSIONS_TOTAL: 'PROM_METRIC_ACTIVE_SESSIONS_TOTAL',
};

export interface TestModuleOptions {
  providers?: any[];
  imports?: any[];
}

export async function createTestModule(options: TestModuleOptions = {}): Promise<TestingModule> {
  const defaultProviders = [
    ...Object.entries(mockProviders).map(([key, value]) => ({
      provide: key,
      useValue: value,
    })),
    ...Object.entries(PERFORMANCE_TOKENS).map(([key, value]) => ({
      provide: value,
      useValue: { recordMetric: jest.fn() },
    })),
  ];

  const defaultImports = [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ];

  return Test.createTestingModule({
    imports: [...defaultImports, ...(options.imports || [])],
    providers: [...defaultProviders, ...(options.providers || [])],
  });
}

export function createMockRepository<T extends Record<string, any>>(methods: Partial<T> = {}): T {
  const mock = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    ...methods,
  } as unknown as T;

  return mock;
}

export function createMockAuthService() {
  return {
    validateUser: jest.fn(),
    generateTokens: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };
}

export function createMockJwtService() {
  return {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };
}

export function createMockConfigService() {
  return {
    get: jest.fn((key: string) => {
      const configMap = {
        'app': {
          nodeEnv: 'development',
          port: 3000,
          name: 'NestJS SaaS',
          apiPrefix: 'api/v1',
          apiVersion: '1',
          shutdownTimeout: 30000,
          fallbackLanguage: 'en',
          corsOrigin: '*',
        },
        'auth': {
          accessTokenSecret: 'test-secret',
          refreshTokenSecret: 'test-refresh-secret',
          accessTokenExpiresIn: 900,
          refreshTokenExpiresIn: 604800,
        },
        'database': {
          url: 'postgresql://localhost:5432/testdb',
        },
        'redis': {
          host: 'localhost',
          port: 6379,
        },
      };
      
      return configMap[key] || null;
    }),
  };
}

export function createMockClsService() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    run: jest.fn(),
  };
}
