import { registerAs } from '@nestjs/config';

export const QUEUE_CONFIG_KEY = 'queue';

export interface QueueRetryConfig {
  readonly attempts: number;
  readonly backoff: {
    readonly type: 'fixed' | 'exponential';
    readonly delay: number;
  };
}

export interface QueueConfig {
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password?: string;
  };
  readonly defaultJobOptions: QueueRetryConfig;
  readonly concurrency: number;
  readonly removeOnComplete: number;
  readonly removeOnFail: number;
}

export const queueConfig = registerAs(
  QUEUE_CONFIG_KEY,
  (): QueueConfig => ({
    redis: {
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      password: process.env['REDIS_PASSWORD'] ?? undefined,
    },
    defaultJobOptions: {
      attempts: parseInt(process.env['QUEUE_RETRY_ATTEMPTS'] ?? '3', 10),
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env['QUEUE_RETRY_DELAY_MS'] ?? '1000', 10),
      },
    },
    concurrency: parseInt(process.env['QUEUE_CONCURRENCY'] ?? '10', 10),
    removeOnComplete: parseInt(
      process.env['QUEUE_REMOVE_COMPLETE'] ?? '100',
      10,
    ),
    removeOnFail: parseInt(process.env['QUEUE_REMOVE_FAIL'] ?? '50', 10),
  }),
);
