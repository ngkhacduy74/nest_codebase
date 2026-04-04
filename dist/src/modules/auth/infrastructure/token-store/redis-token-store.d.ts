import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare const TOKEN_STORE: unique symbol;
export interface ITokenStore {
    storeRefreshToken(userId: string, tokenId: string, ttlSeconds: number): Promise<void>;
    validateRefreshToken(userId: string, tokenId: string): Promise<boolean>;
    revokeRefreshToken(userId: string, tokenId: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void>;
    isAccessTokenBlacklisted(jti: string): Promise<boolean>;
}
export declare class RedisTokenStore implements ITokenStore, OnModuleDestroy {
    private readonly logger;
    private readonly redis;
    private readonly keyPrefix;
    constructor(configService: ConfigService);
    onModuleDestroy(): Promise<void>;
    storeRefreshToken(userId: string, tokenId: string, ttlSeconds: number): Promise<void>;
    validateRefreshToken(userId: string, tokenId: string): Promise<boolean>;
    revokeRefreshToken(userId: string, tokenId: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void>;
    isAccessTokenBlacklisted(jti: string): Promise<boolean>;
    private refreshKey;
    private blacklistKey;
}
