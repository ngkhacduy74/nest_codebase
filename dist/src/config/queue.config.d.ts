export declare const QUEUE_CONFIG_KEY = "queue";
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
export declare const queueConfig: (() => QueueConfig) & import("@nestjs/config").ConfigFactoryKeyHost<QueueConfig>;
