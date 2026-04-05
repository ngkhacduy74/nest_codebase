import { PrismaService } from '@/modules/prisma/prisma.service';
import { AppLoggerService } from '@/common/services/logger.service';

export interface TestDatabase {
  reset: () => Promise<void>;
  close: () => Promise<void>;
  clear: (table?: string) => Promise<void>;
  seed: (data?: any) => Promise<void>;
  transaction: (callback: (tx: any) => Promise<void>) => Promise<void>;
}

export class TestBuilder<T> {
  private data: Partial<T> = {};

  constructor(private readonly entityName: string) {}

  with<K extends keyof T>(key: K, value: T[K]): TestBuilder<T> {
    this.data[key] = value;
    return this;
  }

  without<K extends keyof T>(key: K): TestBuilder<T> {
    delete this.data[key];
    return this;
  }

  build(): Partial<T> {
    return { ...this.data };
  }
}

export class DatabaseTestHelper implements TestDatabase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async reset(): Promise<void> {
    await this.logger.trace('Resetting test database');
    
    // Delete all data in correct order to respect foreign keys
    await this.prisma.product.deleteMany();
    await this.prisma.user.deleteMany();
    
    this.logger.trace('Test database reset completed');
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
    this.logger.trace('Test database connection closed');
  }

  async clear(table?: string): Promise<void> {
    if (table) {
      await this.logger.trace(`Clearing table: ${table}`);
      
      switch (table.toLowerCase()) {
        case 'users':
          await this.prisma.user.deleteMany();
          break;
        case 'products':
          await this.prisma.product.deleteMany();
          break;
        default:
          this.logger.warn(`Unknown table for clearing: ${table}`);
      }
    } else {
      await this.reset();
    }
  }

  async seed(data?: any): Promise<void> {
    await this.logger.trace('Seeding test database');
    
    if (data?.users) {
      await this.prisma.user.createMany({
        data: data.users,
      });
    }

    if (data?.products) {
      await this.prisma.product.createMany({
        data: data.products,
      });
    }

    this.logger.trace('Test database seeding completed');
  }

  async transaction(callback: (tx: any) => Promise<void>): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await callback(tx);
    });
  }

  async createTestData<T>(entity: string, data: Partial<T>[]): Promise<T[]> {
    const model = this.getModel(entity);
    if (!model) {
      throw new Error(`Unknown entity: ${entity}`);
    }

    const result = await (model as any).createMany({
      data,
    });

    return result as T[];
  }

  async countEntities(entity: string): Promise<number> {
    const model = this.getModel(entity);
    if (!model) {
      throw new Error(`Unknown entity: ${entity}`);
    }

    return await (model as any).count();
  }

  private getModel(entity: string): any {
    switch (entity.toLowerCase()) {
      case 'user':
        return this.prisma.user;
      case 'product':
        return this.prisma.product;
      default:
        return null;
    }
  }

  // Assertions for testing
  assertExists<T>(data: T | null | undefined, message?: string): asserts data is T {
    if (data === null || data === undefined) {
      throw new Error(message || `Expected data to exist, but got ${data}`);
    }
  }

  assertNotExists<T>(data: T | null | undefined, message?: string): asserts data is null | undefined {
    if (data !== null && data !== undefined) {
      throw new Error(message || `Expected data to not exist, but got ${data}`);
    }
  }

  assertEquals<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  }

  assertNotEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Expected not ${expected}, but got ${actual}`);
    }
  }

  assertContains<T extends string>(actual: T, expected: string, message?: string): void {
    if (!actual.includes(expected)) {
      throw new Error(message || `Expected "${actual}" to contain "${expected}"`);
    }
  }

  assertLength<T extends any[]>(actual: T, expectedLength: number, message?: string): void {
    if (actual.length !== expectedLength) {
      throw new Error(message || `Expected length ${expectedLength}, but got ${actual.length}`);
    }
  }

  // Mock helpers
  createMock<T>(overrides?: Partial<T>): T {
    return overrides as T;
  }

  createMockArray<T>(length: number, overrides?: Partial<T>): T[] {
    return Array.from({ length }, () => this.createMock(overrides));
  }

  // Date helpers
  createFutureDate(days: number = 1): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  createPastDate(days: number = 1): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  // String helpers
  randomEmail(): string {
    return `test-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  randomString(length: number = 10): string {
    return Math.random().toString(36).substr(2, length);
  }

  randomUUID(): string {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
}

export class TestTimer {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  elapsed(): number {
    return Date.now() - this.startTime;
  }

  assertMaxTime(maxMs: number, message?: string): void {
    const elapsed = this.elapsed();
    if (elapsed > maxMs) {
      throw new Error(message || `Test took too long: ${elapsed}ms (max: ${maxMs}ms)`);
    }
  }
}

// Global test setup utilities
export class TestSetup {
  static async setupTestDatabase(prisma: PrismaService, logger: AppLoggerService): Promise<TestDatabase> {
    const helper = new DatabaseTestHelper(prisma, logger);
    await helper.reset();
    return helper;
  }

  static async cleanupTestDatabase(helper: TestDatabase): Promise<void> {
    await helper.close();
  }

  static createTestContext(user?: { id: string; email: string; role: string }) {
    return {
      user: user || {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'USER',
      },
      requestId: 'test-request-id',
      traceId: 'test-trace-id',
    };
  }
}
