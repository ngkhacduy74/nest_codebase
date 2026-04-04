import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { ClsService } from 'nestjs-cls';
import type { Role } from '../../../user/domain/enums/role.enum';
import type { AppClsStore } from '@/modules/cls/cls.module';
import type { UserEntity } from '../../../user/domain/entities/user.entity';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import {
  type ITokenStore,
  TOKEN_STORE,
} from '../../infrastructure/token-store/redis-token-store';
import { AUTH_CONFIG_KEY, type AuthConfig } from '@/config/auth.config';
import {
  AccountInactiveError,
  AccountDeletedError,
  InvalidTokenStructureError,
} from '@/shared/domain/errors/application.error';

export interface JwtPayload {
  sub: string | number; // userId
  email: string;
  role: Role;
  jti: string; // unique token id — used for blacklisting
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly cls: ClsService<AppClsStore>,
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
    private readonly configService: ConfigService,
  ) {}

  private get authConf(): AuthConfig {
    return this.configService.get<AuthConfig>(AUTH_CONFIG_KEY)!;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUserPayload | null> {
    const user = await this.userRepository.findByEmail(email);
  
    if (!user || !user.isActive || user.isDeleted) return null;

    const isValid = await user.validatePassword(password);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async login(user: AuthUserPayload): Promise<TokenPair> {
    const tokens = await this.issueTokenPair(user);
    this.cls.set('userId', user.id);
    this.cls.set('userRole', user.role);
    this.logger.log(
      `[Auth] Login: userId=${user.id} traceId=${this.cls.get('traceId')}`,
    );
    return tokens;
  }

  async refreshTokens(
    userId: string,
    refreshTokenId: string,
  ): Promise<TokenPair> {
    const user = await this.userRepository.findById(userId);

    if (!user?.isActive || user.isDeleted) {
      if (!user) {
        throw new AccountDeletedError(userId);
      }
      if (!user.isActive) {
        throw new AccountInactiveError(userId);
      }
    }

    // This call detects reuse — throws if token was already consumed
    await this.tokenStore.revokeRefreshToken(userId, refreshTokenId);

    return this.issueTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: true,
    });
  }

  async logout(
    userId: string,
    jti: string,
    accessTokenTtlSeconds: number,
  ): Promise<void> {
    // Blacklist current access token so it cannot be reused before expiry
    await this.tokenStore.blacklistAccessToken(jti, accessTokenTtlSeconds);
    // Revoke all refresh tokens for this user
    await this.tokenStore.revokeAllUserTokens(userId);
    this.logger.log(`[Auth] Logout: userId=${userId}`);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.tokenStore.revokeAllUserTokens(userId);
    this.logger.warn(`[Auth] Logout all devices: userId=${userId}`);
  }

  private async issueTokenPair(user: AuthUserPayload): Promise<TokenPair> {
    const jti = uuidv4();
    const refreshTokenId = uuidv4();

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: this.authConf.accessToken.secret,
        expiresIn: this.authConf.accessToken.expiresIn,
      } as any),
      this.jwtService.signAsync(
        { sub: parseInt(user.id), jti: refreshTokenId },
        {
          secret: this.authConf.refreshToken.secret,
          expiresIn: this.authConf.refreshToken.expiresIn,
        } as any,
      ),
    ]);

    // Store refresh token in Redis (TTL = 7 days)
    await this.tokenStore.storeRefreshToken(
      user.id,
      refreshTokenId,
      this.authConf.tokenBlacklistTtlSeconds,
    );

    return { accessToken, refreshToken, refreshTokenId };
  }

  decodePayload(token: string): JwtPayload {
    try {
      return this.jwtService.decode<JwtPayload>(token);
    } catch {
      throw new InvalidTokenStructureError();
    }
  }
}
