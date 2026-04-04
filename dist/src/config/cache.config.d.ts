export declare const CACHE_CONFIG_KEY = "cache";
export interface RedisNodeConfig {
    readonly host: string;
    readonly port: number;
    readonly password?: string;
    readonly db?: number;
    readonly tls?: boolean;
}
export interface CacheConfig {
    readonly redis: RedisNodeConfig;
    readonly defaultTtlMs: number;
    readonly keyPrefix: string;
    readonly isCluster: boolean;
    readonly ttl: {
        readonly user: number;
        readonly session: number;
        readonly general: number;
    };
}
export declare const cacheConfig: (() => CacheConfig) & import("@nestjs/config").ConfigFactoryKeyHost<CacheConfig>;
