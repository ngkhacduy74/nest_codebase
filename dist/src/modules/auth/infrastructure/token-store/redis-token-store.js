"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisTokenStore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisTokenStore = exports.TOKEN_STORE = void 0;
const config_1 = require("../../../../config");
const common_1 = require("@nestjs/common");
const config_2 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
exports.TOKEN_STORE = Symbol('TOKEN_STORE');
let RedisTokenStore = RedisTokenStore_1 = class RedisTokenStore {
    logger = new common_1.Logger(RedisTokenStore_1.name);
    redis;
    keyPrefix;
    constructor(configService) {
        const cacheConf = configService.get(config_1.CACHE_CONFIG_KEY);
        this.keyPrefix = cacheConf.keyPrefix;
        this.redis = new ioredis_1.default({
            host: cacheConf.redis.host,
            port: cacheConf.redis.port,
            password: cacheConf.redis.password,
            db: cacheConf.redis.db ?? 1,
        });
        this.redis.on('error', (err) => {
            this.logger.error('Redis token store error:', err.message);
        });
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    async storeRefreshToken(userId, tokenId, ttlSeconds) {
        const key = this.refreshKey(userId, tokenId);
        await this.redis.setex(key, ttlSeconds, '1');
    }
    async validateRefreshToken(userId, tokenId) {
        const key = this.refreshKey(userId, tokenId);
        const exists = await this.redis.exists(key);
        return exists === 1;
    }
    async revokeRefreshToken(userId, tokenId) {
        const key = this.refreshKey(userId, tokenId);
        const deleted = await this.redis.del(key);
        if (deleted === 0) {
            this.logger.warn(`[TOKEN REUSE DETECTED] userId=${userId} tokenId=${tokenId}`);
            await this.revokeAllUserTokens(userId);
            throw new Error('Refresh token reuse detected — all sessions invalidated');
        }
    }
    async revokeAllUserTokens(userId) {
        const pattern = `${this.keyPrefix}:rt:${userId}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
    async blacklistAccessToken(jti, ttlSeconds) {
        const key = this.blacklistKey(jti);
        await this.redis.setex(key, ttlSeconds, '1');
    }
    async isAccessTokenBlacklisted(jti) {
        const key = this.blacklistKey(jti);
        return (await this.redis.exists(key)) === 1;
    }
    refreshKey(userId, tokenId) {
        return `${this.keyPrefix}:rt:${userId}:${tokenId}`;
    }
    blacklistKey(jti) {
        return `${this.keyPrefix}:blacklist:${jti}`;
    }
};
exports.RedisTokenStore = RedisTokenStore;
exports.RedisTokenStore = RedisTokenStore = RedisTokenStore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_2.ConfigService])
], RedisTokenStore);
//# sourceMappingURL=redis-token-store.js.map