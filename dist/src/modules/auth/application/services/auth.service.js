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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const nestjs_cls_1 = require("nestjs-cls");
const redis_token_store_1 = require("../../infrastructure/token-store/redis-token-store");
const auth_config_1 = require("../../../../config/auth.config");
const application_error_1 = require("../../../../shared/domain/errors/application.error");
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    jwtService;
    cls;
    tokenStore;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userRepository, jwtService, cls, tokenStore, configService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.cls = cls;
        this.tokenStore = tokenStore;
        this.configService = configService;
    }
    get authConf() {
        return this.configService.get(auth_config_1.AUTH_CONFIG_KEY);
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.isActive || user.isDeleted)
            return null;
        const isValid = await user.validatePassword(password);
        if (!isValid)
            return null;
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        };
    }
    async login(user) {
        const tokens = await this.issueTokenPair(user);
        this.cls.set('userId', user.id);
        this.cls.set('userRole', user.role);
        this.logger.log(`[Auth] Login: userId=${user.id} traceId=${this.cls.get('traceId')}`);
        return tokens;
    }
    async refreshTokens(userId, refreshTokenId) {
        const user = await this.userRepository.findById(userId);
        if (!user?.isActive || user.isDeleted) {
            if (!user) {
                throw new application_error_1.AccountDeletedError(userId);
            }
            if (!user.isActive) {
                throw new application_error_1.AccountInactiveError(userId);
            }
        }
        await this.tokenStore.revokeRefreshToken(userId, refreshTokenId);
        return this.issueTokenPair({
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: true,
        });
    }
    async logout(userId, jti, accessTokenTtlSeconds) {
        await this.tokenStore.blacklistAccessToken(jti, accessTokenTtlSeconds);
        await this.tokenStore.revokeAllUserTokens(userId);
        this.logger.log(`[Auth] Logout: userId=${userId}`);
    }
    async logoutAllDevices(userId) {
        await this.tokenStore.revokeAllUserTokens(userId);
        this.logger.warn(`[Auth] Logout all devices: userId=${userId}`);
    }
    async issueTokenPair(user) {
        const jti = (0, uuid_1.v4)();
        const refreshTokenId = (0, uuid_1.v4)();
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            jti,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.authConf.accessToken.secret,
                expiresIn: this.authConf.accessToken.expiresIn,
            }),
            this.jwtService.signAsync({ sub: parseInt(user.id), jti: refreshTokenId }, {
                secret: this.authConf.refreshToken.secret,
                expiresIn: this.authConf.refreshToken.expiresIn,
            }),
        ]);
        await this.tokenStore.storeRefreshToken(user.id, refreshTokenId, this.authConf.tokenBlacklistTtlSeconds);
        return { accessToken, refreshToken, refreshTokenId };
    }
    decodePayload(token) {
        try {
            return this.jwtService.decode(token);
        }
        catch {
            throw new application_error_1.InvalidTokenStructureError();
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(redis_token_store_1.TOKEN_STORE)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        nestjs_cls_1.ClsService, Object, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map