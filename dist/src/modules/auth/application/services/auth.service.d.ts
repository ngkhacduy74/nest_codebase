import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import type { Role } from '../../../user/domain/enums/role.enum';
import type { AppClsStore } from '@/modules/cls/cls.module';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import { type ITokenStore } from '../../infrastructure/token-store/redis-token-store';
export interface JwtPayload {
    sub: string | number;
    email: string;
    role: Role;
    jti: string;
    iat?: number;
    exp?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}
export interface AuthUserPayload {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
}
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly cls;
    private readonly tokenStore;
    private readonly configService;
    private readonly logger;
    constructor(userRepository: IUserRepository, jwtService: JwtService, cls: ClsService<AppClsStore>, tokenStore: ITokenStore, configService: ConfigService);
    private get authConf();
    validateUser(email: string, password: string): Promise<AuthUserPayload | null>;
    login(user: AuthUserPayload): Promise<TokenPair>;
    refreshTokens(userId: string, refreshTokenId: string): Promise<TokenPair>;
    logout(userId: string, jti: string, accessTokenTtlSeconds: number): Promise<void>;
    logoutAllDevices(userId: string): Promise<void>;
    private issueTokenPair;
    decodePayload(token: string): JwtPayload;
}
